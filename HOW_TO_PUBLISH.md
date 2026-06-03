# How to Publish to Play Store — No Experience Needed

This guide uses plain language. Every step tells you exactly what to click or type.
Estimated time: **2–3 hours spread over 1–2 weeks** (most of that is waiting on Google).

---

## PART 1 — Things to do RIGHT NOW (before Google finishes verifying you)

### Step 1 — Open a terminal on your computer

A terminal is just a text box where you type commands.

**On Mac:**
1. Press `Cmd + Space` to open Spotlight
2. Type `Terminal` and press Enter
3. A black or white window opens — that's your terminal

**On Windows:**
1. Press the Windows key
2. Type `cmd` and press Enter
3. A black window opens — that's your terminal

### Step 2 — Check if Node.js is installed

In the terminal, type this and press Enter:
```
node --version
```

- If it prints something like `v20.11.0` → ✅ Node is installed, skip to Step 3
- If it says "command not found" → go to https://nodejs.org, click the big green "LTS" button, download and install it, then restart your terminal and try again

### Step 3 — Install the EAS build tool

Type this in the terminal and press Enter:
```
npm install -g eas-cli
```
Wait for it to finish (about 30 seconds). You'll see a lot of text scrolling — that's normal.

### Step 4 — Create a free Expo account

1. Go to https://expo.dev
2. Click **Sign Up** (top right)
3. Enter your email and create a password
4. Verify your email

### Step 5 — Sign in from the terminal

Type this and press Enter:
```
eas login
```
It will ask for your Expo email and password. Type them in (you won't see the password as you type — that's normal) and press Enter.

### Step 6 — Download the project to your computer

**Option A — If you can download a ZIP from Blink:**
1. In Blink, click the three-dot menu on your project → "Download ZIP" (or similar)
2. Unzip the folder
3. In the terminal, navigate to the unzipped folder:
   - On Mac: `cd ~/Downloads/credibility-radar` (adjust the folder name)
   - On Windows: `cd C:\Users\YourName\Downloads\credibility-radar`

**Option B — If Blink is linked to GitHub:**
```
git clone <your-github-repo-url>
cd credibility-radar
```

Install dependencies (type this and wait ~1 minute):
```
npm install
```

### Step 7 — Connect to EAS

In the terminal, inside the project folder, type:
```
eas init
```

It will ask: "Would you like to create a new EAS project?" → press Enter (yes).

When it finishes, it prints something like:
```
✔ Project successfully linked (expo: credibility-radar, id: abc-123-def)
```

**Copy that ID** (looks like `abc-123-def-...`). 

Then tell Blink: "eas init is done, the project ID is [paste it here]"
→ I'll update `app.json` automatically.

---

## PART 2 — Get a Google service account (lets EAS auto-upload to Play Store)

This sounds scary but it's just clicking through some Google pages.

### Step 8 — Link Play Console to Google Cloud

1. Go to https://play.google.com/console
2. In the left sidebar: **Setup** → **API access**
3. You'll see a button: **"Link to a Google Cloud project"** (or "Choose a project to link")
4. Click it → Click **"Create new project"** → Click **"Link project"**

### Step 9 — Create the service account

1. Still on the API access page, scroll to the **Service accounts** section
2. Click **"Create new service account"**
3. A Google Cloud window opens → Click **"Create service account"**
4. Name it: `play-publisher` → Click **Done**
5. Back in Play Console, your new service account appears in the list
6. Click **"Grant access"** next to it
7. Under "Account permissions", choose **Admin (all permissions)**
8. Click **"Invite user"** → **"Send invite"**

### Step 10 — Download the JSON key

1. Go to https://console.cloud.google.com
2. Make sure you're in the same project (check the dropdown at the top)
3. Left sidebar: **IAM & Admin** → **Service Accounts**
4. Click on `play-publisher`
5. Click the **Keys** tab
6. Click **Add Key** → **Create new key** → **JSON** → **Create**
7. A file downloads automatically (something like `my-project-12345-abc123.json`)
8. Rename it to exactly: `google-play-service-account.json`
9. Move it into your project folder (same folder as `app.json`)

---

## PART 3 — Build the app

### Step 11 — Build the Android app

In the terminal (inside the project folder):
```
eas build --platform android --profile production
```

- First time only: it asks about a **keystore** (this is the digital signature for your app)
  → Choose **"Generate new keystore"** — EAS handles it for you
- Wait about **15 minutes**
- When done, it prints a URL like `https://expo.dev/builds/abc123`
- Visit that URL to download your `.aab` file (you may need this for manual upload)

### Step 12 — Submit to Play Store

```
eas submit --platform android --latest
```

This automatically uploads your build to Play Console → **Internal testing** track.

If it asks about the service account file, confirm the path is `./google-play-service-account.json`.

---

## PART 4 — Set up Play Console listing

### Step 13 — Fill in the store listing

In Play Console (https://play.google.com/console):

1. Your app → **Store presence** → **Main store listing**
2. Fill in (copy from `STORE_LISTING.md` in your project):
   - **App name:** Credibility Radar
   - **Short description:** paste from STORE_LISTING.md
   - **Full description:** paste from STORE_LISTING.md
3. Upload assets:
   - **Icon:** `assets/images/icon.png`
   - **Feature graphic:** `assets/store/feature-graphic-1024x500.png`
   - **Screenshots (Phone):** `assets/store/01-hero-score.png` through `05-history.png`
4. Click **Save**

### Step 14 — Fill in App content

Your app → **Policy** → **App content** — work through each section:

| Section | What to enter |
|---|---|
| Privacy policy | `https://credibilit-radar-app-ezbyi9yb.blinkpowered.com/privacy` |
| App access | All functionality available without restrictions |
| Ads | No |
| Content rating | Run the questionnaire → pick "Utility" → answer No to everything → submit |
| Target audience | 13+ |
| News app | No |
| COVID-19 | No |
| Data safety | Use `PLAY_STORE_DATA_SAFETY.md` — it has every answer |
| Government app | No |
| Financial features | No |

### Step 15 — Create subscriptions in Play Console

Your app → **Monetize** → **Products** → **Subscriptions** → **Create subscription**

**Subscription 1:**
- Product ID: `pro_monthly`
- Name: Pro Monthly
- Base plan ID: `monthly-base-plan`
- Billing period: Monthly
- Price: $14.99
- Click **Save** then **Activate**

**Subscription 2:**
- Product ID: `pro_annual`
- Name: Pro Annual
- Base plan ID: `annual-base-plan`
- Billing period: Yearly
- Price: $99.00
- Click **Save** then **Activate**

⚠️ The product IDs must match exactly as shown above — they're already wired in the app.

---

## PART 5 — Test and submit

### Step 16 — Test on your phone first

1. Play Console → **Testing** → **Internal testing**
2. You'll see your upload from Step 12
3. Click **"Testers"** tab → **"Create email list"** → add your own Gmail
4. Scroll up → click **"Copy link"** 
5. Open that link on your Android phone → opt in → install the app
6. Open the app and try everything: sign up, run an analysis, tap "Go Pro"

### Step 17 — Submit for review

Once testing looks good:

**Option A (easy) — promote from internal testing:**
1. Play Console → Testing → Internal testing → your release → **"Promote release"** → **"Production"**
2. Add release notes (from `STORE_LISTING.md` → "What's New" section)
3. **Review** → **Start rollout to Production** → **Submit**

**Option B — submit directly to production:**
1. Play Console → **Release** → **Production** → **Create new release**
2. Upload the `.aab` from expo.dev (downloaded in Step 11)
3. Add release notes → Review → Submit

Google reviews in **1–7 days** for first submissions.

---

## What to do if something goes wrong

**"eas: command not found"**
→ Step 3 didn't work. Try: `sudo npm install -g eas-cli` (Mac/Linux) or run terminal as Administrator (Windows)

**"Not logged in"**
→ Run `eas login` again

**"No project found"**
→ Make sure you're in the project folder: `cd path/to/your/project` then run `eas init` again

**Any other error message**
→ Take a screenshot and show it to me (Blink) — I'll tell you exactly what to do

---

## Quick checklist

- [ ] Node.js installed
- [ ] Expo account created at expo.dev
- [ ] `eas login` done
- [ ] Project downloaded to your computer
- [ ] `npm install` done in project folder
- [ ] `eas init` done → told Blink the project ID
- [ ] Google service account JSON downloaded + renamed + moved to project folder
- [ ] `eas build --platform android --profile production` — waited for build to finish
- [ ] `eas submit --platform android --latest` — uploaded to Play Console
- [ ] Play Console listing filled in
- [ ] Subscriptions created in Play Console
- [ ] Tested on own phone via internal testing
- [ ] Submitted for review
