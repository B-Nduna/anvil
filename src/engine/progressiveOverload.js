/*
 * Progressive overload: instead of suggesting the same starting load every
 * time, look at the athlete's most recent logged session for this exact
 * exercise and adjust from there — the core mechanic that makes a training
 * app actually progress someone over time rather than just picking exercises.
 */
const round2_5 = v => Math.round(v / 2.5) * 2.5;
/* Dumbbell increments round to the nearest 1kg (finer granularity); everything else to 2.5kg. */
const roundForEquipment = (equipment, v) => {
  const unit = equipment === 'Dumbbells' ? 1 : 2.5;
  return Math.round(v / unit) * unit;
};

/* How much weight to add on a clean progression, by movement pattern / equipment. */
const INCREMENT = {
  Barbell: { squat: 5, hinge: 5, push: 2.5, pull: 2.5, core: 2.5, carry: 2.5 },
  Machine: { squat: 5, hinge: 5, push: 2.5, pull: 2.5, core: 2.5, carry: 2.5 },
  Dumbbells: { squat: 2, hinge: 2, push: 2, pull: 2, core: 2, carry: 2 },
  Cable: { squat: 2.5, hinge: 2.5, push: 2.5, pull: 2.5, core: 2.5, carry: 2.5 },
  Bodyweight: { squat: 0, hinge: 0, push: 0, pull: 0, core: 0, carry: 0 },
};

/** Pull the most recent logged instance of this exercise out of workout history. */
export function findLastPerformance(exerciseName, workouts) {
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
 *
 * `tierMultiplier` scales how large a jump is (see engine/trainingLevel.js) —
 * a less-established lifter gets smaller, safer progression jumps; a more
 * established one gets larger ones. Defaults to 1 (no scaling) if omitted.
 */
export function progressiveLoad(ex, scheme, workouts, tierMultiplier = 1) {
  const last = findLastPerformance(ex.name, workouts);
  if (!last || !last.length) return null;

  const avgReps = last.reduce((a, s) => a + s.r, 0) / last.length;
  const avgRir = last.reduce((a, s) => a + s.rir, 0) / last.length;
  const topWeight = Math.max(...last.map(s => s.w));
  const baseInc = (INCREMENT[ex.equipment] || INCREMENT.Dumbbells)[ex.pattern] ?? 2.5;
  // Scale by tier without rounding yet — rounding here and again on the final weight would
  // wash out the tier's effect for smaller base increments (2.5kg movements especially).
  const inc = baseInc > 0 ? Math.max(baseInc * tierMultiplier, ex.equipment === 'Dumbbells' ? 0.5 : 1.25) : 0;

  let next = topWeight;
  let note = 'Same as last time';
  let direction = 'same';

  if (avgReps >= scheme.repsMax && avgRir >= scheme.rir) {
    next = topWeight + inc;
    direction = 'up';
  } else if (avgReps >= scheme.repsMax && avgRir < scheme.rir) {
    next = topWeight + inc / 2;
    direction = 'up-small';
  } else if (avgReps < scheme.repsMin) {
    next = Math.max(inc, topWeight - inc);
    direction = 'down';
  } else {
    note = 'On track — repeat this weight and aim for more reps';
  }

  const finalWeight = roundForEquipment(ex.equipment, next);
  const delta = Math.abs(finalWeight - topWeight);
  if (direction === 'up') note = delta > 0 ? `+${delta}kg — you hit the top of your range with reps to spare` : 'Add reps — you had room to spare';
  else if (direction === 'up-small') note = delta > 0 ? `+${delta}kg — hit your reps, but it was close to failure` : 'Hold steady — that was close to failure';
  else if (direction === 'down') note = delta > 0 ? `-${delta}kg — missed your rep target last time` : 'Scale back reps or assistance — missed target last time';

  return { weight: finalWeight, note, lastReps: Math.round(avgReps), lastWeight: topWeight };
}
