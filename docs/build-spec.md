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
  "version": 1,
  "updated_at": "2026-08-16T15:04:05Z",
  "settings": { "units": "lb" },
  "program": {
    "days": [
      {
        "id": "upperA",
        "name": "Upper A — Chest & Shoulders",
        "exercises": [
          { "id": "bench", "startWeight": 45,   "name": "DB Bench Press",            "sets": 4, "repLow": 6,  "repHigh": 10, "perSide": false, "superset": null },
          { "id": "ohp", "startWeight": 20,     "name": "DB Overhead Press",          "sets": 3, "repLow": 8,  "repHigh": 12, "perSide": false, "superset": null },
          { "id": "incline", "startWeight": 35, "name": "Incline DB Bench",           "sets": 3, "repLow": 8,  "repHigh": 12, "perSide": false, "superset": "ss1" },
          { "id": "row", "startWeight": 45,     "name": "One-Arm Row",                "sets": 3, "repLow": 8,  "repHigh": 12, "perSide": true,  "superset": "ss1" },
          { "id": "latraise", "startWeight": 10,"name": "Lateral Raises",             "sets": 3, "repLow": 12, "repHigh": 15, "perSide": false, "superset": "ss2" },
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
          { "id": "seatpress", "startWeight": 20,"name": "Seated DB Press",       "sets": 3, "repLow": 10, "repHigh": 15, "superset": "ss2" },
          { "id": "reardelt", "startWeight": 10, "name": "Rear Delt Flyes",       "sets": 3, "repLow": 10, "repHigh": 15, "superset": "ss2" },
          { "id": "curl2", "startWeight": 25,    "name": "DB Curls",              "sets": 3, "repLow": 8,  "repHigh": 12, "superset": "ss3" },
          { "id": "skull", "startWeight": 15,    "name": "Skull Crushers",        "sets": 3, "repLow": 8,  "repHigh": 12, "superset": "ss3" }
      ]},
      { "id": "lowerA", "name": "Lower + Core", "exercises": [
          { "id": "rdl", "startWeight": 45,     "name": "Romanian Deadlift",      "sets": 4, "repLow": 8,  "repHigh": 10 },
          { "id": "goblet", "startWeight": 45,  "name": "Goblet Squat",           "sets": 3, "repLow": 10, "repHigh": 12 },
          { "id": "kbswing", "startWeight": 20, "name": "KB Swings",              "sets": 3, "repLow": 15, "repHigh": 20 },
          { "id": "wsitup", "startWeight": 10,  "name": "Weighted Sit-Ups",       "sets": 3, "repLow": 10, "repHigh": 15 },
          { "id": "legraise", "startWeight": 0,"name": "Bench Leg Raises",       "sets": 3, "repLow": 10, "repHigh": 15 }
      ]},
      { "id": "lowerB", "name": "Lower + Core B", "exercises": [
          { "id": "rdlheavy", "startWeight": 50,"name": "RDL (heavy)",            "sets": 4, "repLow": 6,  "repHigh": 8 },
          { "id": "hipthrust", "startWeight": 50,"name": "Hip Thrust",            "sets": 3, "repLow": 10, "repHigh": 12 },
          { "id": "tgu", "startWeight": 20,     "name": "Turkish Get-Up",         "sets": 3, "repLow": 3,  "repHigh": 3,  "perSide": true },
          { "id": "twist", "startWeight": 20,   "name": "KB Russian Twists",      "sets": 3, "repLow": 12, "repHigh": 16 },
          { "id": "carry", "startWeight": 45,   "name": "Suitcase Carry (heavy)", "sets": 3, "repLow": 30, "repHigh": 30, "perSide": true, "unit": "sec" }
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
  ]
}
```
Notes:
- `perSide: true` → log one weight, reps apply per side (display "/ side").
- `unit: "sec"` on carries → reps field is seconds.
- Program is data, not code — editable later without touching JS. A raw-JSON edit screen is sufficient; no program-builder UI needed.

## Screens (3 total, keep it flat)
1. **Home:** four day buttons (Upper A / Lower / Upper B / Lower B) + "last session" date under each. Tap → Session.
2. **Session:** exercise list in program order, supersets visually grouped (shared border/label). Each exercise row shows:
   - Name, target `sets × repLow–repHigh`
   - **Last session line: weight × reps from most recent session containing this exercise** (e.g., "45 lb — 10/9/8/8")
   - Weight input (prefilled with last weight) + one rep input per set (prefilled with last reps, tap to adjust). Steppers or number pads; must be thumb-friendly.
   - **Progression flag:** if last session hit `repHigh` on ALL sets → show "⬆ Add weight" badge and prefill weight +5 lb.
   - A "done" state per exercise; session auto-saves per entry (writes queued/debounced ~10s to limit API calls).
3. **Settings:** PAT entry, gist status, units, "Export JSON" (download current data), raw program JSON editor (textarea + validate + save).

## Double-progression logic (the core feature)
- For each exercise, find the most recent session entry.
- If `min(reps) >= repHigh` → progression triggered: badge + suggest `weight + 5` (lb).
- Otherwise → prefill same weight, prefill last reps.
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
| RDL (8–10) | 45/hand | 40/hand was held back for caution; hinge has headroom |
| RDL heavy (6–8) | 50/hand | Strength slot, small step above |
| Goblet Squat (single DB) | 45 | 48 proven; knee-first, tempo before load |
| Hip Thrust (single DB on hips) | 50 | Glutes are strong; this feels light fast — climb quickly |
| KB Swings | 20 | The KB you own; upgrade to 35–50 once the pattern clicks |
| Turkish Get-Up | 20 | Learn with the 20 lb KB (or lighter/none first session) |
| KB Russian Twists | 20 | The KB you own |
| Weighted Sit-Ups (DB on chest) | 10 | Ab loading should start light and progress like a lift |
| Bench Leg Raises | 0 | Bodyweight; add ankle weight/DB between feet later |
| Suitcase Carry (single DB) | 45 | 25 confirmed useless; heavy is the exercise |

## UX requirements
- Mobile-first, dark theme, system font stack, no icons/libraries needed.
- Everything reachable in ≤2 taps from open.
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
