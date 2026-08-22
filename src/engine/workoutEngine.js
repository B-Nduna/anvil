import OPEN_EXERCISE_DATA from '../data/exerciseData.json'; /* free-exercise-db (public domain) — reshaped to our schema */
import { standardFor } from './strengthStandards';
import { progressiveLoad } from './progressiveOverload';

/* Curated anchor lifts — exact names so PR tracking (Bench/Squat/Deadlift) and the
   validated strength-standards table can key off them for load suggestions. */
const CURATED_EXERCISES = [
  { name: 'Barbell Bench Press', muscle: 'Chest', equipment: 'Barbell', pattern: 'push', difficulty: 'Intermediate' },
  { name: 'Back Squat', muscle: 'Quads', equipment: 'Barbell', pattern: 'squat', difficulty: 'Intermediate' },
  { name: 'Deadlift', muscle: 'Hamstrings', equipment: 'Barbell', pattern: 'hinge', difficulty: 'Advanced' },
  { name: 'Pull-Up', muscle: 'Back', equipment: 'Bodyweight', pattern: 'pull', difficulty: 'Intermediate' },
  { name: 'Overhead Press', muscle: 'Shoulders', equipment: 'Barbell', pattern: 'push', difficulty: 'Intermediate' },
  { name: 'Incline DB Press', muscle: 'Chest', equipment: 'Dumbbells', pattern: 'push', difficulty: 'Beginner' },
  { name: 'Cable Fly', muscle: 'Chest', equipment: 'Cable', pattern: 'push', difficulty: 'Beginner' },
  { name: 'Lateral Raise', muscle: 'Shoulders', equipment: 'Dumbbells', pattern: 'push', difficulty: 'Beginner' },
  { name: 'Bulgarian Split Squat', muscle: 'Quads', equipment: 'Dumbbells', pattern: 'squat', difficulty: 'Intermediate' },
  { name: 'Tricep Pushdown', muscle: 'Triceps', equipment: 'Cable', pattern: 'push', difficulty: 'Beginner' },
  { name: 'Barbell Row', muscle: 'Back', equipment: 'Barbell', pattern: 'pull', difficulty: 'Intermediate' },
  { name: 'Seated Cable Row', muscle: 'Back', equipment: 'Cable', pattern: 'pull', difficulty: 'Beginner' },
  { name: 'Hip Thrust', muscle: 'Glutes', equipment: 'Barbell', pattern: 'hinge', difficulty: 'Beginner' },
  { name: 'Kettlebell Swing', muscle: 'Glutes', equipment: 'Dumbbells', pattern: 'hinge', difficulty: 'Intermediate' },
  { name: 'Standing Calf Raise', muscle: 'Calves', equipment: 'Dumbbells', pattern: 'squat', difficulty: 'Beginner' },
  { name: "Farmer's Carry", muscle: 'Core', equipment: 'Dumbbells', pattern: 'carry', difficulty: 'Beginner' },
  { name: 'Walking Lunge', muscle: 'Quads', equipment: 'Dumbbells', pattern: 'squat', difficulty: 'Beginner' },
];
const _curatedNames = new Set(CURATED_EXERCISES.map(e => e.name));
export const EXERCISE_DB = [...CURATED_EXERCISES, ...OPEN_EXERCISE_DATA.filter(e => !_curatedNames.has(e.name))];

/** Which muscle groups a calendar day label targets. */
export const DAY_MUSCLES = {
  'Chest': ['Chest', 'Triceps'], 'Back': ['Back', 'Biceps'], 'Legs': ['Quads', 'Hamstrings', 'Glutes', 'Calves'],
  'Shoulders': ['Shoulders', 'Triceps'], 'Arms': ['Biceps', 'Triceps'], 'Weak point': ['Back', 'Shoulders'],
  'Push': ['Chest', 'Shoulders', 'Triceps'], 'Pull': ['Back', 'Biceps'], 'Upper': ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps'],
  'Lower': ['Quads', 'Hamstrings', 'Glutes', 'Calves'], 'Squat': ['Quads', 'Glutes'], 'Bench': ['Chest', 'Triceps'],
  'Deadlift': ['Hamstrings', 'Back', 'Glutes'], 'Accessory': ['Biceps', 'Triceps', 'Core'],
  'Push skill': ['Chest', 'Shoulders', 'Triceps'], 'Pull skill': ['Back', 'Biceps'], 'Core + skill': ['Core'],
  'Squat strength': ['Quads', 'Glutes'],
};
/** Days built around a movement quality rather than a muscle group. */
export const DAY_PATTERNS = {
  'Power': ['plyo', 'squat', 'hinge'], 'Speed': ['plyo', 'cardio'], 'Conditioning': ['cardio', 'plyo'],
  'Sport skill': ['plyo', 'core'], 'Mobility': ['mobility'], 'Mobility flow': ['mobility'],
  'Mat flow': ['mobility', 'core'], 'Core + control': ['core', 'mobility'],
  'Snatch technique': ['hinge', 'squat'], 'Clean & Jerk': ['hinge', 'squat'],
  'Full body A': ['squat', 'push'], 'Full body B': ['hinge', 'pull'], 'Full body C': ['squat', 'push', 'pull'],
};
/** Equipment tiers each access level unlocks. */
export const EQUIPMENT_ACCESS = {
  'Full gym': ['Barbell', 'Dumbbells', 'Cable', 'Bodyweight', 'Machine'], 'Home gym': ['Barbell', 'Dumbbells', 'Bodyweight'],
  'Dumbbells': ['Dumbbells', 'Bodyweight'], 'Bodyweight': ['Bodyweight'], 'Minimal equipment': ['Dumbbells', 'Bodyweight'],
};
/** Sets/reps/effort target per training goal. */
export const GOAL_SCHEME = {
  'Build Muscle': { label: 'HYPERTROPHY', sets: 4, repsMin: 8, repsMax: 12, rir: 1, restSec: 75 },
  'Strength': { label: 'STRENGTH', sets: 4, repsMin: 3, repsMax: 6, rir: 2, restSec: 150 },
  'Fat Loss': { label: 'FAT LOSS', sets: 3, repsMin: 12, repsMax: 15, rir: 1, restSec: 45 },
  'Athletic Performance': { label: 'ATHLETIC', sets: 4, repsMin: 4, repsMax: 8, rir: 2, restSec: 100 },
  'Mobility': { label: 'MOBILITY', sets: 3, repsMin: 10, repsMax: 15, rir: 3, restSec: 40 },
};
export const DEFAULT_SCHEME = { label: 'GENERAL FITNESS', sets: 3, repsMin: 8, repsMax: 12, rir: 2, restSec: 70 };
const EXP_ORDER = ['Beginner', 'Intermediate', 'Advanced', 'Elite'];
const EXP_EXERCISE_COUNT = { Beginner: 4, Intermediate: 5, Advanced: 6, Elite: 7 };
const round2_5 = v => Math.round(v / 2.5) * 2.5;

/** Body composition — informational BMI band only, never a somatotype/personality label. Nudges Fat Loss programming. */
export function bodyComposition(profile) {
  if (!profile.weight || !profile.height) return null;
  const h = profile.height / 100;
  const bmi = profile.weight / (h * h);
  let category = 'Moderate';
  if (bmi < 18.5) category = 'Lean'; else if (bmi >= 25) category = 'Higher';
  return { bmi: Math.round(bmi * 10) / 10, category };
}

const PR_MAP = { 'Back Squat': 'Squat', 'Deadlift': 'Deadlift', 'Barbell Bench Press': 'Bench Press' };
const STANDARD_LIFT = { 'Back Squat': 'squat', 'Deadlift': 'deadlift', 'Barbell Bench Press': 'bench' };
/* Accessory-lift estimate, expressed as a fraction of the nearest anchor-lift standard for that pattern. */
const PATTERN_ANCHOR = { squat: ['squat', 0.55], hinge: ['deadlift', 0.5], push: ['bench', 0.55], pull: ['squat', 0.45], core: ['bench', 0.3], carry: ['deadlift', 0.35] };

/**
 * Cold-start load estimate — used when there's no PR and no logged history yet.
 * Prefers real population strength standards (see engine/strengthStandards.js) for
 * anchor lifts and their close pattern relatives; falls back to a bodyweight-relative
 * guess only for equipment/patterns the standards data can't inform (dumbbell isolation etc).
 */
function coldStartLoad(ex, profile, scheme, prs) {
  if (ex.equipment === 'Bodyweight') return 0;
  const prName = PR_MAP[ex.name];
  if (prName) {
    const pr = (prs || []).find(p => p[0] === prName);
    if (pr && pr[1] > 0) {
      const repsMid = (scheme.repsMin + scheme.repsMax) / 2;
      const pct = Math.max(0.5, Math.min(0.95, 1 - (repsMid - 1) * 0.025));
      return round2_5(pr[1] * pct);
    }
  }
  const bw = profile.weight || 70;
  const lift = STANDARD_LIFT[ex.name];
  if (lift) {
    const std = standardFor(lift, bw, profile.experience);
    if (std) {
      const repsMid = (scheme.repsMin + scheme.repsMax) / 2;
      const pct = Math.max(0.5, Math.min(0.95, 1 - (repsMid - 1) * 0.025));
      return round2_5(std * pct);
    }
  }
  const anchor = PATTERN_ANCHOR[ex.pattern];
  if (anchor && ex.equipment !== 'Dumbbells') {
    const [anchorLift, frac] = anchor;
    const std = standardFor(anchorLift, bw, profile.experience);
    if (std) return round2_5(std * frac * 0.6);
  }
  const expMult = { Beginner: 0.55, Intermediate: 0.8, Advanced: 1.05, Elite: 1.35 }[profile.experience] || 0.7;
  const patternMult = { squat: 0.85, hinge: 0.95, push: 0.5, pull: 0.45, core: 0.3, carry: 0.55, plyo: 0, mobility: 0, cardio: 0 }[ex.pattern] ?? 0.5;
  let base = bw * expMult * patternMult;
  if (ex.equipment === 'Dumbbells') base *= 0.35;
  return round2_5(Math.max(2.5, base));
}

/**
 * The engine: profile (goal/style/experience/equipment/weight) + a calendar day label
 * + workout history -> a fully populated workout. Load per exercise comes from
 * progressive overload (last logged performance) when history exists, otherwise a
 * standards-informed cold start.
 */
export function generateWorkout(profile, dayLabel, prs, workouts) {
  const scheme = GOAL_SCHEME[profile.goal] || DEFAULT_SCHEME;
  const equipAllowed = EQUIPMENT_ACCESS[profile.equipment] || EQUIPMENT_ACCESS['Full gym'];
  const maxDiffIdx = Math.max(0, EXP_ORDER.indexOf(profile.experience));
  const allowedDiff = EXP_ORDER.slice(0, maxDiffIdx + 1);
  const muscles = DAY_MUSCLES[dayLabel];
  const patterns = DAY_PATTERNS[dayLabel];

  let pool = EXERCISE_DB.filter(e => equipAllowed.includes(e.equipment) && allowedDiff.includes(e.difficulty));
  if (muscles) pool = pool.filter(e => muscles.includes(e.muscle));
  else if (patterns) pool = pool.filter(e => patterns.includes(e.pattern));
  else pool = pool.filter(e => ['squat', 'hinge', 'push', 'pull'].includes(e.pattern));

  const order = { squat: 0, hinge: 1, push: 2, pull: 3, core: 4, carry: 5 };
  pool = [...pool].sort((a, b) => (order[a.pattern] ?? 9) - (order[b.pattern] ?? 9));

  const count = EXP_EXERCISE_COUNT[profile.experience] || 5;
  let picked = pool.slice(0, count);
  if (picked.length < count) {
    const extra = EXERCISE_DB.filter(e => equipAllowed.includes(e.equipment) && !picked.includes(e));
    picked = [...picked, ...extra.slice(0, count - picked.length)];
  }

  const exercisesOut = picked.map(ex => {
    const reps = Math.round((scheme.repsMin + scheme.repsMax) / 2);
    const progression = progressiveLoad(ex, scheme, workouts);
    const w = progression ? progression.weight : coldStartLoad(ex, profile, scheme, prs);
    return {
      name: ex.name,
      progressNote: progression ? progression.note : null,
      sets: Array.from({ length: scheme.sets }, () => ({ w, r: reps, rir: scheme.rir, done: false })),
    };
  });

  const bc = bodyComposition(profile);
  if (profile.goal === 'Fat Loss' && bc && bc.category === 'Higher') {
    exercisesOut.push({ name: 'Conditioning Finisher — 10 min intervals', sets: [{ w: 0, r: 1, rir: scheme.rir, done: false }] });
  }
  return { name: dayLabel + ' — ' + scheme.label, exercises: exercisesOut, meta: scheme };
}
