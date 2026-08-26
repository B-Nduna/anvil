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
- **Training level engine** (`src/engine/trainingLevel.js`) — training age
  (years actually training) is reconciled with self-reported experience into
  a 5-tier programming level that drives exercise-difficulty gating, base
  exercise count, working-set caps, how aggressive progressive-overload jumps
  are, and prescribed rest time. A 22-year-old with 6 years of training and a
  35-year-old with 6 months don't get the same program, even if they both
  self-report "Intermediate."
- **Progressive overload** (`src/engine/progressiveOverload.js`) — every
  generated workout checks your last logged session for that exact exercise
  and adjusts the working weight up, down, or holds steady based on the
  reps and RIR you actually logged, scaled by training level (above).
- **Validated, opt-in strength standards** (`src/engine/strengthStandards.js`)
  — cold-start load suggestions and PR classification are anchored to real
  percentile bands computed from the OpenPowerlifting dataset (2.27M
  competition entries), separately for male, female, and pooled reference
  sets. Sex-specific strength standards are optional reference data — they
  do not determine your training program.
- **629 exercises** merged from a hand-picked anchor set plus
  [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (public
  domain), tagged by muscle group, equipment, movement pattern, and
  difficulty.
- **Profile changes propagate automatically.** Saving a profile edit
  recalculates Training Emphasis immediately, and rebuilds the weekly
  calendar if frequency, style, or preferred days changed — no separate
  manual "recalculate" step required to see your program reflect what you
  just told it. A manual Recalculate button remains, for refreshing after
  new sessions without a profile change.

## On age, sex, and not overclaiming

Every field in onboarding maps to a specific, named use — nothing is
collected "because it's available." Worth being explicit about what each
one actually does:

| Field | Used for |
|---|---|
| **Sex** | Opt-in only. Sex-specific strength standards are optional reference data — they do not determine your training program. They only pick which reference table (Male / Female / pooled) is used for load suggestions and PR classification. Nothing else reads this field. |
| **Age** | Displayed on the Athlete Profile for context. **Not** used in any load, volume, recovery, or programming calculation — a single age-based multiplier would be exactly the kind of pseudo-precision this app is trying to avoid. |
| **Training age** | Distinct from chronological age, and it *does* drive programming — see **Training level** above. It's blended with self-reported experience (65% experience / 35% training age) into a 5-tier score that gates exercise difficulty, sets a base exercise count, caps working sets, scales progression aggressiveness, and adjusts prescribed rest time. "Current performance" (how recent sessions actually went) is deliberately not folded into this score — it's already reflected per-exercise via progressive overload, and mixing the two risked double-counting the same signal without enough history to do it responsibly. |
| **Session duration** | Scales the number of exercises per session, on top of the training-level base count. |
| **Limitations** | A small curated list (Knee, Shoulder, Lower back, Wrist, Hip, Elbow) mapped to a transparent keyword-exclusion filter — see `LIMITATION_EXCLUDE` in `workoutEngine.js`. This is a basic exercise filter, **not medical guidance**. Free-text notes are stored and shown during workouts but deliberately not auto-filtered, since arbitrary text can't be safely interpreted. |
| **Secondary goal** | Blended into the last exercise of each generated session, using that goal's own set/rep/RIR scheme, so it's a visible part of the program rather than a decorative field. |

The **Training Emphasis** percentages (Hypertrophy/Strength/Athletic/
Conditioning/Mobility) describe emphasis in your current program — not a
claim about your body or ability, and deliberately not influenced by age,
sex, height, or weight (identity.js uses experience, frequency, recent
volume, and goal only). They sit in their own card, separate from the
factual **Athlete Profile** block (age, sex, height, weight, training age,
experience, goals, frequency, equipment), so the app never conflates "what
you told us" with "a computed score."

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
- No deload/fatigue-aware programming yet — the calendar doesn't adapt to
  missed sessions. Training level (see above) adjusts baseline volume and
  progression pace, but doesn't yet react to a bad week in real time.
- Limitation filtering is a basic keyword match against exercise names, not
  a clinical understanding of injuries — always a reason to consult a
  professional for injury-specific programming, not a replacement for one.
- ANVIL is becoming a structured athlete data model with a training engine
  on top, rather than just a fitness UI — the next priorities are making
  Workout History/PRs the central data source everything else reads from,
  a custom program builder, and richer per-exercise detail/history in the
  Library (629 exercises is too large a database to leave as a plain
  searchable catalogue).
