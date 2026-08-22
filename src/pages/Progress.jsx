import React, { useState } from 'react';
import * as I from 'lucide-react';
import { Card, Metric, Chart } from '../ui/Shared';
import { classifyLift } from '../engine/strengthStandards';

const PR_LIFT_KEY = { 'Bench Press': 'bench', 'Squat': 'squat', 'Deadlift': 'deadlift' };

export default function Progress({ data, setData, notify }) {
  const [form, setForm] = useState({ weight: data.profile.weight, waist: data.measurements[0]?.waist || '', arm: data.measurements[0]?.arm || '' });
  const bench = data.prs.find(p => p[0] === 'Bench Press');
  const weekVolume = data.workouts.reduce((a, w) => a + (w.volume || 0), 0);
  const save = () => {
    const weight = Number(form.weight), waist = Number(form.waist), arm = Number(form.arm);
    if (!weight || !waist || !arm) { notify('Enter valid numbers for all fields'); return; }
    const row = { date: 'Today', weight, waist, arm };
    setData(d => ({ ...d, profile: { ...d.profile, weight }, measurements: [row, ...d.measurements] }));
    notify('Measurement logged');
  };
  return <section className="page">
    <div className="grid three">
      <Metric label="CURRENT WEIGHT" value={(data.profile.weight || 0) + ' kg'} trend={data.measurements.length > 1 ? (data.profile.weight - data.measurements[data.measurements.length - 1].weight <= 0 ? '↓ ' : '↑ ') + Math.abs(data.profile.weight - data.measurements[data.measurements.length - 1].weight).toFixed(1) + 'kg' : '—'} />
      <Metric label="BENCH EST. 1RM" value={(bench ? bench[1] : 0) + ' kg'} trend="Latest PR" />
      <Metric label="TOTAL VOLUME" value={(weekVolume / 1000).toFixed(1) + 'k kg'} trend="Logged sessions" />
    </div>
    <div className="grid two">
      {data.measurements.length ? <Card title="Bodyweight trend"><Chart values={data.measurements.slice(0, 7).map(x => x.weight).reverse()} /><div className="chartLabels"><span>{data.measurements.length > 1 ? data.measurements[Math.min(6, data.measurements.length - 1)].date : 'START'}</span><span>TODAY</span></div></Card> : <Card title="Bodyweight trend"><div className="emptyState small"><I.TrendingUp size={20} /><p>Log your first measurement to start tracking your trend.</p></div></Card>}
      <Card title="Log measurements">
        <div className="formGrid"><label>Weight (kg)<input type="number" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} /></label><label>Waist (cm)<input type="number" value={form.waist} onChange={e => setForm({ ...form, waist: e.target.value })} /></label><label>Arm (cm)<input type="number" value={form.arm} onChange={e => setForm({ ...form, arm: e.target.value })} /></label></div>
        <button className="primary full" onClick={save}><I.Plus size={16} /> Log measurement</button>
      </Card>
    </div>
    <Card title="Strength records">
      <div className="prGrid">{data.prs.map(([n, v]) => {
        const lift = PR_LIFT_KEY[n];
        const level = lift && v > 0 && data.profile.weight ? classifyLift(lift, data.profile.weight, v) : null;
        return <div className="pr" key={n}><span>{n}</span><strong>{v} kg</strong><small>{level ? `${level} for your bodyweight` : 'Estimated 1RM'}</small></div>;
      })}</div>
    </Card>
  </section>;
}
