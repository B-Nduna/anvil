# ANVIL — Training OS

**[Live demo →](https://b-nduna.github.io/anvil/)**

A dark, no-fluff training console: onboarding wizard, an auto-generated weekly
training calendar, a workout-selection engine with progressive overload, and
a validated strength-standards reference — all running client-side.

## Screenshots

<!--
  Add screenshots here once the app is live — a few PNGs dropped into a
  /screenshots folder and referenced like this work well on GitHub:

  | Onboarding | Dashboard | Active session |
  |---|---|---|
  | ![onboarding](screenshots/onboarding.png) | ![dashboard](screenshots/dashboard.png) | ![workout](screenshots/workout.png) |
-->

## Highlights

- **Athlete Profile onboarding.** An 8-step wizard — About You, Training
  History, Goals, Training Style, Availability, Equipment, Limitations,
  then a review screen — builds a real athlete profile, not just a goal
  picker. See "On age, sex, and not overclaiming" below for how each field
  is (and isn't) used.
- **Workout selection engine** (`src/engine/workoutEngine.js`) — filters
  exercises by equipment access, experience level, and any noted physical
  limitations; targets the right muscle groups or movement patterns for
  the day; assigns sets/reps/RIR from a goal-specific intensity scheme;
  scales exercise count to your stated session length; blends a secondary
  goal into the session where it fits.
- **Progressive overload** (`src/engine/progressiveOverload.js`) — every
  generated workout checks your last logged session for that exact exercise
  and adjusts the working weight up, down, or holds steady based on the
  reps and RIR you actually logged.
- **Validated, opt-in strength standards** (`src/engine/strengthStandards.js`)
  — cold-start load suggestions and PR classification are anchored to real
  percentile bands computed from the OpenPowerlifting dataset (2.27M
  competition entries), separately for male, female, and pooled reference
  sets. Sex is entirely optional and only ever changes which table is shown.
- **629 exercises** merged from a hand-picked anchor set plus
  [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (public
  domain), tagged by muscle group, equipment, movement pattern, and
  difficulty.

## On age, sex, and not overclaiming

Every field in onboarding maps to a specific, named use — nothing is
collected "because it's available." Worth being explicit about what each
one actually does:

| Field | Used for |
|---|---|
| **Sex** | Opt-in only. Picks which strength-standards reference table (Male / Female / pooled) is used for load suggestions and PR classification. Nothing else. |
| **Age** | Displayed on the Athlete Profile for context. **Not** used in any load, volume, or recovery calculation — a single age-based multiplier would be exactly the kind of pseudo-precision this app is trying to avoid. |
| **Training age** | Displayed alongside chronological age, deliberately kept separate — a 35-year-old with 6 months of training and a 22-year-old with 6 years shouldn't be treated the same. Currently informational; **Experience level** (the self-assessed Beginner/Intermediate/Advanced/Elite field) is what actually drives exercise selection and difficulty gating today. |
| **Session duration** | Scales the number of exercises per session (3 for a 30-min session up to 9 for 90+ min). |
| **Limitations** | A small curated list (Knee, Shoulder, Lower back, Wrist, Hip, Elbow) mapped to a transparent keyword-exclusion filter — see `LIMITATION_EXCLUDE` in `workoutEngine.js`. This is a basic exercise filter, **not medical guidance**. Free-text notes are stored and shown during workouts but deliberately not auto-filtered, since arbitrary text can't be safely interpreted. |
| **Secondary goal** | Blended into the last exercise of each generated session, using that goal's own set/rep/RIR scheme, so it's a visible part of the program rather than a decorative field. |

The **Training Emphasis** percentages (Hypertrophy/Strength/Athletic/
Conditioning/Mobility) describe emphasis in your current program — not a
claim about your body or ability. They sit in their own card, separate
from the factual **Athlete Profile** block (age, sex, height, weight,
training age, experience, goals, frequency, equipment), so the app never
conflates "what you told us" with "a computed score."

## Stack

React 18 + Vite, no backend (state persists to `localStorage` for now — a
real backend is the next step). Icons via `lucide-react`.

## Running locally

```bash
npm install
npm run dev
```

## Deployment

Deploys automatically to GitHub Pages via `.github/workflows/deploy.yml` on
every push to `main`. One-time setup after pushing: in the repo, go to
**Settings → Pages → Source** and select **GitHub Actions**. The next push
(or a manual run from the **Actions** tab) will publish the site to
`https://<your-username>.github.io/anvil/`.

The Vite `base` path is set to `/anvil/` in `vite.config.js` to match that
URL. If you fork this under a different repo name, or deploy to a custom
domain, build with `VITE_BASE=/` (or your subpath) to override it:

```bash
VITE_BASE=/ npm run build
```

## Project structure

```
src/
  App.jsx              boot flow (loading → auth → onboarding → build) + shell
  main.jsx             entry point
  assetPath.js          base-path-aware asset URLs (for GitHub Pages subpath)
  data/                seed data, exercise dataset, strength standards
  engine/               pure-logic modules — calendar, identity, workout
                        selection, progressive overload, strength standards
  screens/              first-run flow screens (8-step onboarding lives here)
  ui/                   shared small components (Card, AthleteProfile, Chart, ...)
  pages/                Dashboard, Train, Programs, Progress, Library, Profile
```

The `engine/` modules have no React dependency and can be tested standalone.

## Data sources & licensing

- Exercise data: [free-exercise-db](https://github.com/yuhonas/free-exercise-db)
  (public domain / Unlicense), reshaped into this app's schema.
- Strength standards: derived from [OpenPowerlifting](https://www.openpowerlifting.org/)
  (public domain), filtered to raw/tested lifters, percentile bands computed
  offline per bodyweight bracket, separately for M/F and pooled. See
  comments in `strengthStandards.js` for full methodology.

## Known limitations / roadmap

- No backend yet — auth is local-only, data lives in the browser.
- Training age and chronological age are collected and displayed but not
  yet wired into the programming logic (see "On age, sex, and not
  overclaiming" above) — a fatigue/recovery model that actually uses them
  responsibly is a natural next step, not a quick multiplier.
- No deload/fatigue-aware programming yet — the calendar doesn't adapt to
  missed sessions.
- Limitation filtering is a basic keyword match against exercise names, not
  a clinical understanding of injuries — always a reason to consult a
  professional for injury-specific programming, not a replacement for one.
