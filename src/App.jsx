import React, { useEffect, useState } from 'react';
import * as I from 'lucide-react';
import { seed, demo, loadState, saveState, loadAccount, saveAccount, clearAll } from './data/seed';
import { buildCalendar } from './engine/calendar';
import { recalcIdentity } from './engine/identity';
import { generateWorkout } from './engine/workoutEngine';
import { LoadingScreen, AuthScreen, Onboarding, BuildingScreen } from './screens/Boot';
import Dashboard from './pages/Dashboard';
import Train from './pages/Train';
import WorkoutModal from './pages/WorkoutModal';
import Programs from './pages/Programs';
import Progress from './pages/Progress';
import Library from './pages/Library';
import Profile from './pages/Profile';

const pageTitle = p => ({ home: 'Training Console', train: 'Train', program: 'Programs', progress: 'Progress Lab', library: 'Exercise Library', profile: 'Athlete Profile' }[p]);
const pageSubtitle = p => ({
  home: "Your daily overview — what to train and how it's trending.",
  train: "Your workout history. Start today's session or log a custom one.",
  program: 'Build your weekly split, or apply a ready-made training system.',
  progress: 'Bodyweight, strength records and measurements over time.',
  library: 'Browse exercises to plan your next session.',
  profile: 'Your details and how they shape your Training Identity.',
}[p]);

export default function App() {
  const [account, setAccount] = useState(loadAccount);
  const [data, setData] = useState(loadState);
  const [stage, setStage] = useState('loading');
  const [page, setPage] = useState('home');
  const [active, setActive] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => saveState(data), [data]);
  useEffect(() => {
    const t = setTimeout(() => {
      if (account && data.onboarded) setStage('app');
      else if (account) setStage('onboarding');
      else setStage('auth');
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  const notify = m => { setToast(m); setTimeout(() => setToast(''), 1800); };
  const signIn = acc => { saveAccount(acc); setAccount(acc); setStage(data.onboarded ? 'app' : 'onboarding'); };
  const finishOnboarding = profile => {
    const split = buildCalendar(profile);
    const identity = recalcIdentity(profile, []);
    setData(d => ({ ...d, onboarded: true, profile: { ...d.profile, ...profile }, identity, split }));
    setStage('building');
  };
  const resetAll = () => { clearAll(); setAccount(null); setData(seed); setStage('loading'); setPage('home'); setTimeout(() => setStage('auth'), 900); };

  if (stage === 'loading') return <LoadingScreen />;
  if (stage === 'auth') return <AuthScreen onSignIn={signIn} onGuest={() => signIn({ name: 'Guest', email: null, guest: true })} onDemo={() => { setData(demo); saveAccount({ name: 'Athlete', guest: true }); setAccount({ name: 'Athlete', guest: true }); setStage('app'); }} />;
  if (stage === 'onboarding') return <Onboarding account={account} onDone={finishOnboarding} />;
  if (stage === 'building') return <BuildingScreen onDone={() => setStage('app')} />;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  const nav = [['home', 'Dashboard', I.LayoutDashboard], ['train', 'Train', I.Dumbbell], ['program', 'Programs', I.Layers3], ['progress', 'Progress', I.TrendingUp], ['library', 'Library', I.Database], ['profile', 'Profile', I.UserRound]];
  const weeklyDone = data.workouts.filter(w => w.date === 'Today' || w.date === 'Yesterday' || (/^\d day/.test(w.date) && parseInt(w.date) < 7)).length;
  const freqTarget = Number(data.profile.frequency) || 0;
  const consistency = freqTarget ? Math.min(100, Math.round((weeklyDone / freqTarget) * 100)) : 0;

  const saveWorkout = w => {
    setData(d => {
      const exists = w.id !== 'new' && d.workouts.some(x => x.id === w.id);
      if (exists) return { ...d, workouts: d.workouts.map(x => x.id === w.id ? { ...w, date: x.date } : x) };
      return { ...d, workouts: [{ ...w, id: Date.now(), date: 'Today' }, ...d.workouts] };
    });
    setActive(null);
    notify('Workout saved');
  };

  return <div className="app">
    <aside>
      <div className="brand"><span className="mark"><img src="/anvil-mark.png" alt="ANVIL" /></span><div><b>ANVIL</b><small>TRAINING OS</small></div></div>
      <nav>{nav.map(([id, l, Icon]) => <button className={page === id ? 'active' : ''} onClick={() => setPage(id)} key={id} title={l}><Icon size={18} /><span>{l}</span></button>)}</nav>
      <div className="sideFoot">
        <div className="streak"><span>WEEKLY GOAL</span><strong>{weeklyDone}/{freqTarget || '—'}</strong><div className="bar"><i style={{ width: consistency + '%' }} /></div></div>
        <button onClick={() => { if (confirm('Sign out and reset all data? This clears your profile, program and workout history.')) resetAll(); }}><I.RotateCcw size={15} /> Reset & sign out</button>
      </div>
    </aside>
    <main>
      <header>
        <div><span className="eyebrow">{today.toUpperCase()}</span><h1>{pageTitle(page)}</h1><p className="pageSub">{pageSubtitle(page)}</p></div>
        <div className="headActions"><button className="iconBtn" onClick={() => notify('No new notifications')} title="Notifications"><I.Bell size={18} /></button><button className="avatar" onClick={() => setPage('profile')} title="Profile"><img src="/anvil-mark.png" alt="ANVIL" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /></button></div>
      </header>
      {page === 'home' && <Dashboard data={data} go={setPage} start={setActive} weeklyDone={weeklyDone} freqTarget={freqTarget} />}
      {page === 'train' && <Train data={data} setData={setData} start={setActive} notify={notify}
        addWorkout={() => setActive({ id: 'new', name: 'Custom Workout', duration: 0, volume: 0, exercises: [] })}
        generate={focus => setActive({ id: 'new', ...generateWorkout(data.profile, focus, data.prs, data.workouts) })} />}
      {page === 'program' && <Programs data={data} setData={setData} notify={notify} />}
      {page === 'progress' && <Progress data={data} setData={setData} notify={notify} />}
      {page === 'library' && <Library notify={notify} />}
      {page === 'profile' && <Profile data={data} setData={setData} notify={notify} />}
    </main>
    {active && <WorkoutModal workout={active} profile={data.profile} prs={data.prs} workouts={data.workouts} close={() => setActive(null)} save={saveWorkout} />}
    {toast && <div className="toast"><I.CheckCircle2 size={17} />{toast}</div>}
  </div>;
}
