import React from 'react';
import * as I from 'lucide-react';

export function Metric({ label, value, trend }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong><small>{trend}</small></div>;
}

export function Card({ title, action, onAction, children }) {
  return <div className="card"><div className="cardHead"><h3>{title}</h3>{action && <button onClick={onAction}>{action}<I.ChevronRight size={14} /></button>}</div>{children}</div>;
}

export function Identity({ identity }) {
  return <div className="identity">{Object.entries(identity).map(([k, v]) => <div key={k}><div><span>{k}</span><b>{v}%</b></div><div className="bar"><i style={{ width: v + '%' }} /></div></div>)}</div>;
}

/** Plain factual athlete-profile block — deliberately separate from the Training Emphasis
 * percentages below it, so the app never conflates "what you told us" with "a computed score". */
export function AthleteProfile({ profile }) {
  const rows = [
    ['AGE', profile.age || '—'],
    ['SEX', profile.sex || '—'],
    ['HEIGHT', profile.height ? profile.height + ' CM' : '—'],
    ['WEIGHT', profile.weight ? profile.weight + ' KG' : '—'],
    ['TRAINING AGE', profile.trainingAge !== '' && profile.trainingAge != null ? profile.trainingAge + ' YEARS' : '—'],
    ['EXPERIENCE', profile.experience || '—'],
    ['PRIMARY GOAL', profile.goal || '—'],
    ['SECONDARY GOAL', profile.secondaryGoal || 'None'],
    ['FREQUENCY', profile.frequency ? profile.frequency + ' DAYS' : '—'],
    ['EQUIPMENT', profile.equipment || '—'],
  ];
  return <div className="factGrid">{rows.map(([label, value]) => <div className="factItem" key={label}><span>{label}</span><b>{value}</b></div>)}</div>;
}

export function WeekStrip({ split, todayIdx }) {
  return <div className="weekStrip">{split.map(([d, type], i) => <div className={'weekDay ' + (i === todayIdx ? 'today' : '') + (type === 'Rest' ? ' rest' : '')} key={d}><span>{d}</span><b>{type}</b></div>)}</div>;
}

export function Chart({ values }) {
  const min = Math.min(...values) - 1, max = Math.max(...values) + 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1 || 1)) * 100},${100 - ((v - min) / (max - min)) * 80 - 10}`).join(' ');
  return <div className="chart"><svg viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.8" vectorEffect="non-scaling-stroke" /><line x1="0" y1="90" x2="100" y2="90" /></svg><div className="chartValue">{values.at(-1)} kg</div></div>;
}

export function Step({ title, sub, children }) {
  return <div className="step"><h2>{title}</h2><p className="stepSub">{sub}</p>{children}</div>;
}
