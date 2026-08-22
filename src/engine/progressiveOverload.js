/*
 * Progressive overload: instead of suggesting the same starting load every
 * time, look at the athlete's most recent logged session for this exact
 * exercise and adjust from there — the core mechanic that makes a training
 * app actually progress someone over time rather than just picking exercises.
 */
const round2_5 = v => Math.round(v / 2.5) * 2.5;

/* How much weight to add on a clean progression, by movement pattern / equipment. */
const INCREMENT = {
  Barbell: { squat: 5, hinge: 5, push: 2.5, pull: 2.5, core: 2.5, carry: 2.5 },
  Machine: { squat: 5, hinge: 5, push: 2.5, pull: 2.5, core: 2.5, carry: 2.5 },
  Dumbbells: { squat: 2, hinge: 2, push: 2, pull: 2, core: 2, carry: 2 },
  Cable: { squat: 2.5, hinge: 2.5, push: 2.5, pull: 2.5, core: 2.5, carry: 2.5 },
  Bodyweight: { squat: 0, hinge: 0, push: 0, pull: 0, core: 0, carry: 0 },
};

/** Pull the most recent logged instance of this exercise out of workout history. */
function findLastPerformance(exerciseName, workouts) {
  for (const w of workouts || []) {
    const match = (w.exercises || []).find(e => e.name === exerciseName);
    if (match && match.sets && match.sets.some(s => s.r > 0)) {
      return match.sets.filter(s => s.r > 0);
    }
  }
  return null;
}

/**
 * Given an exercise's last logged sets + this session's target scheme,
 * decide the next working weight. Returns null if there's no history yet
 * (caller should fall back to the cold-start estimate).
 */
export function progressiveLoad(ex, scheme, workouts) {
  const last = findLastPerformance(ex.name, workouts);
  if (!last || !last.length) return null;

  const avgReps = last.reduce((a, s) => a + s.r, 0) / last.length;
  const avgRir = last.reduce((a, s) => a + s.rir, 0) / last.length;
  const topWeight = Math.max(...last.map(s => s.w));
  const inc = (INCREMENT[ex.equipment] || INCREMENT.Dumbbells)[ex.pattern] ?? 2.5;

  let next = topWeight;
  let note = 'Same as last time';

  if (avgReps >= scheme.repsMax && avgRir >= scheme.rir) {
    next = topWeight + inc;
    note = inc > 0 ? `+${inc}kg — you hit the top of your range with reps to spare` : 'Add reps — you had room to spare';
  } else if (avgReps >= scheme.repsMax && avgRir < scheme.rir) {
    next = topWeight + inc / 2;
    note = inc > 0 ? `+${inc / 2}kg — hit your reps, but it was close to failure` : 'Hold steady — that was close to failure';
  } else if (avgReps < scheme.repsMin) {
    next = Math.max(inc, topWeight - inc);
    note = inc > 0 ? `-${inc}kg — missed your rep target last time` : 'Scale back reps or assistance — missed target last time';
  } else {
    note = 'On track — repeat this weight and aim for more reps';
  }

  return { weight: round2_5(next), note, lastReps: Math.round(avgReps), lastWeight: topWeight };
}
