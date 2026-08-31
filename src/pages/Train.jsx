import React, { useState } from 'react';
import * as I from 'lucide-react';
import { STYLE_POOL } from '../engine/calendar';
import { relativeLabel, weeklyCount } from '../engine/workoutDates';

export default function Train({ data, setData, start, notify, addWorkout, generate }) {
  const [filter, setFilter] = useState('All');
  const [picker, setPicker] = useState(false);
  const shown = data.workouts.filter(w => {
    const label = relativeLabel(w);
    if (filter === 'All') return true;
    if (filter === 'This week') return label === 'Today' || label === 'Yesterday' || /^\d days? ago/.test(label);
    if (filter === 'Completed') return label !== 'Today';
    return true;
  });
  const del = (id, e) => { e.stopPropagation(); if (confirm("Delete this workout? This can't be undone.")) { setData(d => ({ ...d, workouts: d.workouts.filter(w => w.id !== id) })); notify('Workout deleted'); } };
  const pool = STYLE_POOL[data.profile.style] || STYLE_POOL['Hybrid'];

  return <section className="page">
    <div className="toolbar">
      <div className="filters">{['All', 'This week', 'Completed'].map(x => <button key={x} className={'chip ' + (filter === x ? 'active' : '')} onClick={() => setFilter(x)}>{x}</button>)}</div>
      <div className="pickerWrap">
        <button className="primary" onClick={() => setPicker(p => !p)}><I.Plus size={17} /> Custom workout</button>
        {picker && <div className="pickerMenu">
          <span className="pickerLabel">Generate for a focus</span>
          {pool.map(f => <button key={f} onClick={() => { generate(f); setPicker(false); }}>{f}</button>)}
          <span className="pickerDivider" />
          <button onClick={() => { addWorkout(); setPicker(false); }}>Blank workout</button>
        </div>}
      </div>
    </div>
    {shown.length ? <div className="grid three">{shown.map(w => { const label = relativeLabel(w); return <div className="workoutCard" key={w.id}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}><span className="tag">{label === 'Today' ? 'TODAY' : label.toUpperCase()}</span><button onClick={e => del(w.id, e)} style={{ background: 'none', color: '#666f75' }}><I.Trash2 size={14} /></button></div>
      <h3>{w.name}</h3><p>{w.exercises.length || 0} exercises · {w.duration || 60} min</p>
      <div className="workoutStats"><span><b>{(w.volume || 0).toLocaleString()}</b> kg</span><span><b>{w.exercises.reduce((a, e) => a + e.sets.length, 0)}</b> sets</span></div>
      <button className="secondary" onClick={() => start(w)}>{label === 'Today' ? 'Continue' : 'View workout'} <I.ArrowUpRight size={16} /></button>
    </div>; })}</div> : <div className="emptyState"><I.Dumbbell size={22} /><p>{data.workouts.length ? 'No workouts match this filter.' : "No workouts logged yet — start today's session from Today, or generate a custom one here."}</p></div>}
  </section>;
}
