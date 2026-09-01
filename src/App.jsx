import React, { useEffect, useRef, useState } from 'react';
import * as I from 'lucide-react';
import { seed, demo, loadState, saveState, loadAccount, saveAccount, clearAll } from './data/seed';
import { buildCalendar } from './engine/calendar';
import { recalcIdentity } from './engine/identity';
import { generateWorkout, detectPRs } from './engine/workoutEngine';
import { weeklyCount, currentStreak } from './engine/workoutDates';
import { asset } from './assetPath';
import { LoadingScreen, AuthScreen, Onboarding, BuildingScreen } from './screens/Boot';
import Today from './pages/Today';
import Train from './pages/Train';
import WorkoutModal from './pages/WorkoutModal';
import Programs from './pages/Programs';
import Progress from './pages/Progress';
import Library from './pages/Library';
import Profile from './pages/Profile';

const pageTitle = p => ({ today: 'Today', train: 'Train', program: 'Programs', progress: 'Progress', library: 'Library', profile: 'Profile' }[p]);

export default function App() {
  const [account, setAccount] = useState(loadAccount);
  const [data, setData] = useState(loadState);
  const [stage, setStage] = useState('loading');
  const [page, setPage] = useState('today');
  const [active, setActive] = useState(null);
  const [toast, setToast] = useState(null);
  const [toastLeaving, setToastLeaving] = useState(false);
  const toastToken = useRef(0);

  useEffect(() => saveState(data), [data]);
  useEffect(() => {
    const t = setTimeout(() => {
      if (account && data.onboarded) setStage('app');
      else if (account) setStage('onboarding');
      else setStage('auth');
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  const notify = m => {
    const token = ++toastToken.current;
    setToast(m);
    setToastLeaving(false);
    setTimeout(() => { if (toastToken.current === token) setToastLeaving(true); }, 1500);
    setTimeout(() => { if (toastToken.current === token) setToast(null); }, 1720);
  };
  const signIn = acc => { saveAccount(acc); setAccount(acc); setStage(data.onboarded ? 'app' : 'onboarding'); };
  const finishOnboarding = profile => {
    const split = buildCalendar(profile);
    const identity = recalcIdentity(profile, []);
    setData(d => ({ ...d, onboarded: true, profile: { ...d.profile, ...profile }, identity, split }));
    setStage('building');
  };
  const resetAll = () => { clearAll(); setAccount(null); setData(seed); setStage('loading'); setPage('today'); setTimeout(() => setStage('auth'), 900); };

  if (stage === 'loading') return <LoadingScreen />;
  if (stage === 'auth') return <AuthScreen onSignIn={signIn} onGuest={() => signIn({ name: 'Guest', email: null, guest: true })} onDemo={() => { setData(demo); saveAccount({ name: 'Athlete', guest: true }); setAccount({ name: 'Athlete', guest: true }); setStage('app'); }} />;
  if (stage === 'onboarding') return <Onboarding account={account} onDone={finishOnboarding} />;
  if (stage === 'building') return <BuildingScreen onDone={() => setStage('app')} />;

  const nav = [['today', 'Today', I.Sun], ['train', 'Train', I.Dumbbell], ['program', 'Programs', I.Layers3], ['progress', 'Progress', I.TrendingUp], ['library', 'Library', I.Database], ['profile', 'Profile', I.UserRound]];
  const weeklyDone = weeklyCount(data.workouts);
  const streak = currentStreak(data.workouts);
  const freqTarget = Number(data.profile.frequency) || 0;
  const consistency = freqTarget ? Math.min(100, Math.round((weeklyDone / freqTarget) * 100)) : 0;

  // Single write path for a finished/edited workout: stamps a real timestamp on new entries,
  // runs PR detection against the current records (the only place data.prs is allowed to change),
  // and returns what changed so the modal can show a session-complete summary before closing.
  const saveWorkout = (w, onSaved) => {
    setData(d => {
      const exists = w.id !== 'new' && d.workouts.some(x => x.id === w.id);
      const { updatedPrs, newPRs } = detectPRs(w, d.prs);
      const nextWorkouts = exists
        ? d.workouts.map(x => x.id === w.id ? { ...w, loggedAt: x.loggedAt || new Date().toISOString() } : x)
        : [{ ...w, id: Date.now(), loggedAt: new Date().toISOString() }, ...d.workouts];
      if (onSaved) onSaved({ newPRs });
      return { ...d, workouts: nextWorkouts, prs: updatedPrs };
    });
  };

  return <div className="app">
    <aside>
      <div className="brand"><span className="mark"><img src={asset("anvil-mark.png")} alt="ANVIL" /></span><div><b>ANVIL</b><small>TRAINING OS</small></div></div>
      <nav>{nav.map(([id, l, Icon]) => <button className={page === id ? 'active' : ''} onClick={() => setPage(id)} key={id} title={l}><Icon size={18} /><span>{l}</span></button>)}</nav>
      <div className="sideFoot">
        <div className="streak"><span>STREAK</span><strong>{streak} {streak === 1 ? 'DAY' : 'DAYS'}</strong><div className="bar"><i style={{ width: consistency + '%' }} /></div><small className="streakSub">{weeklyDone}/{freqTarget || '—'} this week</small></div>
      </div>
    </aside>
    <main>
      <header>
        <div><h1>{pageTitle(page)}</h1></div>
        <div className="headActions"><button className="iconBtn" onClick={() => notify('No new notifications')} title="Notifications"><I.Bell size={18} /></button><button className="avatar" onClick={() => setPage('profile')} title="Profile"><img src={asset("anvil-mark.png")} alt="ANVIL" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /></button></div>
      </header>
      {page === 'today' && <Today key="today" data={data} go={setPage} start={setActive} weeklyDone={weeklyDone} freqTarget={freqTarget} streak={streak} />}
      {page === 'train' && <Train key="train" data={data} setData={setData} start={setActive} notify={notify}
        addWorkout={() => setActive({ id: 'new', name: 'Custom Workout', duration: 0, volume: 0, exercises: [] })}
        generate={focus => setActive({ id: 'new', ...generateWorkout(data.profile, focus, data.prs, data.workouts) })} />}
      {page === 'program' && <Programs key="program" data={data} setData={setData} notify={notify} />}
      {page === 'progress' && <Progress key="progress" data={data} setData={setData} notify={notify} />}
      {page === 'library' && <Library key="library" notify={notify} workouts={data.workouts} />}
      {page === 'profile' && <Profile key="profile" data={data} setData={setData} notify={notify} onReset={resetAll} />}
    </main>
    {active && <WorkoutModal workout={active} profile={data.profile} prs={data.prs} workouts={data.workouts} close={() => setActive(null)} save={saveWorkout} notify={notify} />}
    {toast && <div className={'toast' + (toastLeaving ? ' leaving' : '')}><I.CheckCircle2 size={17} />{toast}</div>}
  </div>;
}
