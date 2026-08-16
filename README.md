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
