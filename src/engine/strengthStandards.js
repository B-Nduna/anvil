/*
 * Validated strength standards, derived from real competition data.
 *
 * Source: OpenPowerlifting (openpowerlifting.org), public-domain dataset,
 * ~2.27M competition entries. Filtered to raw (unequipped), drug-tested
 * lifters with a valid bodyweight, then percentile bands were computed
 * per 10kg bodyweight bracket for Squat / Bench / Deadlift, separately for
 * each reference set:
 *   Beginner = 15th percentile, Intermediate = 50th, Advanced = 80th, Elite = 95th
 * Each bracket used tens of thousands of samples (see the "n" field in
 * strengthStandards.json).
 *
 * Reference sets: "M", "F", and "combined" (both pooled — the default when
 * the athlete hasn't specified a sex, or prefers not to). Sex meaningfully
 * changes these numbers (e.g. a 70-80kg intermediate squat is ~167kg on the
 * M table vs ~112kg on the F table) so the combined table is a deliberately
 * rough fallback, never presented as precise. This is entirely opt-in: sex
 * is only used here, for standards display, and nowhere else in the app.
 */
import STANDARDS from '../data/strengthStandards.json';

const LEVELS = ['beginner', 'intermediate', 'advanced', 'elite'];

function referenceSet(sex) {
  if (sex === 'Male') return STANDARDS.M;
  if (sex === 'Female') return STANDARDS.F;
  return STANDARDS.combined;
}

/** Find the bodyweight bracket a given bodyweight falls into for a lift. */
export function lookupBracket(lift, bodyweightKg, sex) {
  const table = referenceSet(sex)[lift];
  if (!table || !table.length) return null;
  return table.find(b => bodyweightKg <= b.bwMax) || table[table.length - 1];
}

/** Population-standard 1RM (kg) for a lift, bodyweight, experience level, and (optional) sex. */
export function standardFor(lift, bodyweightKg, experience, sex) {
  const bracket = lookupBracket(lift, bodyweightKg, sex);
  if (!bracket) return null;
  const key = (experience || 'Intermediate').toLowerCase();
  return bracket[key] ?? bracket.intermediate;
}

/** Where a lifted value (kg) sits relative to the reference population — for PR context in the UI. */
export function classifyLift(lift, bodyweightKg, valueKg, sex) {
  const bracket = lookupBracket(lift, bodyweightKg, sex);
  if (!bracket || !valueKg) return null;
  let label = 'Untrained';
  for (const level of LEVELS) {
    if (valueKg >= bracket[level]) label = level[0].toUpperCase() + level.slice(1);
  }
  if (valueKg >= bracket.elite) label = 'Elite';
  return label;
}

/** Whether the athlete has opted into a sex-specific reference set (vs. the pooled default). */
export function hasSexSpecificStandard(sex) {
  return sex === 'Male' || sex === 'Female';
}
