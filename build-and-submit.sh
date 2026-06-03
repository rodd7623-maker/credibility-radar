#!/bin/bash
# ============================================================
#  Credibility Radar — Build & Submit to Play Store
#  Mac / Linux — just double-click this file
# ============================================================

set -e

echo ""
echo "======================================================"
echo "  Credibility Radar — Play Store Publisher"
echo "======================================================"
echo ""

# ── 1. Check Node.js ──────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo "❌  Node.js is not installed."
  echo ""
  echo "  1. Go to https://nodejs.org"
  echo "  2. Click the big green LTS button and install it"
  echo "  3. Then double-click this script again"
  echo ""
  read -p "Press Enter to exit..."
  exit 1
fi
echo "✅  Node.js $(node --version) found"

# ── 2. Install EAS CLI ────────────────────────────────────
if ! command -v eas &>/dev/null; then
  echo ""
  echo "📦  Installing EAS CLI (one-time, ~30 seconds)..."
  npm install -g eas-cli
fi
echo "✅  EAS CLI $(eas --version) found"

# ── 3. Log in to Expo ────────────────────────────────────
echo ""
echo "🔑  Signing in to your Expo account..."
echo "    (Need a free account? Go to https://expo.dev and sign up first)"
echo ""
eas login

# ── 4. Check we're in the right folder ───────────────────
if [ ! -f "app.json" ]; then
  echo ""
  echo "❌  Can't find app.json in this folder."
  echo "    Make sure you're running this script from inside the project folder."
  echo ""
  read -p "Press Enter to exit..."
  exit 1
fi

# ── 5. Install npm dependencies ───────────────────────────
echo ""
echo "📦  Installing project dependencies..."
npm install

# ── 6. Initialize EAS project ────────────────────────────
echo ""
echo "🔗  Linking project to EAS..."
eas init --non-interactive || eas init

# ── 7. Check for Google service account JSON ─────────────
echo ""
if [ ! -f "google-play-service-account.json" ]; then
  echo "⚠️   google-play-service-account.json not found."
  echo ""
  echo "  You need to create this file from Google Play Console."
  echo "  See HOW_TO_PUBLISH.md → Steps 8–10 for click-by-click instructions."
  echo ""
  echo "  Once you have the file:"
  echo "  1. Rename it to:  google-play-service-account.json"
  echo "  2. Put it in this folder (next to app.json)"
  echo "  3. Run this script again"
  echo ""
  read -p "Press Enter to exit..."
  exit 1
fi
echo "✅  Google service account JSON found"

# ── 8. Build ──────────────────────────────────────────────
echo ""
echo "🏗️   Building Android app (this takes ~15 minutes)..."
echo "    You can watch progress at https://expo.dev → your project → Builds"
echo ""
eas build --platform android --profile production

# ── 9. Submit ─────────────────────────────────────────────
echo ""
echo "🚀  Uploading to Play Store (Internal testing track)..."
eas submit --platform android --latest

echo ""
echo "======================================================"
echo "  ✅  Done! Your build is now in Play Console."
echo ""
echo "  Next steps:"
echo "  1. Go to https://play.google.com/console"
echo "  2. Your app → Testing → Internal testing"
echo "  3. Add your email as a tester"
echo "  4. Install on your phone and test purchases"
echo "  5. When happy → Promote release → Production"
echo "======================================================"
echo ""
read -p "Press Enter to close..."
