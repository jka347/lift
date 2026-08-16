# lift

Single-user workout tracker PWA. One user (Jeff), phone + PC, no server.

**The build spec is [docs/build-spec.md](docs/build-spec.md) — read it before writing code.** It is the source of truth for the data model, screens, progression logic, and starting weights. This file only records decisions made outside the spec and things the spec assumes but doesn't state.

## Decisions already made

- **Repo:** `jka347/lift`, public, personal account (not `jeff-simpat`).
- **Hosting:** GitHub Pages from `main`, repo root — app URL will be `https://jka347.github.io/lift/`. Pages is **not enabled yet**; it can't be until `main` has an `index.html` committed and pushed.
- **PWA home-screen label:** `short_name: "Lift"` in `manifest.json`. Long `name` can be more descriptive.
- **Base paths matter.** Because the app is served from `/lift/` and not a domain root, the service worker scope, `manifest.json` `start_url`/`scope`, and the icon path must all be relative or `/lift/`-prefixed. Absolute `/`-rooted paths will 404 on Pages while appearing to work locally.

## Decisions made after v1

- **Done = logged.** Stepper taps write scratch entries (synced, restore mid-workout), but an exercise only counts toward history, progression, and "Last:" dates once marked done (`entry.done`). Past sessions with zero done entries are pruned on load as abandoned scratch.
- **Form guides are program data**: `form: { how, cues[] }` per exercise in the gist JSON, back-filled into pre-existing gists by `ensureFormGuides()` (matched by day id + exercise id).
- **Rest timer defaults live in code, overrides in data**: auto rest countdown on rep taps / Log — `ex.rest` seconds if set (priority slots get 150 in the default program), else 60 for superset lifts, 90 otherwise. `ensureFormGuides()` also back-fills missing `rest` fields. No timer while editing a past session.
- **Weights are a ladder, not an increment**: Jeff's equipment is `settings.weights` in the gist (free weights 5/10/12 + adjustable set with 2.5s only inside each 10-lb block, editable in Settings). Weight steppers move to the next/prev owned weight; progression suggests `progressWeight(last)`: below 20 lb one owned step (10 → 12, 15 → 17.5), from 20 up +5 snapped up to an owned weight (20 → 25, 25 → 30, 47.5 → 55). `ensureFormGuides()` back-fills the ladder. Never assume flat +5/+2.5 math.

## Git

`origin` is `https://jka347@github.com/jka347/lift.git`. The `jka347@` prefix is deliberate: the machine has two authenticated GitHub accounts and `jeff-simpat` is usually the active one, so without the username in the URL, pushes authenticate as the wrong account and fail. Do not strip it.

## Constraints from the spec worth repeating

- **No build step, no dependencies, no framework.** Vanilla HTML/CSS/JS. If a change would introduce `package.json`, stop and ask.
- **Secrets:** the GitHub PAT lives only in `localStorage`, pasted per device. Never commit a token, never write one into a file, never log one.
- **The workout program is data, not code.** It lives in the gist JSON and is edited through a raw-JSON textarea in Settings. Do not hardcode exercises into JS.
- **Mid-workout ergonomics beat elegance.** Big tap targets, steppers over keyboards, dark theme, ≤2 taps from open to logging a set.
