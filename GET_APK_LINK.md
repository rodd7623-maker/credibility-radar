# How to Get Your APK Download Link (No Terminal Needed)

You'll do this **once**. After that, every code change auto-builds a new APK.

---

## Step 1 — Get your Expo token (2 minutes)

1. Go to **https://expo.dev/signup** and create a free account (use Google sign-in for fastest)
2. After signing in, go to **https://expo.dev/accounts/[your-username]/settings/access-tokens**
   - Or click your profile picture (top right) → **Account settings** → **Access tokens** (left menu)
3. Click **Create token**
4. Name it: `github-actions`
5. Click **Create**
6. **Copy the token** that appears (starts with letters/numbers) — you'll only see it once!

---

## Step 2 — Add the token to GitHub (1 minute)

1. Go to **https://github.com/rodd7623-maker/credibility-radar/settings/secrets/actions**
2. Click the green **New repository secret** button
3. Fill in:
   - **Name:** `EXPO_TOKEN`
   - **Secret:** paste the token you copied
4. Click **Add secret**

---

## Step 3 — Trigger the build (30 seconds)

1. Go to **https://github.com/rodd7623-maker/credibility-radar/actions**
2. Click **Build APK for Phone** in the left sidebar
3. Click **Run workflow** button (right side) → green **Run workflow** button
4. Wait ~2 minutes for the GitHub job to start the build on Expo's servers

---

## Step 4 — Get your download link (~12 min later)

1. Go to **https://expo.dev** → sign in → click your project
2. Click **Builds** in the left menu
3. Wait until the latest build shows **Finished** (green)
4. Click the build → you'll see:
   - 📱 **QR code** — scan it with your phone to install directly
   - 🔗 **Install link** — copy/paste this anywhere

Both work as your **direct install link**. The QR code is the easiest — just scan with your Android phone's camera.

---

## What happens on your phone

1. Scan QR code (or tap link)
2. Browser asks: "Download .apk?" → tap **Download**
3. After download finishes, tap the file
4. Android asks: "Install from unknown sources?" → tap **Settings** → toggle on **Allow** → back → tap **Install**
5. App installs — open it like any other app

---

## After this one-time setup

Every time you save changes in Blink (which auto-pushes to GitHub), a new APK builds automatically.

You'll get an email from Expo when each build is done with the install link.

---

## Stuck?

Most common issues:

| Problem | Fix |
|---|---|
| "Token invalid" in GitHub Actions | Token was copied wrong — make a new one and replace the secret |
| Build fails on Expo | Open the build on expo.dev → click "View logs" → share the error with Blink |
| Phone says "Can't install" | Settings → Security → enable "Install unknown apps" for Chrome (or whichever browser) |
| QR code doesn't work | Open expo.dev → Builds → click the build → tap the **Install** button on your phone's browser instead |
