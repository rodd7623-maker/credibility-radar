# Quick Start — Get on Play Store in 3 Steps

This is everything. No terminal experience needed.

---

## Step 1 — Download the project to your computer

In Blink, click **"..."** (three dots) next to the project name → **Download** or **Export ZIP**.

Unzip the folder somewhere easy to find (like your Desktop).

---

## Step 2 — Get one file from Google (10 min of clicking)

This is the Google service account file — it lets the script auto-upload to Play Store.

1. Go to https://play.google.com/console (sign in with the account you registered with)
2. Left sidebar → **Setup** → **API access**
3. Click **"Link to a Google Cloud project"** → **"Create new project"** → **"Link project"**
4. Scroll to **Service accounts** → **"Create new service account"**
5. Google Cloud opens → click **"Create service account"**
6. Name it anything (e.g. `publisher`) → click **Done**
7. Back in Play Console: click **"Grant access"** next to your new service account
8. Set permissions: **Admin (all permissions)** → **Invite user** → **Send invite**
9. Go to https://console.cloud.google.com → left menu → **IAM & Admin** → **Service Accounts**
10. Click your `publisher` account → **Keys** tab → **Add Key** → **Create new key** → **JSON** → **Create**
11. A file downloads. **Rename it to:** `google-play-service-account.json`
12. **Move it into the project folder** (the unzipped folder from Step 1, next to `app.json`)

---

## Step 3 — Double-click the script

**On Mac:**
1. Open the unzipped project folder in Finder
2. Right-click `build-and-submit.sh` → **Open With** → **Terminal**
   - (First time only: if Mac says "can't open", go to System Preferences → Security & Privacy → click "Open Anyway")

**On Windows:**
1. Open the unzipped project folder in Explorer
2. Right-click `build-and-submit.bat` → **Run as administrator**

The script will:
- ✅ Check your computer is ready
- ✅ Ask you to sign in to Expo (free account at expo.dev)
- ✅ Link the project
- ✅ Build the Android app (~15 min — you can leave it running)
- ✅ Upload it to Play Store

When it finishes, it tells you exactly what to do next in Play Console.

---

## After the script finishes

Go to https://play.google.com/console → your app → **Testing** → **Internal testing** → add your email as a tester → install on your phone → test it → **Promote to Production** → submit for review.

Google reviews in 1–7 days. After approval your app is live.

---

## Something went wrong?

The script prints clear error messages. Most common ones:

| Message | Fix |
|---|---|
| "Node.js is not installed" | Go to nodejs.org, install the LTS version, then run the script again |
| "google-play-service-account.json not found" | Double-check the file is renamed correctly and in the project folder |
| EAS asks to sign up | Go to expo.dev, create a free account, then continue |
| Build fails with a red error | Copy the error and ask Blink — paste it in the chat |

---

That's it. The script handles everything else.
