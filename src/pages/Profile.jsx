import React, { useState } from 'react';
import * as I from 'lucide-react';
import { Card, Identity } from '../ui/Shared';
import { STYLES } from '../screens/Boot';
import { recalcIdentity } from '../engine/identity';

export default function Profile({ data, setData, notify }) {
  const [p, setP] = useState(data.profile);
  const save = () => { setData(d => ({ ...d, profile: { ...p } })); notify('Profile updated'); };
  const recalc = () => { setData(d => ({ ...d, identity: recalcIdentity(p, d.workouts) })); notify('Identity recalculated from your current profile'); };
  return <section className="page">
    <div className="profileTop"><div className="bigAvatar"><img src="/anvil-mark.png" alt="ANVIL" /></div><div><span className="eyebrow">TRAINING IDENTITY</span><h2>{p.name || 'Athlete'}</h2><p>{p.experience || '—'} · {p.goal || '—'} · {p.frequency} days/week</p></div></div>
    <div className="grid two">
      <Card title="Athlete data">
        <div className="formGrid">
          <label>Name<input value={p.name} onChange={e => setP({ ...p, name: e.target.value })} /></label>
          <label>Goal<select value={p.goal} onChange={e => setP({ ...p, goal: e.target.value })}>{['Build Muscle', 'Strength', 'Fat Loss', 'Athletic Performance', 'Mobility'].map(x => <option key={x}>{x}</option>)}</select></label>
          <label>Training style<select value={p.style} onChange={e => setP({ ...p, style: e.target.value })}>{STYLES.map(([x]) => <option key={x}>{x}</option>)}</select></label>
          <label>Experience<select value={p.experience} onChange={e => setP({ ...p, experience: e.target.value })}>{['Beginner', 'Intermediate', 'Advanced', 'Elite'].map(x => <option key={x}>{x}</option>)}</select></label>
          <label>Frequency<input type="number" min="1" max="7" value={p.frequency} onChange={e => setP({ ...p, frequency: Math.max(1, Math.min(7, Number(e.target.value) || 1)) })} /></label>
          <label>Weight (kg)<input type="number" value={p.weight} onChange={e => setP({ ...p, weight: Number(e.target.value) || 0 })} /></label>
          <label>Height (cm)<input type="number" value={p.height} onChange={e => setP({ ...p, height: Number(e.target.value) || 0 })} /></label>
        </div>
        <button className="primary full" onClick={save}><I.Save size={16} /> Save profile</button>
      </Card>
      <Card title="Training identity"><Identity identity={data.identity} /><button className="secondary full" onClick={recalc}>Recalculate identity</button></Card>
    </div>
  </section>;
}
