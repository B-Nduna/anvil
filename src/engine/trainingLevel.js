/*
 * Training level — this is the piece that was missing: training age
 * (years actually training, distinct from chronological age) combined
 * with self-reported experience, reconciled into a finer-grained tier
 * that the workout engine actually uses for programming decisions.
 *
 * A 35-year-old with 6 months of training and a 22-year-old with 6 years
 * of training should not get the same exercise complexity, working-set
 * volume, or progression pace — that's the case this module exists to
 * cover. Chronological age is intentionally not an input here; it stays
 * contextual/display-only (see engine/workoutEngine.js and README).
 *
 * "Current performance" (how recent sessions actually went) is deliberately
 * NOT blended into this score — it's already reflected per-exercise via
 * progressive overload (engine/progressiveOverload.js). Folding a second,
 * fuzzier performance signal in here risked double-counting the same
 * signal without enough historical data to do it responsibly.
 */

const EXPERIENCE_BASE = { Beginner: 10, Intermediate: 35, Advanced: 65, Elite: 90 };
export const TIERS = ['Novice', 'Developing', 'Established', 'Advanced', 'Elite'];

/** 0-100 score: self-reported experience is the primary signal, training age reconciles it. */
export function trainingLevelScore(profile) {
  const base = EXPERIENCE_BASE[profile.experience] ?? 25;
  const ta = Number(profile.trainingAge);
  const taScore = Number.isFinite(ta) && ta >= 0 ? Math.min(40, ta * 6) : 0; // diminishing returns, caps ~7yrs
  const blended = base * 0.65 + taScore * 0.875; // weighted so both signals matter, but experience leads
  return Math.max(0, Math.min(100, Math.round(blended)));
}

/** The 5-tier programming level derived from the score above. */
export function trainingTier(profile) {
  const score = trainingLevelScore(profile);
  if (score < 20) return 'Novice';
  if (score < 45) return 'Developing';
  if (score < 70) return 'Established';
  if (score < 88) return 'Advanced';
  return 'Elite';
}

/** Which exercise difficulty ratings a tier unlocks. */
export const TIER_DIFFICULTY = {
  Novice: ['Beginner'],
  Developing: ['Beginner', 'Intermediate'],
  Established: ['Beginner', 'Intermediate'],
  Advanced: ['Beginner', 'Intermediate', 'Advanced'],
  Elite: ['Beginner', 'Intermediate', 'Advanced'],
};
/** Base exercise count per session, before the session-duration adjustment in workoutEngine.js. */
export const TIER_EXERCISE_COUNT = { Novice: 4, Developing: 5, Established: 6, Advanced: 7, Elite: 8 };
/** Caps working sets per exercise even if the goal scheme calls for more — a true novice doesn't need 5x5 on day one. */
export const TIER_MAX_SETS = { Novice: 3, Developing: 4, Established: 4, Advanced: 5, Elite: 5 };
/** Scales how large a progression jump is (see progressiveOverload.js) — smaller, safer jumps for less-established lifters. */
export const TIER_PROGRESSION_MULT = { Novice: 0.6, Developing: 0.8, Established: 1.0, Advanced: 1.1, Elite: 1.25 };
/** Scales prescribed rest time — a documented assumption (less-established lifters get a larger rest buffer), not a claim of fact. */
export const TIER_REST_MULT = { Novice: 1.25, Developing: 1.15, Established: 1.0, Advanced: 0.95, Elite: 0.9 };
