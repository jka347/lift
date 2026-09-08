# Workout Tracker — Build Spec (Claude Code handoff)

## What this is
A single-page workout tracker PWA for one user (Jeff), hosted free on GitHub Pages, with cross-device data sync (phone + PC) via a private GitHub Gist. Optimized for mid-workout phone use: big tap targets, instant load, minimal input.

## Stack — keep it tiny
- **Vanilla HTML/CSS/JS, single `index.html`** (inline CSS/JS acceptable; split files only if it stays trivial). No framework, no build step, no dependencies.
- **Hosting:** GitHub Pages from a public repo (`main` branch, root or `/docs`).
- **PWA:** `manifest.json` + minimal service worker for home-screen install and offline shell. Cache-first for the shell; data always network-first.
- **Storage:** one JSON document in a **private GitHub Gist**, via the GitHub REST API.

## Storage design (private gist)
- One gist, one file: `tracker-data.json`.
- Auth: fine-grained PAT with **gist scope only**, pasted once per device into a settings screen, stored in `localStorage`.
- On app open: `GET` the gist → hydrate state. On save (end of a set entry or explicit save): `PATCH` the gist.
- **Sync policy:** last-write-wins, guarded by an `updated_at` ISO timestamp in the JSON. Before writing, re-fetch; if remote `updated_at` is newer than the local baseline, prompt: "Remote data is newer — reload it or overwrite?" (Single user; real conflicts will be rare.)
- **Offline:** queue writes in `localStorage`; flush on reconnect. Show a subtle "unsynced" indicator when queued writes exist.
- First-run setup screen: paste PAT → app creates the gist if none exists (store gist id in the JSON and in localStorage) → done. Include a "reconnect" path for a second device: paste PAT, app finds the gist by filename.

## Data model (the gist JSON)
```json
{
  "version": 7,
  "updated_at": "2026-08-16T15:04:05Z",
  "settings": { "units": "lb" },
  "program": {
    "days": [
      {
        "id": "upperA",
        "name": "Upper A — Chest & Shoulders",
        "exercises": [
          { "id": "bench", "startWeight": 45,   "name": "DB Bench Press",            "sets": 4, "repLow": 6,  "repHigh": 10, "perSide": false, "superset": null },
          { "id": "ohp", "startWeight": 20,     "name": "DB Overhead Press",          "sets": 3, "repLow": 8,  "repHigh": 12, "perSide": false, "superset": null, "increment": 2.5 },
          { "id": "incline", "startWeight": 35, "name": "Incline DB Bench",           "sets": 3, "repLow": 8,  "repHigh": 12, "perSide": false, "superset": "ss1" },
          { "id": "row", "startWeight": 45,     "name": "One-Arm Row",                "sets": 3, "repLow": 8,  "repHigh": 12, "perSide": true,  "superset": "ss1" },
          { "id": "latraise", "startWeight": 10,"name": "Lateral Raises",             "sets": 3, "repLow": 12, "repHigh": 15, "perSide": false, "superset": "ss2", "increment": 2.5 },
          { "id": "curl", "startWeight": 20,    "name": "DB Curls",                   "sets": 3, "repLow": 12, "repHigh": 15, "perSide": false, "superset": "ss2" },
          { "id": "triext", "startWeight": 25,  "name": "Overhead Triceps Extension", "sets": 3, "repLow": 10, "repHigh": 12, "perSide": false, "superset": "ss3" },
          { "id": "hammer", "startWeight": 25,  "name": "Hammer Curls",               "sets": 3, "repLow": 10, "repHigh": 12, "perSide": false, "superset": "ss3" }
        ]
      },
      { "id": "upperB", "name": "Upper B — Back & Arms", "exercises": [
          { "id": "rowheavy", "startWeight": 50, "name": "One-Arm Row (heavy)",   "sets": 4, "repLow": 6,  "repHigh": 10, "perSide": true },
          { "id": "bench2", "startWeight": 40,   "name": "DB Bench Press",        "sets": 3, "repLow": 8,  "repHigh": 12 },
          { "id": "csrow", "startWeight": 30,    "name": "Chest-Supported Row",   "sets": 3, "repLow": 10, "repHigh": 12, "superset": "ss1" },
          { "id": "pullover", "startWeight": 30, "name": "DB Pullover",           "sets": 3, "repLow": 10, "repHigh": 12, "superset": "ss1" },
          { "id": "seatpress", "startWeight": 20,"name": "Seated DB Press",       "sets": 3, "repLow": 10, "repHigh": 15, "superset": "ss2", "increment": 2.5 },
          { "id": "reardelt", "startWeight": 10, "name": "Rear Delt Flyes",       "sets": 3, "repLow": 10, "repHigh": 15, "superset": "ss2", "increment": 2.5 },
          { "id": "curl2", "startWeight": 25,    "name": "DB Curls",              "sets": 3, "repLow": 8,  "repHigh": 12, "superset": "ss3" },
          { "id": "skull", "startWeight": 15,    "name": "Skull Crushers",        "sets": 3, "repLow": 8,  "repHigh": 12, "superset": "ss3" }
      ]},
      { "id": "lowerA", "name": "Lower + Core", "exercises": [
          { "id": "goblet", "startWeight": 45,  "name": "Goblet Squat",           "sets": 4, "repLow": 6,  "repHigh": 10, "rest": 150 },
          { "id": "rdl", "startWeight": 45,     "name": "Romanian Deadlift",      "sets": 3, "repLow": 8,  "repHigh": 10 },
          { "id": "kbswing", "startWeight": 20, "name": "KB Swings",              "sets": 3, "repLow": 20, "repHigh": 50, "increment": 15 },
          { "id": "calf", "startWeight": 0, "name": "Supported Single-Leg Calf Raise", "sets": 2, "repLow": 10, "repHigh": 20, "perSide": true, "rest": 90 },
          { "id": "wsitup", "startWeight": 10,  "name": "Weighted Sit-Ups",       "sets": 3, "repLow": 10, "repHigh": 15 },
          { "id": "abrollout", "startWeight": 0, "name": "Kneeling Ab-Wheel Rollout", "sets": 2, "repLow": 6, "repHigh": 12, "rest": 90, "progression": "manual" }
      ]},
      { "id": "lowerB", "name": "Lower + Core B", "exercises": [
          { "id": "rdlheavy", "startWeight": 50,"name": "RDL (heavy)",            "sets": 4, "repLow": 6,  "repHigh": 8 },
          { "id": "hipthrust", "startWeight": 50,"name": "Hip Thrust",            "sets": 3, "repLow": 10, "repHigh": 12 },
          { "id": "calf", "startWeight": 0, "name": "Supported Single-Leg Calf Raise", "sets": 2, "repLow": 10, "repHigh": 20, "perSide": true, "rest": 90 },
          { "id": "ohcarry", "startWeight": 20, "name": "Overhead Carry",         "sets": 3, "repLow": 30, "repHigh": 60, "perSide": true, "unit": "sec", "superset": "ssC", "supersetNote": "Overhead L → suitcase R → overhead R → suitcase L. One implement at a time; minimal rest between trips." },
          { "id": "twist", "startWeight": 20,   "name": "KB Russian Twists",      "sets": 3, "repLow": 12, "repHigh": 16 },
          { "id": "carry", "startWeight": 45,   "name": "Suitcase Carry (heavy)", "sets": 3, "repLow": 30, "repHigh": 45, "perSide": true, "unit": "sec", "superset": "ssC" }
      ]}
    ]
  },
  "sessions": [
    {
      "date": "2026-08-16",
      "dayId": "upperA",
      "entries": [
        { "exerciseId": "bench", "weight": 45, "reps": [10, 9, 8, 8] }
      ]
    }
  ],
  "bodyMetrics": []
}
```
Notes:
- `perSide: true` → log one weight, reps apply per side (display "/ side").
- `unit: "sec"` on carries → reps field is seconds.
- Program is data, not code — editable later without touching JS. A raw-JSON edit screen is sufficient; no program-builder UI needed.

## Body tracking
- Home shows in-app prompts for weight every 7 local calendar days and waist, chest, relaxed right upper arm, and right thigh every calendar month. With no history, prompts are due immediately. A partial measurement entry does not reset reminders for missing core measurements. Hips and right calf are optional.
- Due reminders appear in a compact banner above the Home workout buttons, with Log and dismiss controls. Dismiss hides the banner until the next local calendar day on that device (`localStorage.lift_bodyReminderDismissedOn`); it never records a measurement or changes its due date. No banner appears when everything is current. A permanent Body tracking link below the workout buttons remains available, with next-due status inside that screen.
- These are reminders while using Lift, not scheduled background notifications. Returning to Home or foregrounding the home screen refreshes due dates.
- A Body tracking screen supports dated entries, history, change from the prior recorded value, edits, and deletion. Use explicit Save; new dates have blank fields and prior values only as placeholders. Dates must be real, not in the future; values must be finite positive decimals. A check-in needs at least one value. Missing fields stay missing rather than becoming zero.
- Additive top-level `bodyMetrics: []` is included in new data and created on first save for existing data, without changing workout program versions or session entries. Each row is `{ date: "YYYY-MM-DD", weightLb?, waistIn?, chestIn?, armIn?, thighIn?, hipsIn?, calfIn? }`. Units are explicitly pounds and inches, independent of lifting settings. One row per date; same-date saves edit that row. Data uses the existing private-Gist sync, offline queue, conflict handling, and JSON export.
- Weight protocol: same scale, preferably morning after the bathroom and before food/drink, similar clothing. Circumferences: before exercise, consistent posture and landmarks, tape level/snug without compressing skin; measure twice and repeat inconsistent readings. Waist just above hip bones after a normal exhale; chest at nipple level with arms relaxed; right upper arm relaxed at the midpoint between shoulder and elbow; right thigh at a marked midpoint between groin crease and top of kneecap; hips around widest buttocks; right calf at widest point. Measurements reflect fat, muscle, and measurement variation, not isolated muscle gain/loss. No body-fat estimates or diagnostic thresholds.

## Screens (keep it flat)
1. **Home:** four day buttons (Upper A / Lower / Upper B / Lower B) + "last session" date under each. Tap → Session.
2. **Session:** exercise list in program order, supersets visually grouped (shared border/label). Each exercise row shows:
   - Name, target `sets × repLow–repHigh`
   - **Last session line: weight × reps from most recent session containing this exercise** (e.g., "45 lb — 10/9/8/8")
   - Weight input (prefilled with last weight, with a subtle one-decimal kg conversion beneath lb) + one rep input per set. Rep inputs start visibly empty so they cannot be mistaken for completed work; the first `+` tap fills that set's suggested starting value (normally its reps from the last workout), and later taps increment it. Steppers or number pads; must be thumb-friendly.
   - Exercises measured in seconds show a small per-set Start Timer button. Their timer counts up from zero; tapping the timer bar stops it and records the elapsed seconds. It automatically caps at `2 × repHigh`, records the cap, and signals completion in-app plus vibration and an Android notification when permission is available. Adjusting seconds does not start the normal rest timer.
   - **Progression flag:** if last session hit `repHigh` on ALL sets → show "⬆ Add weight" badge and prefill the next owned weight near the exercise's optional `increment` (default +5 lb). This applies to both rep- and seconds-based exercises.
   - A "done" state per exercise; session auto-saves per entry (writes queued/debounced ~10s to limit API calls).
3. **Settings:** PAT entry, gist status, units, "Export JSON" (download current data), raw program JSON editor (textarea + validate + save).
4. **Body tracking:** weight and monthly measurements, due status, and dated editable history. Reachable from Home in one tap; Back returns through the existing app navigation.

## Double-progression logic (the core feature)
- For each exercise, find the most recent session entry.
- The same lift shares history across routine days when its normalized name, rep range, unit, and per-side mode match, even if each day uses a different exercise ID or number of sets. A different rep range remains a separate progression track.
- If `min(reps) >= repHigh` → progression triggered: badge + suggest the next owned weight near `increment` (default 5 lb). Small isolation lifts use `increment: 2.5`; timed carries use the same progression logic.
- `progression: "manual"` keeps the last weight and rep suggestions without an automatic weight increase or badge. Rollouts use this mode: log 0 lb, build to 2 x 12 at a repeatable wall-limited reach, then increase reach slightly and build reps again. Measure or mark knee-to-wall distance and record it separately; the tracker logs reps, not reach distance.
- Otherwise → prefill the same weight; keep reps visibly empty and use the last reps as each set's first-`+` suggestion.
- **First exercise ever (no history) → prefill `startWeight`** from the program data; no badge.
- No streak tracking, no charts in v1. (Nice-to-have later: per-exercise history list.)

## Starting weight rationale (lb; per dumbbell unless noted)
Derived from actual recent working loads (home + travel sessions) and conservative starts for new movements. All are per-hand except single-DB lifts (goblet, triceps ext, pullover, hip thrust, sit-ups, carry, KB moves).

| Exercise | Start | Basis |
|---|---|---|
| DB Bench Press (Upper A, 4×6–10) | 45 | Handled 40/hand at 10–12 reps; lower rep target supports more |
| DB Bench Press (Upper B, 3×8–12) | 40 | Matches proven travel load at this range |
| One-Arm Row heavy (4×6–10) | 50 | 48 was a working weight; low reps allow slightly more |
| One-Arm Row (Upper A superset) | 45 | One notch under the heavy-day weight |
| Overhead Press | 20 | Current working weight |
| Seated DB Press | 20 | Same muscle, stricter version — same start |
| Incline DB Bench | 35 | ~80% of flat bench; incline is always weaker |
| Chest-Supported Row | 30 | Strict, momentum-free — start well under one-arm row |
| DB Pullover (single DB) | 30 | Conservative for a long-lever stretch movement |
| Lateral Raises | 10 | Deliberately light; the most over-loaded lift in existence |
| Rear Delt Flyes | 10 | Same rule as laterals |
| DB Curls (12–15 range) | 20 | Higher-rep slot, one notch under current 25 |
| DB Curls (8–12 range) | 25 | Current working weight |
| Hammer Curls | 25 | Matches curls; can climb faster |
| Skull Crushers (per hand) | 15 | New movement, elbows need adaptation — start humble |
| Overhead Triceps Ext (single DB) | 25 | Current working weight |
| RDL (3 x 8–10) | 45/hand | Lower A secondary lift after squats; retain three sets. Starting load unchanged; use logged performance to progress. |
| RDL heavy (6–8) | 50/hand | Strength slot, small step above |
| Goblet Squat (single DB, 4 x 6–10) | 45 | Lower A first lift; 150-second rest. Starting load unchanged; build load with the heavier adjustable while preserving comfortable depth and controlled reps. |
| Supported Single-Leg Calf Raise (both lower days) | 0 | Start with bodyweight; 2 x 10-20 per side on each lower day. Use a solid support, controlled full range, and no bouncing. Add one owned dumbbell when both sets reach 20 clean reps on both sides; log external load only. |
| Hip Thrust (single DB on hips) | 50 | Glutes are strong; this feels light fast — climb quickly |
| KB Swings | 20 | Conditioning/power slot; build to 3×50, then use a 35 lb bell or one-arm swings rather than a nominal +5 lb adjustment |
| Overhead Carry | 20 | The available KB; shoulder stability without the TGU learning curve or kneeling transition |
| KB Russian Twists | 20 | The KB you own |
| Weighted Sit-Ups (DB on chest) | 10 | Ab loading should start light and progress like a lift |
| Kneeling Ab-Wheel Rollout | 0 | Replaces Lower A leg raises, 2 x 6-12. Start with a short wall-limited reach; progress controlled reps, then reach. Keep glutes squeezed and ribs down; stop before the lower back sags. No automatic load progression. Existing leg-raise session entries remain unchanged under their original ID. |
| Suitcase Carry (single DB) | 45 | 25 confirmed useless; heavy is the exercise |

## UX requirements
- Mobile-first, dark theme, system font stack, no icons/libraries needed.
- Everything reachable in ≤2 taps from open.
- Android/system Back and the header back arrow navigate through internal app views before the PWA exits.
- Inputs: large steppers (+/−) preferred over keyboards mid-workout.
- Works offline for logging (queued sync).
- No login besides the one-time PAT paste per device.

## Deploy
1. Public repo (e.g. `workout-tracker`), Pages enabled on `main`.
2. `index.html`, `manifest.json`, `sw.js`, icon (any simple 512px PNG).
3. README with 5-line setup: create fine-grained PAT (gist scope), open app, paste, done.

## Explicit non-goals (v1)
- No accounts/auth beyond PAT, no charts, no rest timers, no exercise library, no workout editing mid-session beyond rep/weight, no multi-user anything.

## Edge cases to handle
- PAT invalid/expired → clear error, re-prompt; never lose queued local data.
- Gist fetch fails on open → work from localStorage cache, banner "offline data".
- Two devices edited offline → last-write-wins with the reload/overwrite prompt above.
- First exercise ever (no history) → prefill `startWeight`, empty reps, no progression badge.
