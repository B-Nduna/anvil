import React, { useState } from 'react';
import * as I from 'lucide-react';
import { Card } from '../ui/Shared';

const SYSTEM_SPLITS = {
  'HIT': [['MON', 'Full Body A'], ['TUE', 'Rest'], ['WED', 'Full Body B'], ['THU', 'Rest'], ['FRI', 'Full Body C'], ['SAT', 'Rest'], ['SUN', 'Rest']],
  'CLASSIC VOLUME': [['MON', 'Chest'], ['TUE', 'Back'], ['WED', 'Legs'], ['THU', 'Shoulders'], ['FRI', 'Arms'], ['SAT', 'Weak point'], ['SUN', 'Rest']],
  'HYBRID POWER': [['MON', 'Push'], ['TUE', 'Pull'], ['WED', 'Rest'], ['THU', 'Legs'], ['FRI', 'Upper'], ['SAT', 'Lower'], ['SUN', 'Rest']],
  'ATHLETIC': [['MON', 'Power'], ['TUE', 'Speed'], ['WED', 'Conditioning'], ['THU', 'Power'], ['FRI', 'Mobility'], ['SAT', 'Sport skill'], ['SUN', 'Rest']],
  'CALISTHENICS': [['MON', 'Push skill'], ['TUE', 'Pull skill'], ['WED', 'Rest'], ['THU', 'Legs'], ['FRI', 'Core + skill'], ['SAT', 'Rest'], ['SUN', 'Rest']],
  'PILATES': [['MON', 'Mat flow'], ['TUE', 'Rest'], ['WED', 'Core + control'], ['THU', 'Rest'], ['FRI', 'Mobility flow'], ['SAT', 'Rest'], ['SUN', 'Rest']],
};

export default function Programs({ data, setData, notify }) {
  const [split, setSplit] = useState(data.split);
  const save = () => { setData(d => ({ ...d, split })); notify('Split saved'); };
  const applySystem = name => { const s = SYSTEM_SPLITS[name]; if (s) { setSplit(s); setData(d => ({ ...d, split: s })); notify(name + ' applied to your weekly split'); } };
  return <section className="page">
    <div className="hero compact"><div><span className="eyebrow">PROGRAM BUILDER</span><h2>YOUR SPLIT</h2><p>Build the week around how you actually train.</p></div><button className="primary" onClick={save}><I.Save size={16} /> Save split</button></div>
    <Card title="Weekly split"><div className="splitGrid">{split.map(([day, work], i) => <div className="splitDay" key={day}><span>{day}</span><input value={work} onChange={e => setSplit(s => s.map((x, j) => j === i ? [x[0], e.target.value] : x))} /></div>)}</div></Card>
    <div className="sectionTitle"><div><span className="eyebrow">SYSTEMS</span><h2>Elite-inspired methodologies</h2></div></div>
    <div className="grid three">{[['HIT', 'Low volume · high effort', 'Dorian-inspired'], ['CLASSIC VOLUME', 'High volume · compounds', 'Ronnie-inspired'], ['HYBRID POWER', 'Strength + hypertrophy', 'Modern hybrid'], ['ATHLETIC', 'Speed · power · conditioning', 'Performance'], ['CALISTHENICS', 'Skill + relative strength', 'Bodyweight'], ['PILATES', 'Control · core · mobility', 'Movement']].map(x => <div className="programCard" key={x[0]}><span>{x[2]}</span><h3>{x[0]}</h3><p>{x[1]}</p><button className="secondary" onClick={() => applySystem(x[0])}>Apply to split <I.ArrowUpRight size={15} /></button></div>)}</div>
  </section>;
}
