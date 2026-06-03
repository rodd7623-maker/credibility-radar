# Play Store Data Safety Form — Answers

Copy these answers directly into Play Console → **App content → Data safety**.

---

## Section 1: Data collection and security

**Does your app collect or share any of the required user data types?**
✅ **Yes**

**Is all of the user data collected by your app encrypted in transit?**
✅ **Yes** (all traffic uses HTTPS/TLS)

**Do you provide a way for users to request that their data be deleted?**
✅ **Yes** — users can email privacy@credibilityradar.app to request account + data deletion within 30 days.

---

## Section 2: Data types collected

### Personal info
| Data type | Collected | Shared | Optional | Purpose |
|---|---|---|---|---|
| **Email address** | ✅ Yes | ❌ No | ❌ Required | Account management, App functionality |
| Name | ❌ No | — | — | — |
| User IDs | ✅ Yes | ❌ No | ❌ Required | Account management, Analytics |
| Address | ❌ No | — | — | — |
| Phone number | ❌ No | — | — | — |
| Race and ethnicity | ❌ No | — | — | — |
| Political or religious beliefs | ❌ No | — | — | — |
| Sexual orientation | ❌ No | — | — | — |
| Other info | ❌ No | — | — | — |

### Financial info
| Data type | Collected | Shared | Optional | Purpose |
|---|---|---|---|---|
| User payment info | ❌ No | — | — | (Handled entirely by Google Play — we never see it) |
| Purchase history | ✅ Yes | ❌ No | ❌ Required | App functionality (entitlement check via RevenueCat) |
| Credit score | ❌ No | — | — | — |
| Other financial info | ❌ No | — | — | — |

### Location
All ❌ No (the app does not use location)

### Web browsing
All ❌ No

### App info and performance
| Data type | Collected | Shared | Optional | Purpose |
|---|---|---|---|---|
| **Crash logs** | ✅ Yes | ❌ No | ❌ Required | Analytics, App functionality |
| **Diagnostics** (app version, OS) | ✅ Yes | ❌ No | ❌ Required | Analytics, App functionality |
| Other app performance data | ❌ No | — | — | — |

### Device or other IDs
| Data type | Collected | Shared | Optional | Purpose |
|---|---|---|---|---|
| Device or other IDs | ✅ Yes | ❌ No | ❌ Required | Analytics, Fraud prevention (RevenueCat anonymous device ID) |

### Audio files
| Data type | Collected | Shared | Optional | Purpose |
|---|---|---|---|---|
| Voice or sound recordings | ❌ **No** | — | — | Voice is transcribed on-device-to-server and **immediately discarded** — only the text transcript is stored. We do NOT store audio. |

> Per Google guidance: if audio is processed ephemerally and not stored, you may answer "No" here. We process voice only as transient input to transcription.

### Photos and videos
| Data type | Collected | Shared | Optional | Purpose |
|---|---|---|---|---|
| Photos | ❌ No (only used as input to OCR if user picks one, never stored on our servers) | — | — | — |
| Videos | ❌ No | — | — | — |

### Files and docs
All ❌ No

### Calendar / Contacts / Messages / Health / Fitness
All ❌ No

### Other user-generated content
| Data type | Collected | Shared | Optional | Purpose |
|---|---|---|---|---|
| **Other user-generated content** (text submitted for analysis) | ✅ Yes | ❌ No | ❌ Required | App functionality (running the analysis, storing history) |

### Actions in app
| Data type | Collected | Shared | Optional | Purpose |
|---|---|---|---|---|
| App interactions | ✅ Yes | ❌ No | ✅ Optional | Analytics, App functionality |
| In-app search history | ❌ No | — | — | — |
| Installed apps | ❌ No | — | — | — |
| Other actions | ❌ No | — | — | — |

---

## Section 3: Other questions

**Is your app's data collection compliant with the Families Policy?**
✅ Yes (app is not directed to children under 13; we declare this in our privacy policy)

**Do you use data for any of the following purposes?**
- ✅ App functionality
- ✅ Analytics
- ✅ Account management
- ✅ Fraud prevention, security, and compliance
- ❌ Advertising or marketing
- ❌ Personalization
- ❌ Developer communications

---

## Required URLs for the form

- **Privacy policy URL:** `https://credibilit-radar-app-ezbyi9yb.blinkpowered.com/privacy`
- **Support email:** `support@credibilityradar.app`

---

## When asked about data sharing with third parties

State that the app uses these processors (sub-processors, not third-party data sharing):
- **Blink** — auth + database + AI inference
- **RevenueCat** — subscription state
- **Google Play Billing** — payment processing

None of these constitute "sharing for advertising" — they are essential infrastructure providers, which Google treats as "processing" not "sharing."
