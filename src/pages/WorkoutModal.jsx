import React, { useEffect, useState } from 'react';
import * as I from 'lucide-react';
import { generateWorkout } from '../engine/workoutEngine';
import { findLastPerformance } from '../engine/progressiveOverload';
import { sessionDelta } from '../engine/exerciseHistory';

/** Index of the next exercise (from `from`) that still has an unlogged set — or -1 if the whole workout is done. */
function nextIncomplete(exercises, from) {
  for (let i = from; i < exercises.length; i++) if (exercises[i].sets.some(s => !s.done)) return i;
  for (let i = 0; i < from; i++) if (exercises[i].sets.some(s => !s.done)) return i;
  return -1;
}

export default function WorkoutModal({ workout, profile, prs, workouts, close, save, notify }) {
  const [w, setW] = useState(() => JSON.parse(JSON.stringify(workout)));
  const [view, setView] = useState('focus'); // 'focus' | 'edit' | 'complete'
  const [exIndex, setExIndex] = useState(() => Math.max(0, nextIncomplete(workout.exercises, 0)));
  const [ex, setEx] = useState('');
  const [closing, setClosing] = useState(false);
  const [restRunning, setRestRunning] = useState(false);
  const [restLeft, setRestLeft] = useState(0);
  const [summary, setSummary] = useState(null);
  const [startedAt] = useState(() => Date.now());
  const restBase = (w.meta && w.meta.restSec) || 90;

  useEffect(() => {
    if (!restRunning) return;
    if (restLeft <= 0) { setRestRunning(false); return; }
    const t = setInterval(() => setRestLeft(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [restRunning, restLeft]);

  const dismiss = after => { setClosing(true); setTimeout(after, 180); };
  const dayLabel = (w.name || '').split(' — ')[0];

  const currentEx = w.exercises[exIndex];
  const setIdx = currentEx ? currentEx.sets.findIndex(s => !s.done) : -1;
  const currentSet = setIdx >= 0 ? currentEx.sets[setIdx] : null;
  const last = currentEx ? findLastPerformance(currentEx.name, workouts) : null;
  const lastSet = last && last.length ? last[last.length - 1] : null;
  const delta = currentSet ? sessionDelta(currentSet.w, lastSet) : null;

  const totalSets = w.exercises.reduce((a, e) => a + e.sets.length, 0);
  const doneSets = w.exercises.reduce((a, e) => a + e.sets.filter(s => s.done).length, 0);

  const updateSet = (patch) => setW(x => ({ ...x, exercises: x.exercises.map((e, i) => i !== exIndex ? e : { ...e, sets: e.sets.map((s, j) => j !== setIdx ? s : { ...s, ...patch }) }) }));

  const finishWorkout = finalW => {
    const finished = { ...finalW, name: finalW.name.trim() || 'Untitled workout', duration: finalW.duration || Math.max(1, Math.round((Date.now() - startedAt) / 60000)), volume: finalW.exercises.reduce((a, e) => a + e.sets.reduce((s, x) => s + x.w * x.r, 0), 0) };
    save(finished, ({ newPRs }) => {
      setSummary({ ...finished, newPRs });
      setView('complete');
    });
  };

  const completeSet = () => {
    if (!currentSet) return;
    const wasLastOverall = w.exercises.every((e, i) => e.sets.every((s, j) => (i === exIndex && j === setIdx) || s.done));
    const updated = { ...w, exercises: w.exercises.map((e, i) => i !== exIndex ? e : { ...e, sets: e.sets.map((s, j) => j !== setIdx ? s : { ...s, done: true }) }) };
    setW(updated);
    if (wasLastOverall) { finishWorkout(updated); return; }
    setRestLeft(restBase);
    setRestRunning(true);
  };

  const endRest = () => {
    setRestRunning(false); setRestLeft(0);
    const nxt = nextIncomplete(w.exercises, exIndex);
    if (nxt >= 0) setExIndex(nxt);
  };

  const regenerate = () => { if (!profile) return; const fresh = generateWorkout(profile, dayLabel, prs, workouts); setW(x => ({ ...x, ...fresh })); setExIndex(0); };
  const isFresh = w.id === 'new' && doneSets === 0;

  if (view === 'complete' && summary) {
    const finish = () => dismiss(close);
    return <div className={'modalBg' + (closing ? ' closing' : '')}><div className="modal complete">
      <div className="completeBody">
        <span className="tag">SESSION COMPLETE</span>
        <h1>{dayLabel.toUpperCase() || summary.name.toUpperCase()}</h1>
        <div className="completeStats">
          <div><b>{summary.duration}</b><span>MIN</span></div>
          <div><b>{summary.exercises.reduce((a, e) => a + e.sets.length, 0)}</b><span>SETS</span></div>
          <div><b>{summary.volume.toLocaleString()}</b><span>KG VOLUME</span></div>
        </div>
        {summary.newPRs.length > 0 && <div className="prBanner">
          <span className="tag">{summary.newPRs.length} NEW {summary.newPRs.length === 1 ? 'PR' : 'PRS'}</span>
          {summary.newPRs.map(([name, val, prev]) => <div className="prBannerRow" key={name}><b>{name}</b><span>{prev} → {val} KG</span></div>)}
        </div>}
        <button className="primary heroCta" onClick={finish}>Back to Today</button>
      </div>
    </div></div>;
  }

  if (view === 'edit') {
    return <div className={'modalBg' + (closing ? ' closing' : '')}><div className="modal">
      <div className="modalHead">
        <div><span className="eyebrow">EDIT SESSION · {doneSets}/{totalSets} SETS DONE</span><input className="modalTitleInput" value={w.name} onChange={e => setW(x => ({ ...x, name: e.target.value }))} placeholder="Name this workout…" /></div>
        <div style={{ display: 'flex', gap: 8 }}>{isFresh && profile && <button className="iconBtn" onClick={regenerate} title="Regenerate exercise selection"><I.RefreshCw size={16} /></button>}<button className="secondary" onClick={() => setView('focus')}><I.Play size={14} /> Focus mode</button><button className="iconBtn" onClick={() => dismiss(close)} title="Close"><I.X /></button></div>
      </div>
      <div className="exerciseList">{w.exercises.map((e, ei) => <div className="exercise" key={ei}>
        <div className="exHead"><div><b>{String(ei + 1).padStart(2, '0')} · {e.name}</b><small>{e.progressNote || 'Working sets'}</small></div><button onClick={() => { if (confirm('Remove this exercise?')) setW(x => ({ ...x, exercises: x.exercises.filter((_, i) => i !== ei) })); }}><I.Trash2 size={16} /></button></div>
        <div className="setHead"><span>SET</span><span>KG</span><span>REPS</span><span title="Reps In Reserve">RIR</span><span /></div>
        {e.sets.map((s, si) => <div className="setRow" key={si} style={{ opacity: s.done ? 0.55 : 1 }}>
          <span>{si + 1}</span>
          <input type="number" value={s.w} onChange={ev => setW(x => ({ ...x, exercises: x.exercises.map((z, i) => i !== ei ? z : { ...z, sets: z.sets.map((t, j) => j !== si ? t : { ...t, w: Number(ev.target.value) }) }) }))} />
          <input type="number" value={s.r} onChange={ev => setW(x => ({ ...x, exercises: x.exercises.map((z, i) => i !== ei ? z : { ...z, sets: z.sets.map((t, j) => j !== si ? t : { ...t, r: Number(ev.target.value) }) }) }))} />
          <select value={s.rir} onChange={ev => setW(x => ({ ...x, exercises: x.exercises.map((z, i) => i !== ei ? z : { ...z, sets: z.sets.map((t, j) => j !== si ? t : { ...t, rir: Number(ev.target.value) }) }) }))}><option>0</option><option>1</option><option>2</option><option>3</option></select>
          <button onClick={() => setW(x => ({ ...x, exercises: x.exercises.map((z, i) => i !== ei ? z : { ...z, sets: z.sets.filter((_, j) => j !== si) }) }))}><I.X size={14} /></button>
        </div>)}
        <button className="addSet" onClick={() => setW(x => ({ ...x, exercises: x.exercises.map((z, i) => i !== ei ? z : { ...z, sets: [...z.sets, { w: z.sets.at(-1)?.w || 0, r: 0, rir: 2, done: false }] }) }))}>+ Add set</button>
      </div>)}</div>
      <div className="addExercise"><input placeholder="Add exercise…" value={ex} onChange={e => setEx(e.target.value)} onKeyDown={e => e.key === 'Enter' && ex.trim() && (setW(x => ({ ...x, exercises: [...x.exercises, { name: ex.trim(), sets: [{ w: 0, r: 0, rir: 2, done: false }] }] })), setEx(''))} /><button className="secondary" onClick={() => { if (ex.trim()) { setW(x => ({ ...x, exercises: [...x.exercises, { name: ex.trim(), sets: [{ w: 0, r: 0, rir: 2, done: false }] }] })); setEx(''); } }}><I.Plus size={16} /> Add</button></div>
      <div className="modalFoot"><button className="secondary" onClick={() => dismiss(close)}>Cancel</button><button className="primary" onClick={() => finishWorkout(w)}><I.Check size={17} /> Finish workout</button></div>
    </div></div>;
  }

  // Focus mode — one exercise, one set, at a time.
  const fmt = s => `${String(Math.floor(Math.max(s, 0) / 60)).padStart(2, '0')}:${String(Math.max(s, 0) % 60).padStart(2, '0')}`;
  return <div className={'modalBg' + (closing ? ' closing' : '')}><div className="modal focusModal">
    <div className="focusHead">
      <div><span className="eyebrow">{dayLabel.toUpperCase()}</span><span className="focusCount">{String(exIndex + 1).padStart(2, '0')} / {String(w.exercises.length).padStart(2, '0')}</span></div>
      <div style={{ display: 'flex', gap: 6 }}><button className="iconBtn" onClick={() => setView('edit')} title="Edit workout"><I.ListChecks size={16} /></button><button className="iconBtn" onClick={() => dismiss(close)} title="Close"><I.X size={16} /></button></div>
    </div>

    {restRunning ? (
      <div className="restFocus">
        <span className="tag">REST</span>
        <div className="restClock">{fmt(restLeft)}</div>
        <div className="restControls">
          <button className="secondary" onClick={() => setRestLeft(s => s + 30)}>+30</button>
          <button className="primary" onClick={endRest}>Skip</button>
          <button className="secondary" onClick={() => setRestLeft(restBase)}>Reset</button>
        </div>
      </div>
    ) : currentEx && currentSet ? (
      <div className="focusBody">
        <h1 className="focusExName">{currentEx.name}</h1>
        <span className="focusSetLabel">SET {setIdx + 1} OF {currentEx.sets.length}</span>
        <div className="focusInputs">
          <label>KG<input type="number" inputMode="decimal" value={currentSet.w} onChange={e => updateSet({ w: Number(e.target.value) })} /></label>
          <label>REPS<input type="number" inputMode="numeric" value={currentSet.r} onChange={e => updateSet({ r: Number(e.target.value) })} /></label>
          <label>RIR<select value={currentSet.rir} onChange={e => updateSet({ rir: Number(e.target.value) })}><option>0</option><option>1</option><option>2</option><option>3</option></select></label>
        </div>
        <div className="focusRefRow">
          <div><span>LAST SESSION</span><b>{lastSet ? `${lastSet.w} KG × ${lastSet.r}` : '—'}</b></div>
          <div><span>TARGET</span><b>{w.meta ? `${currentSet.w} KG × ${w.meta.repsMin}\u2013${w.meta.repsMax}` : `${currentSet.w} KG`}</b></div>
          {delta && delta.delta !== 0 && <div><span>CHANGE</span><b className={delta.delta > 0 ? 'deltaUp' : 'deltaDown'}>{delta.delta > 0 ? '+' : ''}{delta.delta} KG</b></div>}
        </div>
        <button className="primary heroCta focusComplete" onClick={completeSet}><I.Check size={19} /> Set complete</button>
      </div>
    ) : w.exercises.length === 0 ? (
      <div className="focusBody"><p className="factNote">No exercises in this workout — switch to Edit to add some.</p></div>
    ) : (
      <div className="focusBody"><p className="factNote">All sets logged for this session.</p><button className="secondary" onClick={() => setView('edit')}>Review workout</button></div>
    )}

    <div className="focusFoot">
      <button className="ghostNav" disabled={exIndex === 0} onClick={() => setExIndex(i => Math.max(0, i - 1))}><I.ChevronLeft size={16} /> Prev</button>
      <button className="ghostNav" onClick={() => setView('edit')}>Edit workout</button>
      <button className="ghostNav" disabled={exIndex >= w.exercises.length - 1} onClick={() => setExIndex(i => Math.min(w.exercises.length - 1, i + 1))}>Next <I.ChevronRight size={16} /></button>
    </div>
  </div></div>;
}
