# EAS Build & Submit — Exact Commands

Every command below runs **on your computer** (not Blink). Copy/paste in order.

---

## 0. Prerequisites (one-time)

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Sign in (create free account at expo.dev if you don't have one)
eas login
```

---

## 1. Pull the latest code from Blink

Two options:

**A. If your project is linked to GitHub:**
```bash
git clone <your-repo-url>
cd credibility-radar
git pull
```

**B. If not:** Download the project ZIP from Blink dashboard → unzip → `cd` into folder.

```bash
# Install dependencies
bun install
# (or `npm install` if you don't have bun)
```

---

## 2. Initialize EAS project

From the project root:

```bash
eas init
```

This will:
- Prompt you to select your Expo account
- Create an EAS project linked to this app
- Auto-update `app.json` → `expo.extra.eas.projectId` with the real UUID

When done, **commit the change** so Blink has the real projectId:

```bash
git add app.json
git commit -m "Add EAS projectId"
git push
```

If you're not on GitHub, just tell me the new projectId from `app.json` and I'll update it on the Blink side.

---

## 3. Drop in the Google service account JSON

From Phase 1.2 of `RELEASE_CHECKLIST.md`:

1. Download the service account JSON from Google Cloud Console
2. Rename it to exactly: `google-play-service-account.json`
3. Move it to your project root (same folder as `app.json` and `eas.json`)

Verify:
```bash
ls -la google-play-service-account.json
# Should print the file. If "no such file" — wrong location.
```

⚠️ This file is already in `.gitignore` — do not commit it.

---

## 4. Build the production Android bundle

```bash
eas build --platform android --profile production
```

What happens:
- EAS prompts you the first time for keystore credentials → choose "Generate new keystore" (EAS manages it)
- Build runs on Expo's cloud servers (~12–18 min)
- You get a download link for the `.aab` file at the end
- Build also appears at [expo.dev](https://expo.dev) → your project → Builds

---

## 5. Submit to Play Store internal testing track

```bash
eas submit --platform android --latest
```

What happens:
- Uses `eas.json` → submit.production.android config (already wired)
- Reads `google-play-service-account.json`
- Uploads the `.aab` to Play Console **Internal testing** track as **Draft**
- You then go to Play Console → Testing → Internal testing → review release → roll out

---

## 6. Test on a real device

1. Play Console → Testing → Internal testing → Testers tab
2. Add your Google account email as a tester
3. Copy the **opt-in URL** Play Console gives you
4. Open the URL on your Android device, sign in with the tester account, install
5. Open the app → try purchasing Pro Monthly
   - Use a **test account** (Play Console → Setup → License testing → add your email)
   - Test cards work — no real money charged

Verify in the app:
- Pro badge appears
- History limit removed
- Scan counter shows unlimited

Verify in RevenueCat dashboard:
- Customer → search your email → should show active "Pro Access" entitlement

---

## 7. Promote to Production

Once internal testing works end-to-end:

**Option A — via EAS:** Edit `eas.json` → change `submit.production.android.track` from `"internal"` to `"production"` → run `eas submit --platform android --latest` again.

**Option B — via Play Console:** Internal testing → "..." menu → **Promote release → Production** → fill release notes (from `STORE_LISTING.md` → What's New) → Review → Send for review.

**First review:** 1–7 days. Updates: usually <24h.

---

## 8. iOS (when you're ready, separate $99/yr)

```bash
# Build
eas build --platform ios --profile production
# EAS will prompt for Apple ID + handle signing automatically

# Submit
eas submit --platform ios --latest
```

iOS needs separate App Store Connect setup — see RELEASE_CHECKLIST.md Phase 4 (existing doc).

---

## Common errors

| Error | Fix |
|---|---|
| `eas: command not found` | `npm install -g eas-cli` didn't run as admin → try `sudo npm install -g eas-cli` |
| `Project not configured for EAS` | You skipped `eas init` |
| `Service account file not found` | Wrong filename or location — must be exactly `google-play-service-account.json` at project root |
| `Bundle identifier mismatch` | Check `app.json` `android.package` matches what's in Play Console |
| `Invalid keystore` | Let EAS generate one — answer "yes" when prompted |
| Build fails on `expo-router` | Run `bun install` again to ensure all deps are present |

---

## What to do after each push

When you push a new version:

1. Bump `versionCode` in `app.json` (e.g. 1 → 2) for Android
2. Bump `buildNumber` in `app.json` for iOS
3. (Auto) `autoIncrement: true` is already set in `eas.json` for production builds — EAS handles bumping automatically

So you can mostly just re-run:
```bash
eas build --platform android --profile production && eas submit --platform android --latest
```
