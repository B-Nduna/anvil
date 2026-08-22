# ANVIL — Training OS

A dark, no-fluff training console: onboarding wizard, an auto-generated weekly
training calendar, a workout-selection engine with progressive overload, and
a validated strength-standards reference — all running client-side.

## Highlights

- **Onboarding → tailored program.** A step-by-step wizard (goal, training
  style, experience, frequency, equipment) builds a real weekly calendar
  and a starting Training Identity score.
- **Workout selection engine** (`src/engine/workoutEngine.js`) — filters
  exercises by equipment access and experience level, targets the right
  muscle groups or movement patterns for the day, and assigns sets/reps/RIR
  from a goal-specific intensity scheme.
- **Progressive overload** (`src/engine/progressiveOverload.js`) — every
  generated workout checks your last logged session for that exact exercise
  and adjusts the working weight up, down, or holds steady based on the
  reps and RIR you actually logged.
- **Validated strength standards** (`src/engine/strengthStandards.js`) —
  cold-start load suggestions for Squat/Bench/Deadlift are anchored to real
  percentile bands computed from the OpenPowerlifting dataset (2.27M
  competition entries), not guessed multipliers.
- **629 exercises** merged from a hand-picked anchor set plus
  [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (public
  domain), tagged by muscle group, equipment, movement pattern, and
  difficulty.

## Stack

React 18 + Vite, no backend (state persists to `localStorage` for now — a
real backend is the next step). Icons via `lucide-react`.

## Running locally

```bash
npm install
npm run dev
```

## Project structure

```
src/
  App.jsx              boot flow (loading → auth → onboarding → build) + shell
  main.jsx             entry point
  data/                seed data, exercise dataset, strength standards
  engine/               pure-logic modules — calendar, identity, workout
                        selection, progressive overload, strength standards
  screens/              first-run flow screens
  ui/                   shared small components (Card, Metric, Chart, ...)
  pages/                Dashboard, Train, Programs, Progress, Library, Profile
```

The `engine/` modules have no React dependency and can be tested standalone.

## Data sources & licensing

- Exercise data: [free-exercise-db](https://github.com/yuhonas/free-exercise-db)
  (public domain / Unlicense), reshaped into this app's schema.
- Strength standards: derived from [OpenPowerlifting](https://www.openpowerlifting.org/)
  (public domain), filtered to raw/tested lifters, percentile bands computed
  offline per bodyweight bracket. See comments in `strengthStandards.js` for
  methodology and known limitations (data currently pooled across sexes).

## Known limitations / roadmap

- No backend yet — auth is local-only, data lives in the browser.
- Strength standards are pooled across sexes; adding a sex field to the
  profile would allow more precise standards.
- No deload/fatigue-aware programming yet — the calendar doesn't adapt to
  missed sessions.
