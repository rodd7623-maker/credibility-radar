#!/bin/bash
# ============================================================
#  Credibility Radar — Build for Your Phone (Direct Install)
#  Mac / Linux — right-click → Open With → Terminal
# ============================================================

set -e

echo ""
echo "======================================================"
echo "  Credibility Radar — Build for Your Phone"
echo "======================================================"
echo ""
echo "  This builds an APK you can install directly."
echo "  No Play Store needed. Takes ~12 minutes."
echo ""

# ── 1. Check Node.js ──────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo "❌  Node.js is not installed."
  echo ""
  echo "  1. Go to https://nodejs.org"
  echo "  2. Click the big green LTS button and install it"
  echo "  3. Restart your Mac then run this script again"
  echo ""
  read -p "Press Enter to exit..."
  exit 1
fi
echo "✅  Node.js $(node --version) found"

# ── 2. Install EAS CLI if needed ─────────────────────────
if ! command -v eas &>/dev/null; then
  echo ""
  echo "📦  Installing EAS CLI (one-time, ~30 seconds)..."
  npm install -g eas-cli
fi
echo "✅  EAS CLI ready"

# ── 3. Log in to Expo ────────────────────────────────────
echo ""
echo "🔑  Signing in to Expo..."
echo "    (Need a free account? Go to https://expo.dev/signup)"
echo ""
eas login

# ── 4. Check project folder ──────────────────────────────
if [ ! -f "app.json" ]; then
  echo ""
  echo "❌  Can't find app.json."
  echo "    Make sure you're running this from the project folder."
  echo ""
  read -p "Press Enter to exit..."
  exit 1
fi

# ── 5. Install dependencies ──────────────────────────────
echo ""
echo "📦  Installing dependencies..."
if command -v bun &>/dev/null; then
  bun install
else
  npm install
fi

# ── 6. Build preview APK ─────────────────────────────────
echo ""
echo "🏗️   Building APK for your phone..."
echo "    (This runs on Expo's cloud — takes ~12 minutes)"
echo "    Watch progress at https://expo.dev → your project → Builds"
echo ""
eas build --platform android --profile preview

echo ""
echo "======================================================"
echo "  ✅  Build complete!"
echo ""
echo "  How to install on your phone:"
echo ""
echo "  1. Go to https://expo.dev → your project → Builds"
echo "  2. Click the latest build"
echo "  3. Scan the QR code with your Android phone"
echo "     OR click the download link and transfer the APK"
echo ""
echo "  On your phone:"
echo "  4. Open the downloaded .apk file"
echo "  5. If prompted 'Unknown sources' → tap Allow"
echo "  6. Tap Install"
echo ""
echo "  ⚠️  This is a TEST build — purchases use test mode."
echo "       Use a Google test account for IAP testing."
echo "======================================================"
echo ""
read -p "Press Enter to close..."
