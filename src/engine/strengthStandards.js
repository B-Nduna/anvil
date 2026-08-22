/*
 * Validated strength standards, derived from real competition data.
 *
 * Source: OpenPowerlifting (openpowerlifting.org), public-domain dataset,
 * ~2.27M competition entries. Filtered to raw (unequipped), drug-tested
 * lifters with a valid bodyweight, then percentile bands were computed
 * per 10kg bodyweight bracket for Squat / Bench / Deadlift:
 *   Beginner = 15th percentile, Intermediate = 50th, Advanced = 80th, Elite = 95th
 * Each bracket used tens of thousands of samples (see the "n" field in
 * strengthStandards.json) — this replaces what used to be a guessed
 * bodyweight-multiplier table with numbers anchored to real lifters.
 *
 * Known limitation: the dataset was pooled across sexes for this pass
 * (the app doesn't currently collect sex, and strength standards differ
 * meaningfully by sex). Treat these as directional, not exact — see
 * README note in /data/strengthStandards.json for the raw source.
 */
import STANDARDS from '../data/strengthStandards.json';

const LEVELS = ['beginner', 'intermediate', 'advanced', 'elite'];

/** Find the bodyweight bracket a given bodyweight falls into for a lift. */
export function lookupBracket(lift, bodyweightKg) {
  const table = STANDARDS[lift];
  if (!table || !table.length) return null;
  return table.find(b => bodyweightKg <= b.bwMax) || table[table.length - 1];
}

/** Population-standard 1RM (kg) for a lift, bodyweight, and experience level. */
export function standardFor(lift, bodyweightKg, experience) {
  const bracket = lookupBracket(lift, bodyweightKg);
  if (!bracket) return null;
  const key = (experience || 'Intermediate').toLowerCase();
  return bracket[key] ?? bracket.intermediate;
}

/** Where a lifted value (kg) sits relative to the population — for PR context in the UI. */
export function classifyLift(lift, bodyweightKg, valueKg) {
  const bracket = lookupBracket(lift, bodyweightKg);
  if (!bracket || !valueKg) return null;
  let label = 'Untrained';
  for (const level of LEVELS) {
    if (valueKg >= bracket[level]) label = level[0].toUpperCase() + level.slice(1);
  }
  if (valueKg >= bracket.elite) label = 'Elite';
  return label;
}
