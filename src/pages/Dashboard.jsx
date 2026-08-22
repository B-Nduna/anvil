import React from 'react';
import * as I from 'lucide-react';
import { Card, Metric, Identity, WeekStrip } from '../ui/Shared';
import { generateWorkout } from '../engine/workoutEngine';

export default function Dashboard({ data, go, start, weeklyDone, freqTarget }) {
  const todayIdx = (new Date().getDay() + 6) % 7; // Mon=0
  const todayEntry = data.split[todayIdx] || ['', 'Rest'];
  const isRest = todayEntry[1] === 'Rest';
  const already = data.workouts.find(w => w.date === 'Today');
  const target = already || { id: 'new', ...generateWorkout(data.profile, todayEntry[1], data.prs, data.workouts) };
  const goalLabel = data.profile.goal || 'General Fitness';

  return <section className="page">
    <div className="hero">
      <div><span className="eyebrow">{data.profile.style ? data.profile.style.toUpperCase() + ' · ' : ''}{(freqTarget || '—') + ' DAY PLAN'}</span><h2>{goalLabel.toUpperCase()}</h2><p>{isRest ? 'Today is a scheduled rest day.' : `Today: ${todayEntry[1]}`} · {data.profile.experience || '—'}</p></div>
      {isRest ? <button className="secondary" onClick={() => go('train')}><I.Coffee size={17} /> Rest day — log optional session</button> : <button className="primary" onClick={() => start(already ? already : target)}><I.Play size={17} fill="currentColor" /> {already ? 'Continue' : 'Start'} today's workout</button>}
    </div>
    <div className="grid four">
      <Metric label="BODYWEIGHT" value={(data.profile.weight || 0) + ' kg'} trend={data.measurements.length > 1 ? (data.profile.weight - data.measurements[1].weight <= 0 ? '↓ ' : '↑ ') + Math.abs(data.profile.weight - data.measurements[1]?.weight || 0).toFixed(1) + 'kg' : '—'} />
      <Metric label="WEEKLY GOAL" value={weeklyDone + '/' + (freqTarget || '—')} trend={freqTarget ? (weeklyDone >= freqTarget ? 'Goal met' : (freqTarget - weeklyDone) + ' to go') : 'Set in Profile'} />
      <Metric label="HYPERTROPHY" value={(data.identity.hypertrophy || 0) + '%'} trend="Training identity" />
      <Metric label="STRENGTH" value={(data.identity.strength || 0) + '%'} trend="Training identity" />
    </div>
    <div className="grid two">
      <Card title="This week's calendar" action="Edit split" onAction={() => go('program')}><WeekStrip split={data.split} todayIdx={todayIdx} /></Card>
      <Card title="Training identity" action="Edit" onAction={() => go('profile')}><Identity identity={data.identity} /></Card>
    </div>
    <div className="grid two">
      <Card title="Recent sessions" action="View all" onAction={() => go('train')}>
        {data.workouts.length ? <div className="list">{data.workouts.slice(0, 3).map(x => <div className="row" key={x.id}><div><b>{x.name}</b><small>{x.date} · {x.duration} min</small></div><strong>{(x.volume || 0).toLocaleString()} kg</strong></div>)}</div> : <div className="emptyState small"><I.Dumbbell size={20} /><p>No sessions logged yet. Start today's workout to begin your history.</p></div>}
      </Card>
      <Card title="Coach analysis">
        {data.workouts.length ? <>
          <div className="insight"><I.Activity /><div><b>{weeklyDone >= (freqTarget || 99) ? 'Weekly goal met.' : 'Keep the momentum.'}</b><p>You've logged {weeklyDone} of {freqTarget} planned sessions this week. {weeklyDone >= (freqTarget || 99) ? 'Great consistency — recovery matters just as much as the work.' : 'Stay on schedule to keep your identity scores trending up.'}</p></div></div>
          <div className="insight"><I.Target /><div><b>Progressive overload is active</b><p>Each generated workout checks your last logged session for that exercise and adjusts the weight — hit your reps with room to spare and it'll add load next time.</p></div></div>
        </> : <div className="emptyState small"><I.Sparkles size={20} /><p>Your first few sessions will unlock personalized coaching insights here.</p></div>}
      </Card>
    </div>
  </section>;
}
