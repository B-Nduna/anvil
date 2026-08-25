export const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const FREQ_PATTERN = {
  2: [1, 0, 1, 0, 0, 0, 0], 3: [1, 0, 1, 0, 1, 0, 0], 4: [1, 1, 0, 1, 1, 0, 0],
  5: [1, 1, 0, 1, 1, 1, 0], 6: [1, 1, 1, 1, 1, 1, 0], 7: [1, 1, 1, 1, 1, 1, 1],
};

export const STYLE_POOL = {
  'Bodybuilding': ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms'],
  'Powerlifting': ['Squat', 'Bench', 'Deadlift', 'Accessory'],
  'Calisthenics': ['Push skill', 'Pull skill', 'Legs', 'Core + skill'],
  'Olympic lifting': ['Snatch technique', 'Clean & Jerk', 'Squat strength', 'Accessory'],
  'Athletic': ['Power', 'Speed', 'Conditioning', 'Mobility'],
  'Pilates': ['Mat flow', 'Core + control', 'Mobility flow'],
  'Hybrid': ['Push', 'Pull', 'Legs', 'Upper', 'Lower'],
  'Functional': ['Full body A', 'Conditioning', 'Full body B', 'Mobility'],
};

/** Builds a 7-day calendar from training frequency (rest-day pattern) and style (session labels).
 * If the athlete specified preferred training days (from Availability in onboarding) matching
 * their frequency, those exact days are used instead of the default even spread. */
export function buildCalendar(profile) {
  const freq = Math.max(2, Math.min(7, Number(profile.frequency) || 4));
  const pool = STYLE_POOL[profile.style] || STYLE_POOL['Hybrid'];
  let pattern = FREQ_PATTERN[freq] || FREQ_PATTERN[4];
  if (Array.isArray(profile.preferredDays) && profile.preferredDays.length === freq) {
    pattern = DAYS.map(d => (profile.preferredDays.includes(d) ? 1 : 0));
  }
  let p = 0;
  return DAYS.map((d, i) => {
    if (!pattern[i]) return [d, 'Rest'];
    const label = pool[p % pool.length];
    p++;
    return [d, label];
  });
}
