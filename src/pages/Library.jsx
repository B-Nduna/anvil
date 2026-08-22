import React, { useState } from 'react';
import * as I from 'lucide-react';
import { EXERCISE_DB } from '../engine/workoutEngine';

const MUSCLES = ['All', 'Chest', 'Back', 'Shoulders', 'Quads', 'Hamstrings', 'Glutes', 'Biceps', 'Triceps', 'Calves', 'Core'];

export default function Library({ notify }) {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('All');
  const [muscleFilter, setMuscleFilter] = useState('All');
  const matched = EXERCISE_DB.filter(e => (filter === 'All' || e.equipment === filter) && (muscleFilter === 'All' || e.muscle === muscleFilter) && e.name.toLowerCase().includes(q.toLowerCase()));
  const list = matched.slice(0, 60);
  return <section className="page">
    <div className="search"><I.Search size={18} /><input placeholder={`Search ${EXERCISE_DB.length} exercises…`} value={q} onChange={e => setQ(e.target.value)} /></div>
    <div className="filters">{['All', 'Barbell', 'Dumbbells', 'Cable', 'Machine', 'Bodyweight'].map(x => <button className={'chip ' + (filter === x ? 'active' : '')} onClick={() => setFilter(x)} key={x}>{x}</button>)}</div>
    <div className="filters" style={{ marginTop: 8 }}>{MUSCLES.map(x => <button className={'chip ' + (muscleFilter === x ? 'active' : '')} onClick={() => setMuscleFilter(x)} key={x}>{x}</button>)}</div>
    {list.length ? <>
      <div className="table">{list.map((e, i) => <div className="tableRow" key={e.name}><div className="exerciseGlyph">{String(i + 1).padStart(2, '0')}</div><div><b>{e.name}</b><small>{e.muscle}</small></div><span>{e.equipment}</span><span className="level">{e.difficulty}</span><button onClick={() => notify(e.name + ' added to builder')} title="Add to workout builder"><I.Plus size={16} /></button></div>)}</div>
      {matched.length > list.length && <p style={{ color: 'var(--muted)', fontSize: 11, marginTop: 10 }}>Showing {list.length} of {matched.length} matches — refine your search to see more.</p>}
    </> : <div className="emptyState"><I.Search size={22} /><p>No exercises match "{q}". Try a different search or filter.</p></div>}
  </section>;
}
