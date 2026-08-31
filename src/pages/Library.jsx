import React, { useState } from 'react';
import * as I from 'lucide-react';
import { EXERCISE_DB } from '../engine/workoutEngine';
import { exerciseHistory } from '../engine/exerciseHistory';

const MUSCLES = ['All', 'Chest', 'Back', 'Shoulders', 'Quads', 'Hamstrings', 'Glutes', 'Biceps', 'Triceps', 'Calves', 'Core'];

export default function Library({ notify, workouts }) {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('All');
  const [muscleFilter, setMuscleFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const matched = EXERCISE_DB.filter(e => (filter === 'All' || e.equipment === filter) && (muscleFilter === 'All' || e.muscle === muscleFilter) && e.name.toLowerCase().includes(q.toLowerCase()));
  const list = matched.slice(0, 60);

  return <section className="page">
    <div className="search"><I.Search size={18} /><input placeholder={`Search ${EXERCISE_DB.length} exercises…`} value={q} onChange={e => setQ(e.target.value)} /></div>
    <div className="filters">{['All', 'Barbell', 'Dumbbells', 'Cable', 'Machine', 'Bodyweight'].map(x => <button className={'chip ' + (filter === x ? 'active' : '')} onClick={() => setFilter(x)} key={x}>{x}</button>)}</div>
    <div className="filters" style={{ marginTop: 8 }}>{MUSCLES.map(x => <button className={'chip ' + (muscleFilter === x ? 'active' : '')} onClick={() => setMuscleFilter(x)} key={x}>{x}</button>)}</div>
    {list.length ? <>
      <div className="table">{list.map((e, i) => <div className="tableRow clickable" key={e.name} onClick={() => setSelected(e)}><div className="exerciseGlyph">{String(i + 1).padStart(2, '0')}</div><div><b>{e.name}</b><small>{e.muscle}</small></div><span>{e.equipment}</span><span className="level">{e.difficulty}</span><button onClick={ev => { ev.stopPropagation(); notify(e.name + ' added to builder'); }} title="Add to workout builder"><I.Plus size={16} /></button></div>)}</div>
      {matched.length > list.length && <p style={{ color: 'var(--muted)', fontSize: 11, marginTop: 10 }}>Showing {list.length} of {matched.length} matches — refine your search to see more.</p>}
    </> : <div className="emptyState"><I.Search size={22} /><p>No exercises match "{q}". Try a different search or filter.</p></div>}

    {selected && <ExerciseDetail exercise={selected} workouts={workouts} close={() => setSelected(null)} notify={notify} />}
  </section>;
}

const TREND_LABEL = { improving: 'Trending upward', declining: 'Trending down', stable: 'Holding steady' };
const TREND_ICON = { improving: I.TrendingUp, declining: I.TrendingDown, stable: I.Minus };

function ExerciseDetail({ exercise, workouts, close, notify }) {
  const [closing, setClosing] = useState(false);
  const dismiss = () => { setClosing(true); setTimeout(close, 180); };
  const h = exerciseHistory(exercise.name, workouts);
  const TrendIcon = h ? TREND_ICON[h.trend] : null;

  return <div className={'modalBg' + (closing ? ' closing' : '')} onClick={dismiss}><div className="modal detailModal" onClick={e => e.stopPropagation()}>
    <div className="modalHead">
      <div><span className="eyebrow">{exercise.muscle.toUpperCase()} · {exercise.equipment.toUpperCase()}</span><h2 className="detailTitle">{exercise.name}</h2></div>
      <button className="iconBtn" onClick={dismiss} title="Close"><I.X /></button>
    </div>
    <div className="detailBody">
      <div className="detailMetaRow">
        <div><span>PRIMARY MUSCLE</span><b>{exercise.muscle}</b></div>
        <div><span>EQUIPMENT</span><b>{exercise.equipment}</b></div>
        <div><span>DIFFICULTY</span><b>{exercise.difficulty}</b></div>
      </div>

      {h ? <>
        <div className="detailHistoryHead">
          <span>YOUR HISTORY</span>
          {TrendIcon && <span className={'trendBadge trend-' + h.trend}><TrendIcon size={13} /> {TREND_LABEL[h.trend]}</span>}
        </div>
        <div className="prGrid">
          <div className="pr"><span>BEST</span><strong>{h.weightPR.top.w} × {h.weightPR.top.r}</strong><small>Weight PR</small></div>
          <div className="pr"><span>LAST</span><strong>{h.last.top.w} × {h.last.top.r}</strong><small>Most recent</small></div>
          <div className="pr"><span>EST. 1RM</span><strong>{h.est1RMPR.est1RM} kg</strong><small>Best estimate</small></div>
        </div>
        {h.previous && <p className="factNote">{h.sessionsLogged} session{h.sessionsLogged === 1 ? '' : 's'} logged. Previous session: {h.previous.top.w} × {h.previous.top.r}.</p>}
      </> : <div className="emptyState small"><I.History size={20} /><p>No history yet — this fills in once you've logged {exercise.name} in a session.</p></div>}
    </div>
    <div className="modalFoot"><button className="primary full" onClick={() => { notify(exercise.name + ' added to builder'); dismiss(); }}><I.Plus size={16} /> Add to workout</button></div>
  </div></div>;
}
