# Release Checklist — Credibility Radar

**Current status:** Code complete. Play Developer account registered. Waiting on Google identity verification (1–2 days).

This file is your single source of truth. Tick items as you go.

---

## 🤖 Re-sync RevenueCat at any time (automated)

If products, entitlements, or packages ever get out of sync, run:

```bash
REVENUECAT_API_KEY=your_v2_key node scripts/sync-revenuecat.js
```

Get your API v2 key: RevenueCat dashboard → Project settings → API keys → + New → "API v2"

The script reads `scripts/revenuecat.config.json` and ensures RevenueCat matches it exactly.
Safe to run multiple times — only creates or attaches what is missing.

---

## 🚨 CRITICAL — Must fix before submitting

### A. Fix RevenueCat bundle IDs (BLOCKER)
The RevenueCat apps were created with the wrong bundle ID `com.blink.expostarter`. Your real bundle is `com.credibilityradar.app` (set in `app.json`).

**You MUST fix this in the RevenueCat dashboard before submission**, otherwise Apple/Google purchases will fail to validate.

1. Go to https://app.revenuecat.com → Project `project-JZfNOre8`
2. Apps → **Credibility Radar iOS** → Edit → Bundle ID = `com.credibilityradar.app` → Save
3. Apps → **Credibility Radar Android** → Edit → Package name = `com.credibilityradar.app` → Save

After fixing, tell me and I'll re-verify with `revenuecat_list_apps`.

### B. Get RevenueCat API keys into the build
Your `.env.local` needs these (they're read in `lib/payments.ts`):
- `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`
- `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`

I can fetch these from RevenueCat and add them via the secrets flow — ask me when you're ready.

---

## ✅ DONE

- [x] App code complete (all screens, auth, AI analysis, paywall, history)
- [x] RevenueCat connected — project `proja7ca02ab`
- [x] Entitlement `pro_access` created with 4 products attached
- [x] Default offering with `$rc_monthly` + `$rc_annual` packages
- [x] RevenueCat SDK integrated (`lib/payments.ts`)
- [x] Privacy policy + Terms — in-app AND public web URLs
  - https://credibilit-radar-app-ezbyi9yb.blinkpowered.com/privacy
  - https://credibilit-radar-app-ezbyi9yb.blinkpowered.com/terms
- [x] `app.json` configured (bundle `com.credibilityradar.app`, permissions, splash)
- [x] `eas.json` configured with production build profile + Android auto-submit
- [x] Store assets ready (`assets/store/` — 5 screenshots + feature graphic)
- [x] Store listing copy drafted (`STORE_LISTING.md`)
- [x] Data Safety form answers drafted (`PLAY_STORE_DATA_SAFETY.md`)
- [x] Google Play Developer account registered (waiting verification)
- [x] `.gitignore` updated to exclude service account JSON + keystores

---

## ⬜ PHASE 1 — While Google verifies (do these now, in any order)

### 1.1 — Create the app shell in Play Console
1. https://play.google.com/console → **Create app**
2. Name: **Credibility Radar**
3. Default language: English (US)
4. App or game: **App**
5. Free or paid: **Free**
6. Accept declarations → **Create app**

### 1.2 — Generate Google service account JSON
This lets EAS auto-submit builds. ONE-TIME setup.

1. Play Console → **Setup** → **API access**
2. Click "Choose a project to link" → "Create new project" (or link existing GCP project)
3. Service accounts section → **Create new service account** → opens Google Cloud Console
4. In GCP: Service Accounts → **Create Service Account**
   - Name: `play-store-publisher`
   - Role: **Service Account User**
   - Done
5. Click the new service account → **Keys** tab → **Add Key → Create new key → JSON** → downloads
6. Rename downloaded file to `google-play-service-account.json`
7. Drop it into the project root (next to `app.json`)
8. Back in Play Console API access page → click **Grant access** next to the service account
9. Permissions: **Admin (all permissions)** for first setup → **Invite user** → **Send invite**

**Verify it's in the right place:**
```bash
ls google-play-service-account.json
```
Should print the filename. If "no such file" — wrong location.

⚠️ **NEVER commit this file.** I added it to `.gitignore` already.

### 1.3 — Install EAS CLI on your machine
```bash
npm install -g eas-cli
eas login
```
Sign in with your Expo account (free at expo.dev).

### 1.4 — Initialize EAS project
From the project directory **on your computer** (not here):
```bash
eas init
```
This replaces the placeholder `"your-project-id-here"` in `app.json` with a real EAS projectId.

After running, `git pull` it back into Blink, or copy the new projectId and tell me — I'll update `app.json`.

### 1.5 — Set up support emails
Play Console verifies these resolve:
- `support@credibilityradar.app`
- `privacy@credibilityradar.app`

Options:
- Cloudflare Email Routing (free, forwards to Gmail) — needs you to own the domain
- Google Workspace ($6/mo)
- Or temporarily use your personal email and update later

---

## ⬜ PHASE 2 — Once Google verifies (1–2 days)

### 2.1 — Create subscriptions in Play Console
Play Console → **Monetize → Products → Subscriptions** → **Create subscription**

**Subscription 1:**
- Product ID: `pro_monthly`
- Name: Pro Monthly
- Description: Unlimited credibility scans + full history
- Base plan ID: `monthly-base-plan`
- Auto-renewing, Monthly
- Price: $14.99 USD (set for all your target countries)
- Save → **Activate**

**Subscription 2:**
- Product ID: `pro_annual`
- Name: Pro Annual
- Description: Unlimited credibility scans + full history — best value
- Base plan ID: `annual-base-plan`
- Auto-renewing, Yearly
- Price: $99.00 USD
- Save → **Activate**

⚠️ The product IDs MUST match exactly — they're already wired in RevenueCat.

### 2.2 — Link RevenueCat to Play Store
RevenueCat needs your Google service account to validate receipts.

1. RevenueCat → Project → **Credibility Radar Android** app → **App configuration**
2. Paste the contents of `google-play-service-account.json` into the credentials field
3. Save

### 2.3 — Fill Play Console "App content" section
Use `PLAY_STORE_DATA_SAFETY.md` for the Data Safety questionnaire. Other sections:

- [ ] **Privacy policy URL** → `https://credibilit-radar-app-ezbyi9yb.blinkpowered.com/privacy`
- [ ] **App access** → "All functionality available without special access"
- [ ] **Ads** → No
- [ ] **Content rating** → run questionnaire (Everyone)
- [ ] **Target audience** → 13+
- [ ] **News app** → No
- [ ] **COVID-19 contact tracing** → No
- [ ] **Data safety** → paste from `PLAY_STORE_DATA_SAFETY.md`
- [ ] **Government apps** → No
- [ ] **Financial features** → No

### 2.4 — Fill Play Console "Main store listing"
Paste from `STORE_LISTING.md`:
- [ ] App name: **Credibility Radar**
- [ ] Short description (paste from STORE_LISTING.md)
- [ ] Full description (paste from STORE_LISTING.md)
- [ ] App icon → upload `assets/images/icon.png`
- [ ] Feature graphic → upload `assets/store/feature-graphic-1024x500.png`
- [ ] Phone screenshots → upload `assets/store/01-hero-score.png` through `05-history.png`
- [ ] Category: **Productivity**
- [ ] Email: `support@credibilityradar.app`

### 2.5 — Build the production .aab
On your computer:
```bash
eas build --platform android --profile production
```
~15 min on EAS cloud. Downloads a `.aab` file.

### 2.6 — Internal testing first (STRONGLY RECOMMENDED)
Before production, test the IAP flow:

```bash
eas submit --platform android --latest
```
This auto-pushes to the **Internal testing** track (already configured in `eas.json`).

In Play Console → Testing → Internal testing:
- Add your email as a tester
- Install via the opt-in link on a real Android device
- Try purchasing Pro Monthly — should use a test card, not real money (Play Store has test accounts)
- Verify entitlement unlocks (history limit removed, etc.)

### 2.7 — Promote to Production
Once internal testing works:
- Play Console → Testing → Internal testing → **Promote release → Production**
- Or update `eas.json` track from `internal` to `production` and re-submit

Add release notes (from `STORE_LISTING.md` → "What's New").

### 2.8 — Submit for review
Google reviews the first submission in **1–7 days**. Updates are usually <24h.

---

## ⬜ PHASE 3 — Post-launch

- [ ] Monitor RevenueCat dashboard for first real transactions
- [ ] Set up a crash analytics tool (Sentry has a free tier for Expo)
- [ ] Respond to first reviews (Play Console → Reviews)
- [ ] Plan v1.0.1 — bump `versionCode` in `app.json` for each update

---

## 🆘 If something breaks

| Symptom | Likely cause | Fix |
|---|---|---|
| EAS build fails on "credentials" | Not logged in or no EAS project | Run `eas login` then `eas init` |
| `serviceAccountKeyPath` not found | JSON file in wrong location | Must be at project root, named exactly `google-play-service-account.json` |
| Play Store: "Bundle identifier already exists" | Someone else has `com.credibilityradar.app` | Change in `app.json` `android.package` (and update RevenueCat to match) |
| RevenueCat shows "products not found" | Product IDs in Play Console don't match RevenueCat | Verify `pro_monthly` + `pro_annual` exist in both, IDs identical |
| App rejected — "subscription terms not clear" | Should not happen — paywall already has disclosure + legal links | Re-screenshot the paywall and respond with explanation |
| App rejected — "privacy policy URL doesn't work" | URL didn't propagate | Open https://credibilit-radar-app-ezbyi9yb.blinkpowered.com/privacy in incognito to verify |

---

## Reference docs in this project

- `STORE_LISTING.md` — all copy + asset specs
- `PLAY_STORE_DATA_SAFETY.md` — Data Safety form answers
- `app.json` — bundle ID, permissions, plugins
- `eas.json` — build + submit profiles
- `lib/payments.ts` — RevenueCat integration
- `assets/store/` — screenshots + feature graphic
- `assets/store/README.md` — asset specs reference
