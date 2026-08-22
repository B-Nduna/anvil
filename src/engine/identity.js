const EXP_SCORE = { Beginner: 0, Intermediate: 20, Advanced: 38, Elite: 50 };

/** The five "Training Identity" percentages shown on the Dashboard/Profile. */
export function recalcIdentity(profile, workouts) {
  const clamp = v => Math.max(5, Math.min(99, Math.round(v)));
  const exp = EXP_SCORE[profile.experience] || 10;
  const freq = Number(profile.frequency) || 3;
  const recentVol = (workouts || []).slice(0, 5).reduce((a, w) => a + (w.volume || 0), 0);
  const goal = profile.goal;

  const hypertrophy = clamp(30 + exp * 0.7 + Math.min(recentVol / 900, 30) + (goal === 'Build Muscle' ? 15 : 0));
  const strength = clamp(22 + exp * 0.8 + (goal === 'Strength' ? 20 : 0) + freq * 2);
  const athletic = clamp(12 + freq * 3 + (goal === 'Athletic Performance' ? 28 : 0) + exp * 0.3);
  const conditioning = clamp(12 + freq * 4 + (goal === 'Fat Loss' ? 22 : 0) + (goal === 'Athletic Performance' ? 10 : 0));
  const mobility = clamp(8 + (goal === 'Mobility' ? 38 : 0) + exp * 0.2 + freq);

  return { hypertrophy, strength, athletic, conditioning, mobility };
}
