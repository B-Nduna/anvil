import React from 'react';
import * as I from 'lucide-react';
import { generateWorkout } from '../engine/workoutEngine';
import { relativeLabel } from '../engine/workoutDates';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

export default function Today({ data, go, start, weeklyDone, freqTarget, streak }) {
  const todayIdx = (new Date().getDay() + 6) % 7; // Mon=0
  const todayEntry = data.split[todayIdx] || ['', 'Rest'];
  const isRest = todayEntry[1] === 'Rest';
  const already = data.workouts.find(w => relativeLabel(w) === 'Today');
  const target = already || { id: 'new', ...generateWorkout(data.profile, todayEntry[1], data.prs, data.workouts) };
  const setCount = target.exercises.reduce((a, e) => a + e.sets.length, 0);
  const estMinutes = already ? already.duration : Math.round(target.exercises.length * 8 + setCount * 1.2);

  const recent = data.workouts.slice(0, 3);

  return <section className="today page">
    <div className="todayHead"><span className="todayGreeting">{greeting()}{data.profile.name ? `, ${data.profile.name.split(' ')[0]}` : ''}</span><span className="todayProgram">{data.profile.goal ? data.profile.goal.toUpperCase() : 'YOUR PROGRAM'}{data.profile.style ? ' · ' + data.profile.style.toUpperCase() : ''}</span></div>

    {isRest && !already ? (
      <div className="heroRest">
        <span className="tag">TODAY</span>
        <h1>REST</h1>
        <p>No session scheduled. Recovery is part of the program.</p>
        <button className="secondary" onClick={() => go('train')}><I.Plus size={16} /> Log an optional session</button>
      </div>
    ) : (
      <div className="heroSession">
        <span className="tag">{already ? 'IN PROGRESS' : 'TODAY\u2019S SESSION'}</span>
        <h1>{todayEntry[1].toUpperCase()}</h1>
        <div className="heroStats">
          <div><b>{target.exercises.length}</b><span>EXERCISES</span></div>
          <div><b>{setCount}</b><span>WORKING SETS</span></div>
          <div><b>~{estMinutes}</b><span>MIN</span></div>
        </div>
        <button className="primary heroCta" onClick={() => start(target)}><I.Play size={19} fill="currentColor" /> {already ? 'Continue workout' : 'Start workout'}</button>
      </div>
    )}

    <div className="weekList">
      <span className="weekListLabel">YOUR WEEK</span>
      {data.split.map(([d, type], i) => {
        const isToday = i === todayIdx;
        return <div className={'weekRow' + (isToday ? ' isToday' : '')} key={d}>
          <span className="weekRowDay">{d}</span>
          <span className="weekRowType">{type}</span>
          {isToday && <span className="weekRowStatus">TODAY</span>}
        </div>;
      })}
    </div>

    <div className="todayStats">
      <div><b>{streak}</b><span>{streak === 1 ? 'DAY STREAK' : 'DAY STREAK'}</span></div>
      <div><b>{weeklyDone}/{freqTarget || '—'}</b><span>SESSIONS THIS WEEK</span></div>
    </div>

    {recent.length > 0 && <button className="recentLink" onClick={() => go('train')}>Recent: {recent[0].name} · {recent[0].duration} min <I.ChevronRight size={14} /></button>}
  </section>;
}
