/*
 * Exercise performance intelligence — Phase 1 of the training-OS roadmap.
 * Everything here is derived purely from what the athlete actually logged
 * (data.workouts). No invented data, no RPE/readiness modeling (that's a
 * later phase, and needs athlete-reported input this module doesn't have).
 *
 * `workouts` is assumed newest-first, matching how App.jsx saves them
 * (new entries are unshifted onto the array).
 */

const round1 = v => Math.round(v * 10) / 10;
/** Epley estimated 1RM. Deliberately not used for anything load-prescribing here —
 * just a comparable single number for PR tracking and trend direction. */
const epley1RM = (w, r) => (r <= 1 ? w : w * (1 + r / 30));

/** Every logged instance of one exercise, each reduced to its meaningful numbers. */
function instancesFor(name, workouts) {
  const out = [];
  for (const w of workouts || []) {
    const match = (w.exercises || []).find(e => e.name === name);
    if (!match) continue;
    const sets = (match.sets || []).filter(s => s.w > 0 && s.r > 0);
    if (!sets.length) continue;
    const top = sets.reduce((a, b) => (b.w > a.w || (b.w === a.w && b.r > a.r) ? b : a));
    const maxReps = Math.max(...sets.map(s => s.r));
    const est1RM = round1(Math.max(...sets.map(s => epley1RM(s.w, s.r))));
    const volume = sets.reduce((a, s) => a + s.w * s.r, 0);
    out.push({ loggedAt: w.loggedAt || null, workoutId: w.id, top, maxReps, est1RM, volume, sets });
  }
  return out;
}

/**
 * Full performance picture for one exercise. Returns null if it's never been logged —
 * callers should show an empty state, not a zeroed-out chart.
 */
export function exerciseHistory(name, workouts) {
  const instances = instancesFor(name, workouts);
  if (!instances.length) return null;

  const weightPR = instances.reduce((a, b) => (b.top.w > a.top.w ? b : a));
  const repPR = instances.reduce((a, b) => (b.maxReps > a.maxReps ? b : a));
  const volumePR = instances.reduce((a, b) => (b.volume > a.volume ? b : a));
  const est1RMPR = instances.reduce((a, b) => (b.est1RM > a.est1RM ? b : a));
  const last = instances[0];
  const previous = instances[1] || null;

  // Trend: direction of estimated-1RM across the last few sessions (oldest-to-newest within
  // that window). A flat/noisy history reads as 'stable' rather than forcing a direction —
  // this is a simple heuristic, not a claim of statistical significance.
  let trend = 'stable';
  if (instances.length >= 2) {
    const window = instances.slice(0, Math.min(4, instances.length)).map(i => i.est1RM).reverse();
    const delta = window[window.length - 1] - window[0];
    const threshold = window[0] * 0.02; // ~2% — small enough to catch real progress, large enough to ignore rounding noise
    if (delta > threshold) trend = 'improving';
    else if (delta < -threshold) trend = 'declining';
  }

  return { instances, sessionsLogged: instances.length, weightPR, repPR, volumePR, est1RMPR, last, previous, trend };
}

/** The "Last session X → Today Y, +delta" framing shown mid-workout. `lastSet` is a plain {w,r} —
 * pass the athlete's last logged set for this exercise. Returns null if there's no prior set to compare. */
export function sessionDelta(currentWeight, lastSet) {
  if (!lastSet) return null;
  const delta = round1(currentWeight - lastSet.w);
  return { lastWeight: lastSet.w, lastReps: lastSet.r, delta };
}
