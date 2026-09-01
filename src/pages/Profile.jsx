import React, { useState } from 'react';
import * as I from 'lucide-react';
import { Card, Identity, AthleteProfile } from '../ui/Shared';
import { STYLES } from '../screens/Boot';
import { recalcIdentity } from '../engine/identity';
import { buildCalendar, calendarInputsChanged } from '../engine/calendar';
import { LIMITATION_OPTIONS } from '../engine/workoutEngine';
import { asset } from '../assetPath';

const GOAL_OPTIONS = ['Build Muscle', 'Strength', 'Fat Loss', 'Athletic Performance', 'Mobility'];
const EXPERIENCE_OPTIONS = ['Beginner', 'Intermediate', 'Advanced', 'Elite'];
const EQUIPMENT_OPTIONS = ['Full gym', 'Home gym', 'Dumbbells', 'Bodyweight', 'Minimal equipment'];
const SEX_OPTIONS = ['Male', 'Female', 'Prefer not to say'];

export default function Profile({ data, setData, notify, onReset }) {
  const [p, setP] = useState(data.profile);
  const set = (k, v) => setP(x => ({ ...x, [k]: v }));
  const toggleLimitation = l => setP(x => ({ ...x, limitations: x.limitations.includes(l) ? x.limitations.filter(y => y !== l) : [...x.limitations, l] }));
  // Saving a profile edit recalculates everything derived from it automatically — no separate
  // manual step needed for Training Emphasis (and the weekly calendar, if frequency/style/preferred
  // days changed) to reflect the new answers. The Recalculate button below stays as a manual
  // refresh — useful after logging new sessions without touching the profile itself.
  const save = () => {
    setData(d => {
      const rebuildSplit = calendarInputsChanged(d.profile, p);
      return {
        ...d,
        profile: { ...p },
        identity: recalcIdentity(p, d.workouts),
        split: rebuildSplit ? buildCalendar(p) : d.split,
      };
    });
    notify('Profile saved — training emphasis recalculated');
  };
  const recalc = () => { setData(d => ({ ...d, identity: recalcIdentity(p, d.workouts) })); notify('Training emphasis recalculated from your current profile'); };

  return <section className="page">
    <div className="profileTop"><div className="bigAvatar"><img src={asset("anvil-mark.png")} alt="ANVIL" /></div><div><span className="eyebrow">ATHLETE PROFILE</span><h2>{p.name || 'Athlete'}</h2><p>{p.experience || '—'} · {p.goal || '—'} · {p.frequency} days/week</p></div></div>

    <div className="grid two">
      <Card title="Snapshot"><AthleteProfile profile={p} /></Card>
      <Card title="Training emphasis"><Identity identity={data.identity} /><p className="factNote">Describes emphasis in your program, not a fixed trait. Recalculates automatically when you save profile changes below — use Recalculate to refresh it after logging new sessions without changing your profile.</p><button className="secondary full" onClick={recalc}>Recalculate</button></Card>
    </div>

    <div className="sectionTitle"><div><span className="eyebrow">EDIT</span><h2>About you</h2></div></div>
    <Card title="Identity & baseline">
      <div className="formGrid">
        <label>Name<input value={p.name} onChange={e => set('name', e.target.value)} /></label>
        <label>Age<input type="number" value={p.age} onChange={e => set('age', Number(e.target.value) || '')} /></label>
        <label>Weight (kg)<input type="number" value={p.weight} onChange={e => set('weight', Number(e.target.value) || 0)} /></label>
        <label>Height (cm)<input type="number" value={p.height} onChange={e => set('height', Number(e.target.value) || 0)} /></label>
        <label>Body fat % <em style={{ opacity: 0.6 }}>(optional)</em><input type="number" value={p.bodyFatPct} onChange={e => set('bodyFatPct', e.target.value === '' ? '' : Number(e.target.value))} /></label>
      </div>
      <div className="onboardSubgroup"><span className="onboardSubLabel">Sex</span><p className="onboardHint">Sex-specific strength standards are optional reference data. They do not determine your training program.</p>
        <div className="chipRow">{SEX_OPTIONS.map(s => <button key={s} className={'chipToggle ' + (p.sex === s ? 'active' : '')} onClick={() => set('sex', s)}>{s}</button>)}</div>
      </div>
    </Card>

    <div className="sectionTitle"><div><span className="eyebrow">EDIT</span><h2>Training history</h2></div></div>
    <Card title="Experience">
      <div className="formGrid"><label>Training age (years)<input type="number" min="0" step="0.5" value={p.trainingAge} onChange={e => set('trainingAge', Number(e.target.value) || 0)} /></label></div>
      <div className="onboardSubgroup"><span className="onboardSubLabel">Experience level</span>
        <div className="chipRow">{EXPERIENCE_OPTIONS.map(x => <button key={x} className={'chipToggle ' + (p.experience === x ? 'active' : '')} onClick={() => set('experience', x)}>{x}</button>)}</div>
      </div>
      <div className="onboardSubgroup"><span className="onboardSubLabel">Training notes</span>
        <textarea className="onboardTextarea" value={p.trainingNotes} onChange={e => set('trainingNotes', e.target.value)} rows={2} />
      </div>
    </Card>

    <div className="sectionTitle"><div><span className="eyebrow">EDIT</span><h2>Goals</h2></div></div>
    <Card title="Focus">
      <div className="onboardSubgroup"><span className="onboardSubLabel">Primary goal</span>
        <div className="chipRow">{GOAL_OPTIONS.map(x => <button key={x} className={'chipToggle ' + (p.goal === x ? 'active' : '')} onClick={() => set('goal', x)}>{x}</button>)}</div>
      </div>
      <div className="onboardSubgroup"><span className="onboardSubLabel">Secondary goal</span>
        <div className="chipRow"><button className={'chipToggle ' + (!p.secondaryGoal ? 'active' : '')} onClick={() => set('secondaryGoal', '')}>None</button>{GOAL_OPTIONS.filter(x => x !== p.goal).map(x => <button key={x} className={'chipToggle ' + (p.secondaryGoal === x ? 'active' : '')} onClick={() => set('secondaryGoal', x)}>{x}</button>)}</div>
      </div>
      <div className="formGrid" style={{ marginTop: 14 }}><label>Target bodyweight (kg)<input type="number" value={p.targetWeight} onChange={e => set('targetWeight', e.target.value === '' ? '' : Number(e.target.value))} /></label><label>Target date<input type="date" value={p.targetDate} onChange={e => set('targetDate', e.target.value)} /></label></div>
    </Card>

    <div className="sectionTitle"><div><span className="eyebrow">EDIT</span><h2>Training style & availability</h2></div></div>
    <Card title="Program shape">
      <div className="formGrid">
        <label>Training style<select value={p.style} onChange={e => set('style', e.target.value)}>{STYLES.map(([x]) => <option key={x}>{x}</option>)}</select></label>
        <label>Frequency (days/week)<input type="number" min="1" max="7" value={p.frequency} onChange={e => set('frequency', Math.max(1, Math.min(7, Number(e.target.value) || 1)))} /></label>
        <label>Session length (min)<input type="number" min="15" step="5" value={p.sessionDuration} onChange={e => set('sessionDuration', Number(e.target.value) || 60)} /></label>
        <label>Equipment<select value={p.equipment} onChange={e => set('equipment', e.target.value)}>{EQUIPMENT_OPTIONS.map(x => <option key={x}>{x}</option>)}</select></label>
        <label>Cardio preference <em style={{ opacity: 0.6 }}>(optional)</em><select value={p.cardioPreference} onChange={e => set('cardioPreference', e.target.value)}><option value="">Not set</option><option>Low</option><option>Moderate</option><option>High</option></select></label>
      </div>
    </Card>

    <div className="sectionTitle"><div><span className="eyebrow">EDIT</span><h2>Limitations</h2></div></div>
    <Card title="Training limitations">
      <p className="onboardHint">Entirely optional. A simple exercise filter, not medical guidance.</p>
      <div className="chipRow">
        <button className={'chipToggle ' + (!p.limitations.length ? 'active' : '')} onClick={() => set('limitations', [])}>None</button>
        {LIMITATION_OPTIONS.map(l => <button key={l} className={'chipToggle ' + (p.limitations.includes(l) ? 'active' : '')} onClick={() => toggleLimitation(l)}>{l}</button>)}
      </div>
      <div className="onboardSubgroup"><span className="onboardSubLabel">Notes <em>(stored and shown during workouts, not auto-filtered)</em></span>
        <textarea className="onboardTextarea" value={p.limitationNotes} onChange={e => set('limitationNotes', e.target.value)} rows={2} />
      </div>
    </Card>

    <button className="primary full" onClick={save} style={{ marginTop: 4 }}><I.Save size={16} /> Save profile</button>

    <div className="sectionTitle"><div><span className="eyebrow">ACCOUNT</span><h2>Session</h2></div></div>
    <Card title="Account">
      <p className="factNote">Signing out clears your profile, program and workout history from this device.</p>
      <button className="secondary full" onClick={() => { if (confirm('Sign out and reset all data? This clears your profile, program and workout history.')) onReset(); }}><I.RotateCcw size={16} /> Reset & sign out</button>
    </Card>
  </section>;
}
