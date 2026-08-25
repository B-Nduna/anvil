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

/*
 * Limitations: a short curated list of common areas, each mapping to a small,
 * transparent exclusion set (exercise-name keywords). This is a basic keyword
 * filter, not a clinical assessment — it's deliberately conservative and never
 * claims to understand an injury. Free-text notes the athlete adds are stored
 * and surfaced in the workout modal, but are NOT used to filter automatically,
 * since arbitrary text can't be safely interpreted.
 */
export const LIMITATION_OPTIONS = ['Knee', 'Shoulder', 'Lower back', 'Wrist', 'Hip', 'Elbow'];
const LIMITATION_EXCLUDE = {
  'Knee': ['squat', 'lunge', 'jump', 'step up', 'step-up', 'box jump'],
  'Shoulder': ['overhead press', 'shoulder press', 'lateral raise', 'upright row', 'behind the neck', 'dip'],
  'Lower back': ['deadlift', 'good morning', 'hyperextension', 'row', 'clean'],
  'Wrist': ['push-up', 'push up', 'bench press', 'front squat', 'curl'],
  'Hip': ['squat', 'lunge', 'hip thrust', 'leg press'],
  'Elbow': ['curl', 'pushdown', 'extension', 'dip'],
};
function excludedByLimitations(ex, limitations) {
  if (!limitations || !limitations.length) return false;
  const name = ex.name.toLowerCase();
  return limitations.some(l => (LIMITATION_EXCLUDE[l] || []).some(kw => name.includes(kw)));
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
 * `sex` is optional — when provided, pulls from the matching reference table.
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
    const std = standardFor(lift, bw, profile.experience, profile.sex);
    if (std) {
      const repsMid = (scheme.repsMin + scheme.repsMax) / 2;
      const pct = Math.max(0.5, Math.min(0.95, 1 - (repsMid - 1) * 0.025));
      return round2_5(std * pct);
    }
  }
  const anchor = PATTERN_ANCHOR[ex.pattern];
  if (anchor && ex.equipment !== 'Dumbbells') {
    const [anchorLift, frac] = anchor;
    const std = standardFor(anchorLift, bw, profile.experience, profile.sex);
    if (std) return round2_5(std * frac * 0.6);
  }
  const expMult = { Beginner: 0.55, Intermediate: 0.8, Advanced: 1.05, Elite: 1.35 }[profile.experience] || 0.7;
  const patternMult = { squat: 0.85, hinge: 0.95, push: 0.5, pull: 0.45, core: 0.3, carry: 0.55, plyo: 0, mobility: 0, cardio: 0 }[ex.pattern] ?? 0.5;
  let base = bw * expMult * patternMult;
  if (ex.equipment === 'Dumbbells') base *= 0.35;
  return round2_5(Math.max(2.5, base));
}

/** Session duration nudges exercise count up/down from the experience-level default. Purely a time-budget adjustment. */
function exerciseCountFor(profile) {
  const base = EXP_EXERCISE_COUNT[profile.experience] || 5;
  const mins = Number(profile.sessionDuration) || 60;
  let delta = 0;
  if (mins <= 30) delta = -2;
  else if (mins <= 45) delta = -1;
  else if (mins >= 90) delta = 2;
  else if (mins >= 75) delta = 1;
  return Math.max(3, Math.min(9, base + delta));
}

/**
 * The engine: profile + a calendar day label + PRs + workout history -> a fully
 * populated workout. Load per exercise comes from progressive overload (last logged
 * performance) when history exists, otherwise a standards-informed cold start.
 *
 * Uses: goal (primary intensity scheme), secondaryGoal (blends into the last exercise
 * so both goals get some representation), experience + equipment (exercise pool),
 * sessionDuration (exercise count), limitations (exclusion filter), sex (opt-in,
 * only affects load estimates via strength standards), cardioPreference (whether a
 * conditioning finisher gets added). Age and training age are NOT used here — see
 * engine/strengthStandards.js and README for why.
 */
export function generateWorkout(profile, dayLabel, prs, workouts) {
  const scheme = GOAL_SCHEME[profile.goal] || DEFAULT_SCHEME;
  const secondaryScheme = profile.secondaryGoal && profile.secondaryGoal !== profile.goal ? GOAL_SCHEME[profile.secondaryGoal] : null;
  const equipAllowed = EQUIPMENT_ACCESS[profile.equipment] || EQUIPMENT_ACCESS['Full gym'];
  const maxDiffIdx = Math.max(0, EXP_ORDER.indexOf(profile.experience));
  const allowedDiff = EXP_ORDER.slice(0, maxDiffIdx + 1);
  const muscles = DAY_MUSCLES[dayLabel];
  const patterns = DAY_PATTERNS[dayLabel];

  let pool = EXERCISE_DB.filter(e => equipAllowed.includes(e.equipment) && allowedDiff.includes(e.difficulty) && !excludedByLimitations(e, profile.limitations));
  if (muscles) pool = pool.filter(e => muscles.includes(e.muscle));
  else if (patterns) pool = pool.filter(e => patterns.includes(e.pattern));
  else pool = pool.filter(e => ['squat', 'hinge', 'push', 'pull'].includes(e.pattern));

  const order = { squat: 0, hinge: 1, push: 2, pull: 3, core: 4, carry: 5 };
  pool = [...pool].sort((a, b) => (order[a.pattern] ?? 9) - (order[b.pattern] ?? 9));

  const count = exerciseCountFor(profile);
  let picked = pool.slice(0, count);
  if (picked.length < count) {
    const extra = EXERCISE_DB.filter(e => equipAllowed.includes(e.equipment) && !excludedByLimitations(e, profile.limitations) && !picked.includes(e));
    picked = [...picked, ...extra.slice(0, count - picked.length)];
  }

  const exercisesOut = picked.map((ex, i) => {
    // The last exercise of the session leans on the secondary goal's rep/effort scheme (if set),
    // so a stated secondary goal actually shows up in the program rather than being decorative.
    const useSecondary = secondaryScheme && i === picked.length - 1;
    const activeScheme = useSecondary ? secondaryScheme : scheme;
    const reps = Math.round((activeScheme.repsMin + activeScheme.repsMax) / 2);
    const progression = progressiveLoad(ex, activeScheme, workouts);
    const w = progression ? progression.weight : coldStartLoad(ex, profile, activeScheme, prs);
    return {
      name: ex.name,
      progressNote: progression ? progression.note : (useSecondary ? `Secondary goal focus: ${profile.secondaryGoal}` : null),
      sets: Array.from({ length: activeScheme.sets }, () => ({ w, r: reps, rir: activeScheme.rir, done: false })),
    };
  });

  const bc = bodyComposition(profile);
  const wantsConditioning = profile.cardioPreference === 'High' || (profile.cardioPreference !== 'Low' && profile.goal === 'Fat Loss' && bc && bc.category === 'Higher');
  if (wantsConditioning) {
    exercisesOut.push({ name: 'Conditioning Finisher — 10 min intervals', sets: [{ w: 0, r: 1, rir: scheme.rir, done: false }] });
  }
  return { name: dayLabel + ' — ' + scheme.label, exercises: exercisesOut, meta: scheme };
}
