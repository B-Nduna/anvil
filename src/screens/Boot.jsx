import React, { useEffect, useState } from 'react';
import * as I from 'lucide-react';
import { Step } from '../ui/Shared';
import { DAYS } from '../engine/calendar';
import { LIMITATION_OPTIONS } from '../engine/workoutEngine';
import { asset } from '../assetPath';

export function LoadingScreen() {
  return <div className="bootScreen"><div className="bootMark"><img src={asset("anvil-mark.png")} alt="ANVIL" /></div><div className="bootWord">ANVIL</div><div className="bootSpin"><i /></div></div>;
}

export function AuthScreen({ onSignIn, onGuest, onDemo }) {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState(''); const [name, setName] = useState(''); const [pass, setPass] = useState('');
  const submit = e => { e.preventDefault(); if (!email || !pass) return; onSignIn({ name: name || email.split('@')[0], email }); };
  return <div className="authScreen"><div className="authCard">
    <div className="brand center"><span className="mark"><img src={asset("anvil-mark.png")} alt="ANVIL" /></span><div><b>ANVIL</b><small>TRAINING OS</small></div></div>
    <h1 className="authTitle">Train like you mean it.</h1>
    <p className="authSub">No fluff, no feeds — just your training, tracked properly.</p>
    <div className="authTabs"><button className={mode === 'signin' ? 'active' : ''} onClick={() => setMode('signin')}>Sign in</button><button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>Create account</button></div>
    <form onSubmit={submit} className="authForm">
      {mode === 'signup' && <label>Name<input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required /></label>}
      <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required /></label>
      <label>Password<input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" required /></label>
      <button className="primary full" type="submit">{mode === 'signin' ? 'Sign in' : 'Create account'}</button>
    </form>
    <div className="authAlt"><button onClick={onGuest}><I.UserRound size={15} /> Continue as guest</button><button onClick={onDemo}><I.Sparkles size={15} /> Explore with demo data</button></div>
  </div></div>;
}

const GOALS = [['Build Muscle', I.Dumbbell, 'Hypertrophy-focused training'], ['Strength', I.Anvil, 'Get heavier on the big lifts'], ['Fat Loss', I.Flame, 'Lean out while keeping muscle'], ['Athletic Performance', I.Zap, 'Speed, power and conditioning'], ['Mobility', I.Wind, 'Move better, control your body']];
export const STYLES = [['Bodybuilding', 'Chest/back/legs split, hypertrophy focus'], ['Powerlifting', 'Squat, bench, deadlift progression'], ['Calisthenics', 'Skill work + bodyweight strength'], ['Olympic lifting', 'Snatch, clean & jerk technique'], ['Athletic', 'Speed, power, agility'], ['Pilates', 'Control, core, mobility'], ['Hybrid', 'Strength + hypertrophy blend'], ['Functional', 'General full-body conditioning']];
const EXPERIENCE = [['Beginner', '0–1 years training'], ['Intermediate', '1–3 years, knows the lifts'], ['Advanced', '3+ years, structured training'], ['Elite', 'Competitive / highly trained']];
const EQUIPMENT = [['Full gym', I.Building2], ['Home gym', I.Home], ['Dumbbells', I.Dumbbell], ['Bodyweight', I.PersonStanding], ['Minimal equipment', I.Package]];
const SEX_OPTIONS = ['Male', 'Female', 'Prefer not to say'];
const DURATIONS = [30, 45, 60, 75, 90];

export function Onboarding({ account, onDone }) {
  const [step, setStep] = useState(0);
  const [p, setP] = useState({
    name: account?.name || '', age: '', sex: '', height: '', weight: '',
    trainingAge: '', experience: '', trainingNotes: '',
    goal: '', secondaryGoal: '', targetWeight: '', targetDate: '',
    style: '',
    frequency: 4, preferredDays: [], sessionDuration: 60,
    equipment: '',
    limitations: [], limitationNotes: '',
    bodyFatPct: '', cardioPreference: '',
  });
  const steps = ['about', 'history', 'goals', 'style', 'availability', 'equipment', 'limitations', 'summary'];
  const total = steps.length - 1; // progress bar fills across the input steps; summary is the payoff, not counted toward the bar
  const pct = Math.round((Math.min(step, total) / total) * 100);
  const next = () => setStep(s => Math.min(steps.length - 1, s + 1));
  const back = () => setStep(s => Math.max(0, s - 1));
  const set = (k, v) => setP(x => ({ ...x, [k]: v }));
  const toggleDay = d => setP(x => ({ ...x, preferredDays: x.preferredDays.includes(d) ? x.preferredDays.filter(y => y !== d) : [...x.preferredDays, d] }));
  const toggleLimitation = l => setP(x => ({ ...x, limitations: x.limitations.includes(l) ? x.limitations.filter(y => y !== l) : [...x.limitations, l] }));

  const canNext = () => {
    const k = steps[step];
    if (k === 'about') return p.name.trim() && Number(p.age) > 0 && p.sex && Number(p.weight) > 0 && Number(p.height) > 0;
    if (k === 'history') return p.trainingAge !== '' && Number(p.trainingAge) >= 0 && p.experience;
    if (k === 'goals') return !!p.goal;
    if (k === 'style') return !!p.style;
    if (k === 'availability') return !!p.frequency && !!p.sessionDuration;
    if (k === 'equipment') return !!p.equipment;
    return true; // limitations + summary are always passable
  };
  const selectAndAdvance = (k, v) => { set(k, v); setTimeout(() => setStep(s => Math.min(steps.length - 1, s + 1)), 160); };
  const finish = () => onDone({
    ...p,
    age: Number(p.age), weight: Number(p.weight), height: Number(p.height),
    trainingAge: Number(p.trainingAge), frequency: Number(p.frequency), sessionDuration: Number(p.sessionDuration),
    targetWeight: p.targetWeight ? Number(p.targetWeight) : '',
    bodyFatPct: p.bodyFatPct ? Number(p.bodyFatPct) : '',
  });
  const k = steps[step];

  return <div className="onboard">
    <div className="onboardTop">
      <div className="onboardHead"><span className="mark small"><img src={asset("anvil-mark.png")} alt="ANVIL" /></span><span className="eyebrow">BUILDING YOUR ATHLETE PROFILE</span></div>
      <div className="bar onboardBar"><i style={{ width: pct + '%' }} /></div>
      <div className="onboardPct">{k === 'summary' ? '100%' : pct + '%'}</div>
    </div>
    <div className="onboardBody">
      {k === 'about' && <Step title="About you" sub="The basics — used to size load estimates and, if you choose, show sex-specific strength standards.">
        <div className="formGrid">
          <label>Name<input value={p.name} onChange={e => set('name', e.target.value)} placeholder="Your name" autoFocus /></label>
          <label>Age<input type="number" value={p.age} onChange={e => set('age', e.target.value)} placeholder="30" /></label>
          <label>Weight (kg)<input type="number" value={p.weight} onChange={e => set('weight', e.target.value)} placeholder="82" /></label>
          <label>Height (cm)<input type="number" value={p.height} onChange={e => set('height', e.target.value)} placeholder="178" /></label>
        </div>
        <div className="onboardSubgroup">
          <span className="onboardSubLabel">Sex</span>
          <p className="onboardHint">Only used to pick which strength-standards reference table to show on your PRs — nothing else changes based on this.</p>
          <div className="chipRow">{SEX_OPTIONS.map(s => <button key={s} className={'chipToggle ' + (p.sex === s ? 'active' : '')} onClick={() => set('sex', s)}>{s}</button>)}</div>
        </div>
      </Step>}

      {k === 'history' && <Step title="Training history" sub="Training age and chronological age aren't the same thing — both are shown on your profile, but experience is what actually shapes your program.">
        <div className="formGrid">
          <label>Training age (years)<input type="number" min="0" step="0.5" value={p.trainingAge} onChange={e => set('trainingAge', e.target.value)} placeholder="e.g. 2" /></label>
        </div>
        <div className="onboardSubgroup"><span className="onboardSubLabel">Experience level</span>
          <div className="choiceGrid two">{EXPERIENCE.map(([e, d]) => <button key={e} className={'choiceCard ' + (p.experience === e ? 'active' : '')} onClick={() => set('experience', e)}><b>{e}</b><small>{d}</small></button>)}</div>
        </div>
        <div className="onboardSubgroup"><span className="onboardSubLabel">What have you trained before, or are training now? <em>(optional)</em></span>
          <textarea className="onboardTextarea" value={p.trainingNotes} onChange={e => set('trainingNotes', e.target.value)} placeholder="e.g. 2 years of a bodybuilding split, took 6 months off, back at it since March…" rows={3} />
        </div>
      </Step>}

      {k === 'goals' && <Step title="What are you training for?" sub="Pick a primary focus — a secondary goal is optional and gets folded into your sessions where it fits.">
        <span className="onboardSubLabel">Primary goal</span>
        <div className="choiceGrid">{GOALS.map(([g, Icon, d]) => <button key={g} className={'choiceCard ' + (p.goal === g ? 'active' : '')} onClick={() => set('goal', g)}><Icon size={22} /><b>{g}</b><small>{d}</small></button>)}</div>
        <div className="onboardSubgroup"><span className="onboardSubLabel">Secondary goal <em>(optional)</em></span>
          <div className="choiceGrid">
            <button className={'choiceCard ' + (!p.secondaryGoal ? 'active' : '')} onClick={() => set('secondaryGoal', '')}><I.Minus size={22} /><b>None</b><small>Single focus</small></button>
            {GOALS.filter(([g]) => g !== p.goal).map(([g, Icon, d]) => <button key={g} className={'choiceCard ' + (p.secondaryGoal === g ? 'active' : '')} onClick={() => set('secondaryGoal', g)}><Icon size={22} /><b>{g}</b><small>{d}</small></button>)}
          </div>
        </div>
        <div className="onboardSubgroup"><span className="onboardSubLabel">Target, if you have one <em>(optional)</em></span>
          <div className="formGrid"><label>Target bodyweight (kg)<input type="number" value={p.targetWeight} onChange={e => set('targetWeight', e.target.value)} placeholder="—" /></label><label>Target date<input type="date" value={p.targetDate} onChange={e => set('targetDate', e.target.value)} /></label></div>
        </div>
      </Step>}

      {k === 'style' && <Step title="What's your training style?" sub="Pick the discipline your program should be built around.">
        <div className="choiceGrid two">{STYLES.map(([s, d]) => <button key={s} className={'choiceCard ' + (p.style === s ? 'active' : '')} onClick={() => selectAndAdvance('style', s)}><b>{s}</b><small>{d}</small></button>)}</div>
      </Step>}

      {k === 'availability' && <Step title="How much time can you give this?" sub="Your weekly calendar and exercise count per session are built around this.">
        <span className="onboardSubLabel">Days per week</span>
        <div className="choiceGrid freq">{[2, 3, 4, 5, 6, 7].map(n => <button key={n} className={'choiceCard ' + (p.frequency === n ? 'active' : '')} onClick={() => set('frequency', n)}><b>{n}</b><small>days / week</small></button>)}</div>
        <div className="onboardSubgroup"><span className="onboardSubLabel">Preferred days <em>(optional — leave blank for automatic spacing)</em></span>
          <div className="chipRow">{DAYS.map(d => <button key={d} className={'chipToggle ' + (p.preferredDays.includes(d) ? 'active' : '')} onClick={() => toggleDay(d)}>{d}</button>)}</div>
          <p className="onboardHint">{p.preferredDays.length}/{p.frequency} selected{p.preferredDays.length && p.preferredDays.length !== p.frequency ? ' — select exactly your day count to use these, otherwise ANVIL spaces them automatically' : ''}</p>
        </div>
        <div className="onboardSubgroup"><span className="onboardSubLabel">Typical session length</span>
          <div className="chipRow">{DURATIONS.map(m => <button key={m} className={'chipToggle ' + (p.sessionDuration === m ? 'active' : '')} onClick={() => set('sessionDuration', m)}>{m} min</button>)}</div>
        </div>
      </Step>}

      {k === 'equipment' && <Step title="What do you have access to?" sub="Every exercise ANVIL suggests will be filtered to what you actually have.">
        <div className="choiceGrid">{EQUIPMENT.map(([e, Icon]) => <button key={e} className={'choiceCard ' + (p.equipment === e ? 'active' : '')} onClick={() => selectAndAdvance('equipment', e)}><Icon size={22} /><b>{e}</b></button>)}</div>
      </Step>}

      {k === 'limitations' && <Step title="Anything ANVIL should work around?" sub="Completely optional. This is a simple exercise filter, not medical guidance — always check with a professional for injury-specific programming.">
        <div className="choiceGrid freq">
          <button className={'choiceCard ' + (!p.limitations.length ? 'active' : '')} onClick={() => set('limitations', [])}><I.Check size={20} /><b>None</b></button>
          {LIMITATION_OPTIONS.map(l => <button key={l} className={'choiceCard ' + (p.limitations.includes(l) ? 'active' : '')} onClick={() => toggleLimitation(l)}><b>{l}</b></button>)}
        </div>
        <div className="onboardSubgroup"><span className="onboardSubLabel">Anything else to note? <em>(optional — stored and shown during workouts, not auto-filtered)</em></span>
          <textarea className="onboardTextarea" value={p.limitationNotes} onChange={e => set('limitationNotes', e.target.value)} placeholder="e.g. avoid overhead work on heavy days, easing back in after time off…" rows={2} />
        </div>
      </Step>}

      {k === 'summary' && <Step title="Your ANVIL profile" sub="Review before we build your program — you can change any of this later in Profile.">
        <div className="summaryGrid">
          <div className="summaryCol"><span className="onboardSubLabel">Athlete</span>
            <SummaryRow label="Age" value={p.age || '—'} /><SummaryRow label="Sex" value={p.sex || '—'} /><SummaryRow label="Height" value={(p.height || '—') + ' cm'} /><SummaryRow label="Weight" value={(p.weight || '—') + ' kg'} />
            <SummaryRow label="Training age" value={(p.trainingAge || '0') + ' yrs'} /><SummaryRow label="Experience" value={p.experience || '—'} />
          </div>
          <div className="summaryCol"><span className="onboardSubLabel">Program</span>
            <SummaryRow label="Primary goal" value={p.goal || '—'} /><SummaryRow label="Secondary goal" value={p.secondaryGoal || 'None'} /><SummaryRow label="Style" value={p.style || '—'} />
            <SummaryRow label="Frequency" value={p.frequency + ' days/week'} /><SummaryRow label="Session length" value={p.sessionDuration + ' min'} /><SummaryRow label="Equipment" value={p.equipment || '—'} />
            <SummaryRow label="Limitations" value={p.limitations.length ? p.limitations.join(', ') : 'None noted'} />
          </div>
        </div>
      </Step>}
    </div>
    <div className="onboardFoot">
      {step > 0 ? <button className="secondary" onClick={back}><I.ChevronLeft size={16} /> Back</button> : <span />}
      {k === 'summary' ? <button className="primary" onClick={finish}><I.Check size={16} /> Build my program</button> : <button className="primary" disabled={!canNext()} onClick={next}>Continue <I.ChevronRight size={16} /></button>}
    </div>
  </div>;
}
function SummaryRow({ label, value }) { return <div className="summaryRow"><span>{label}</span><b>{value}</b></div>; }

const BUILD_MESSAGES = ['Analyzing your profile…', 'Calculating your training identity…', 'Selecting your training system…', 'Building your weekly calendar…', 'Finalizing your program…'];
export function BuildingScreen({ onDone }) {
  const [pct, setPct] = useState(0); const [msg, setMsg] = useState(BUILD_MESSAGES[0]);
  useEffect(() => {
    let p = 0;
    const t = setInterval(() => {
      p += Math.random() * 9 + 4;
      if (p >= 100) { p = 100; clearInterval(t); setPct(100); setMsg('Program ready.'); setTimeout(onDone, 650); return; }
      setPct(Math.round(p));
      setMsg(BUILD_MESSAGES[Math.min(BUILD_MESSAGES.length - 1, Math.floor((p / 100) * BUILD_MESSAGES.length))]);
    }, 260);
    return () => clearInterval(t);
  }, []);
  return <div className="bootScreen build"><div className="bootMark"><img src={asset("anvil-mark.png")} alt="ANVIL" /></div><div className="buildPct">{pct}%</div><div className="bar buildBar"><i style={{ width: pct + '%' }} /></div><div className="buildMsg">{msg}</div></div>;
}
