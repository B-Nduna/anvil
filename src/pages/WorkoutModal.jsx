import React, { useEffect, useState } from 'react';
import * as I from 'lucide-react';
import { generateWorkout } from '../engine/workoutEngine';

const REST_DEFAULT = 90;

export default function WorkoutModal({ workout, profile, prs, workouts, close, save }) {
  const [w, setW] = useState(() => JSON.parse(JSON.stringify(workout)));
  const [ex, setEx] = useState('');
  const restForScheme = wk => (wk.meta && wk.meta.restSec) || REST_DEFAULT;
  const [restLeft, setRestLeft] = useState(() => restForScheme(workout));
  const [restRunning, setRestRunning] = useState(false);
  const [startedAt] = useState(() => Date.now());

  useEffect(() => {
    if (!restRunning) return;
    if (restLeft <= 0) { setRestRunning(false); return; }
    const t = setInterval(() => setRestLeft(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [restRunning, restLeft]);

  const fmt = s => `${String(Math.floor(Math.max(s, 0) / 60)).padStart(2, '0')}:${String(Math.max(s, 0) % 60).padStart(2, '0')}`;
  const addEx = () => { if (ex.trim()) { setW(x => ({ ...x, exercises: [...x.exercises, { name: ex.trim(), sets: [{ w: 0, r: 0, rir: 2, done: false }] }] })); setEx(''); } };
  const update = (ei, si, k, v) => setW(x => ({ ...x, exercises: x.exercises.map((e, i) => i !== ei ? e : { ...e, sets: e.sets.map((s, j) => j !== si ? s : { ...s, [k]: Number(v) }) }) }));
  const addSet = ei => setW(x => ({ ...x, exercises: x.exercises.map((e, i) => i !== ei ? e : { ...e, sets: [...e.sets, { w: e.sets.at(-1)?.w || 0, r: 0, rir: 2, done: false }] }) }));
  const toggleDone = (ei, si) => { setW(x => ({ ...x, exercises: x.exercises.map((e, i) => i !== ei ? e : { ...e, sets: e.sets.map((s, j) => j !== si ? s : { ...s, done: !s.done }) }) })); setRestLeft(restForScheme(w)); setRestRunning(true); };
  const removeExercise = ei => { if (confirm('Remove this exercise and its logged sets?')) setW(x => ({ ...x, exercises: x.exercises.filter((_, i) => i !== ei) })); };

  const totalSets = w.exercises.reduce((a, e) => a + e.sets.length, 0);
  const doneSets = w.exercises.reduce((a, e) => a + e.sets.filter(s => s.done).length, 0);
  const pct = totalSets ? Math.round((doneSets / totalSets) * 100) : 0;
  const isFresh = w.id === 'new' && doneSets === 0;
  const dayLabel = (w.name || '').split(' — ')[0];
  const regenerate = () => { if (!profile) return; const fresh = generateWorkout(profile, dayLabel, prs, workouts); setW(x => ({ ...x, ...fresh })); setRestLeft(restForScheme(fresh)); };

  return <div className="modalBg"><div className="modal">
    <div className="modalHead">
      <div><span className="eyebrow">ACTIVE SESSION · {pct}% DONE{w.meta && <span className="schemeBadge">{w.meta.label} · {w.meta.sets}×{w.meta.repsMin}-{w.meta.repsMax} · RIR {w.meta.rir}{w.tier ? ` · ${w.tier} tier` : ''}</span>}</span><input className="modalTitleInput" value={w.name} onChange={e => setW(x => ({ ...x, name: e.target.value }))} placeholder="Name this workout…" /></div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>{isFresh && profile && <button className="iconBtn" onClick={regenerate} title="Regenerate exercise selection"><I.RefreshCw size={16} /></button>}<button className="iconBtn" onClick={close} title="Close without finishing"><I.X /></button></div>
    </div>
    <div className="rest">REST <b style={{ color: restLeft <= 10 && restRunning ? '#ff6b6b' : undefined }}>{fmt(restLeft)}</b><span className="restHint">auto-starts when you check off a set</span><button onClick={() => setRestRunning(r => !r)}>{restRunning ? <><I.Pause size={15} /> Pause</> : <><I.Play size={15} /> Start</>}</button><button onClick={() => { setRestLeft(restForScheme(w)); setRestRunning(false); }}><I.TimerReset size={15} /> Reset</button></div>
    {!w.exercises.length && <div className="emptyState"><I.Dumbbell size={22} /><p>No exercises yet — add your first one below to start logging sets.</p></div>}
    <div className="exerciseList">{w.exercises.map((e, ei) => <div className="exercise" key={ei}>
      <div className="exHead"><div><b>{String(ei + 1).padStart(2, '0')} · {e.name}</b><small>{e.progressNote || 'Working sets'}</small></div><button onClick={() => removeExercise(ei)} title="Remove exercise"><I.Trash2 size={16} /></button></div>
      <div className="setHead"><span>SET</span><span>KG</span><span>REPS</span><span title="Reps In Reserve — how many more reps you could've done">RIR ⓘ</span><span /></div>
      {e.sets.map((s, si) => <div className="setRow" key={si} style={{ opacity: s.done ? 0.55 : 1 }}>
        <span>{si + 1}</span>
        <input type="number" value={s.w} onChange={ev => update(ei, si, 'w', ev.target.value)} />
        <input type="number" value={s.r} onChange={ev => update(ei, si, 'r', ev.target.value)} />
        <select value={s.rir} onChange={ev => update(ei, si, 'rir', ev.target.value)}><option>0</option><option>1</option><option>2</option><option>3</option></select>
        <button onClick={() => toggleDone(ei, si)} title={s.done ? 'Mark set not done' : 'Mark set done — starts rest timer'}><I.Check size={14} color={s.done ? '#e5a94a' : undefined} /></button>
        <button onClick={() => setW(x => ({ ...x, exercises: x.exercises.map((z, i) => i !== ei ? z : { ...z, sets: z.sets.filter((_, j) => j !== si) }) }))} title="Remove set"><I.X size={14} /></button>
      </div>)}
      <button className="addSet" onClick={() => addSet(ei)}>+ Add set</button>
    </div>)}
    <div className="addExercise"><input placeholder="Add exercise…" value={ex} onChange={e => setEx(e.target.value)} onKeyDown={e => e.key === 'Enter' && addEx()} /><button className="secondary" onClick={addEx}><I.Plus size={16} /> Add</button></div>
    </div>
    <div className="modalFoot"><button className="secondary" onClick={close}>Cancel</button><button className="primary" onClick={() => save({ ...w, name: w.name.trim() || 'Untitled workout', duration: w.duration || Math.max(1, Math.round((Date.now() - startedAt) / 60000)), volume: w.exercises.reduce((a, e) => a + e.sets.reduce((s, x) => s + x.w * x.r, 0), 0) })}><I.Check size={17} /> Finish workout</button></div>
  </div></div>;
}
