import React, { useEffect, useState } from 'react';
import * as I from 'lucide-react';
import { Step } from '../ui/Shared';
import { STYLE_POOL } from '../engine/calendar';
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

export function Onboarding({ account, onDone }) {
  const [step, setStep] = useState(0);
  const [p, setP] = useState({ name: account?.name || '', weight: '', height: '', goal: '', style: '', experience: '', frequency: 4, equipment: '' });
  const steps = ['basics', 'goal', 'style', 'experience', 'frequency', 'equipment'];
  const total = steps.length;
  const pct = Math.round((step / total) * 100);
  const next = () => setStep(s => Math.min(total - 1, s + 1));
  const back = () => setStep(s => Math.max(0, s - 1));
  const set = (k, v) => setP(x => ({ ...x, [k]: v }));
  const canNext = () => {
    const k = steps[step];
    if (k === 'basics') return p.name.trim() && Number(p.weight) > 0 && Number(p.height) > 0;
    if (k === 'goal') return !!p.goal;
    if (k === 'style') return !!p.style;
    if (k === 'experience') return !!p.experience;
    if (k === 'frequency') return !!p.frequency;
    if (k === 'equipment') return !!p.equipment;
    return true;
  };
  const selectAndAdvance = (k, v) => { set(k, v); setTimeout(() => setStep(s => Math.min(total - 1, s + 1)), 160); };
  const finish = () => onDone({ ...p, weight: Number(p.weight), height: Number(p.height), frequency: Number(p.frequency) });
  const k = steps[step];
  return <div className="onboard">
    <div className="onboardTop"><div className="onboardHead"><span className="mark small"><img src={asset("anvil-mark.png")} alt="ANVIL" /></span><span className="eyebrow">BUILDING YOUR TRAINING IDENTITY</span></div><div className="bar onboardBar"><i style={{ width: pct + '%' }} /></div><div className="onboardPct">{pct}%</div></div>
    <div className="onboardBody">
      {k === 'basics' && <Step title="Let's start with the basics" sub="This tailors load recommendations and lets you track real progress.">
        <div className="formGrid"><label>Name<input value={p.name} onChange={e => set('name', e.target.value)} placeholder="Your name" autoFocus /></label><label>Weight (kg)<input type="number" value={p.weight} onChange={e => set('weight', e.target.value)} placeholder="82" /></label><label>Height (cm)<input type="number" value={p.height} onChange={e => set('height', e.target.value)} placeholder="178" /></label></div>
      </Step>}
      {k === 'goal' && <Step title="What are you training for?" sub="This shapes your identity split and the systems we recommend.">
        <div className="choiceGrid">{GOALS.map(([g, Icon, d]) => <button key={g} className={'choiceCard ' + (p.goal === g ? 'active' : '')} onClick={() => selectAndAdvance('goal', g)}><Icon size={22} /><b>{g}</b><small>{d}</small></button>)}</div>
      </Step>}
      {k === 'style' && <Step title="What's your training style?" sub="Pick the discipline your program should be built around.">
        <div className="choiceGrid two">{STYLES.map(([s, d]) => <button key={s} className={'choiceCard ' + (p.style === s ? 'active' : '')} onClick={() => selectAndAdvance('style', s)}><b>{s}</b><small>{d}</small></button>)}</div>
      </Step>}
      {k === 'experience' && <Step title="How experienced are you?" sub="Sets your starting intensity and progression pace.">
        <div className="choiceGrid two">{EXPERIENCE.map(([e, d]) => <button key={e} className={'choiceCard ' + (p.experience === e ? 'active' : '')} onClick={() => selectAndAdvance('experience', e)}><b>{e}</b><small>{d}</small></button>)}</div>
      </Step>}
      {k === 'frequency' && <Step title="How many days a week can you train?" sub="Your weekly calendar will be built around this.">
        <div className="choiceGrid freq">{[2, 3, 4, 5, 6, 7].map(n => <button key={n} className={'choiceCard ' + (p.frequency === n ? 'active' : '')} onClick={() => selectAndAdvance('frequency', n)}><b>{n}</b><small>days / week</small></button>)}</div>
      </Step>}
      {k === 'equipment' && <Step title="What do you have access to?" sub="Last step — then we'll build your program.">
        <div className="choiceGrid">{EQUIPMENT.map(([e, Icon]) => <button key={e} className={'choiceCard ' + (p.equipment === e ? 'active' : '')} onClick={() => set('equipment', e)}><Icon size={22} /><b>{e}</b></button>)}</div>
      </Step>}
    </div>
    <div className="onboardFoot">{step > 0 ? <button className="secondary" onClick={back}><I.ChevronLeft size={16} /> Back</button> : <span />}{k === 'equipment' ? <button className="primary" disabled={!canNext()} onClick={finish}><I.Check size={16} /> Build my program</button> : <button className="primary" disabled={!canNext()} onClick={next}>Continue <I.ChevronRight size={16} /></button>}</div>
  </div>;
}

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
