# Lift

Single-user workout tracker PWA. Data syncs across devices via a private GitHub Gist. No server, no build step, no dependencies.

**App:** https://jka347.github.io/lift/

## Setup (per device)

1. Create a [fine-grained GitHub token](https://github.com/settings/personal-access-tokens/new) with only the **Gists** permission (read & write).
2. Open the app and paste the token when prompted.
3. First device creates the private gist automatically; later devices find it by filename.
4. On your phone: Share → **Add to Home Screen** to install it as an app.
5. Done. The token lives only in that browser's localStorage.

The workout program itself is data in the gist — edit it via Settings → Program (raw JSON). Spec lives in [docs/build-spec.md](docs/build-spec.md).

## Body tracking

Open **Body tracking** from Home to log weight in pounds and measurements in inches. A small banner above the workout buttons prompts for weight every 7 days and waist, chest, relaxed right upper arm, and right thigh monthly. Hips and right calf are optional. Dismiss the banner for the rest of the day on that device; the Body tracking link stays available. These reminders appear in the app when you open it; they are not background notifications.

Check-ins have their own dates, editable history, and changes from prior readings. Save explicitly; weight-only and partial measurement entries are allowed. They sync and export with your workout data, including when saved offline. Measurement instructions are beside each field.

Run the dependency-free body-tracking checks with `node tests/body-tracking.test.cjs`.
