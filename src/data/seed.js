export const emptyProfile = { name: '', goal: '', style: '', experience: '', frequency: 4, equipment: '', weight: 0, height: 0 };

export const seed = {
  onboarded: false,
  profile: { ...emptyProfile },
  identity: { hypertrophy: 0, strength: 0, athletic: 0, conditioning: 0, mobility: 0 },
  workouts: [],
  split: [['MON', 'Rest'], ['TUE', 'Rest'], ['WED', 'Rest'], ['THU', 'Rest'], ['FRI', 'Rest'], ['SAT', 'Rest'], ['SUN', 'Rest']],
  measurements: [],
  prs: [['Bench Press', 0], ['Squat', 0], ['Deadlift', 0]],
};

export const demo = {
  onboarded: true,
  profile: { name: 'Athlete', goal: 'Build Muscle', style: 'Bodybuilding', experience: 'Intermediate', frequency: 5, equipment: 'Full gym', weight: 82.4, height: 178 },
  identity: { hypertrophy: 84, strength: 72, athletic: 38, conditioning: 44, mobility: 29 },
  workouts: [
    { id: 1, name: 'Push — Hypertrophy', date: 'Today', duration: 58, volume: 14240, exercises: [
      { name: 'Barbell Bench Press', sets: [{ w: 80, r: 10, rir: 2 }, { w: 80, r: 9, rir: 1 }, { w: 75, r: 10, rir: 1 }] },
      { name: 'Incline DB Press', sets: [{ w: 30, r: 10, rir: 2 }, { w: 30, r: 9, rir: 1 }, { w: 28, r: 10, rir: 1 }] },
      { name: 'Cable Fly', sets: [{ w: 18, r: 12, rir: 2 }, { w: 18, r: 12, rir: 1 }] },
      { name: 'Lateral Raise', sets: [{ w: 10, r: 15, rir: 2 }, { w: 10, r: 14, rir: 1 }, { w: 10, r: 13, rir: 1 }] },
      { name: 'Tricep Pushdown', sets: [{ w: 25, r: 12, rir: 2 }, { w: 25, r: 11, rir: 1 }] },
    ] },
    { id: 2, name: 'Pull — Strength', date: 'Yesterday', duration: 62, volume: 18420, exercises: [] },
    { id: 3, name: 'Legs — Hypertrophy', date: '3 days ago', duration: 71, volume: 21450, exercises: [] },
  ],
  split: [['MON', 'Push'], ['TUE', 'Pull'], ['WED', 'Rest'], ['THU', 'Legs'], ['FRI', 'Upper'], ['SAT', 'Lower'], ['SUN', 'Rest']],
  measurements: [{ date: 'Aug 21', weight: 82.4, waist: 82, arm: 38 }, { date: 'Aug 14', weight: 82.9, waist: 83, arm: 37.8 }, { date: 'Aug 7', weight: 83.2, waist: 84, arm: 37.6 }, { date: 'Jul 31', weight: 84.2, waist: 85, arm: 37.3 }],
  prs: [['Bench Press', 102.5], ['Squat', 145], ['Deadlift', 175]],
};

export function loadState() {
  try { return JSON.parse(localStorage.getItem('anvil_state')) || seed; } catch { return seed; }
}
export function saveState(data) {
  localStorage.setItem('anvil_state', JSON.stringify(data));
}
export function loadAccount() {
  try { return JSON.parse(localStorage.getItem('anvil_account')) || null; } catch { return null; }
}
export function saveAccount(acc) {
  localStorage.setItem('anvil_account', JSON.stringify(acc));
}
export function clearAll() {
  localStorage.removeItem('anvil_state');
  localStorage.removeItem('anvil_account');
}
