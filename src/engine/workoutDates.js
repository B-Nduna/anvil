/*
 * Workout dates used to be stored as static strings ('Today', 'Yesterday',
 * '3 days ago') fixed at save time — meaning a workout logged "today" would
 * still display as "Today" forever, and weekly/streak counts silently drifted
 * wrong after the first day passed. Every workout now gets a real ISO
 * `loggedAt` timestamp; display labels and streak/weekly math are computed
 * from that at render time instead. `date` is kept only as a fallback for
 * already-saved data from before this change.
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const startOfDay = d => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };

/** Days between two dates, ignoring time of day (can be 0 for "today"). */
function daysBetween(a, b) {
  return Math.round((startOfDay(a) - startOfDay(b)) / DAY_MS);
}

/** Human label for a workout — 'Today', 'Yesterday', 'N days ago', or a short date further back. */
export function relativeLabel(workout) {
  if (!workout.loggedAt) return workout.date || '—'; // pre-migration fallback
  const diff = daysBetween(new Date(), new Date(workout.loggedAt));
  if (diff <= 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  return new Date(workout.loggedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Sessions logged within the last 7 days. */
export function weeklyCount(workouts) {
  return workouts.filter(w => w.loggedAt ? daysBetween(new Date(), new Date(w.loggedAt)) < 7 : (w.date === 'Today' || w.date === 'Yesterday' || /^\d day/.test(w.date || ''))).length;
}

/** Consecutive-day training streak, ending today or yesterday (a rest day today doesn't break a streak
 * from yesterday — but two missed days does). Only counts workouts with a real timestamp; returns 0 rather
 * than guessing if there's not enough real data to compute it honestly. */
export function currentStreak(workouts) {
  const days = new Set(workouts.filter(w => w.loggedAt).map(w => startOfDay(new Date(w.loggedAt)).getTime()));
  if (!days.size) return 0;
  const today = startOfDay(new Date()).getTime();
  const yesterday = today - DAY_MS;
  let anchor = days.has(today) ? today : (days.has(yesterday) ? yesterday : null);
  if (anchor === null) return 0;
  let streak = 0;
  let cursor = anchor;
  while (days.has(cursor)) { streak++; cursor -= DAY_MS; }
  return streak;
}
