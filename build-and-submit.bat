@echo off
REM ============================================================
REM  Credibility Radar — Build & Submit to Play Store
REM  Windows — just double-click this file
REM ============================================================

echo.
echo ======================================================
echo   Credibility Radar — Play Store Publisher
echo ======================================================
echo.

REM ── 1. Check Node.js ─────────────────────────────────────
node --version >nul 2>&1
if errorlevel 1 (
  echo X  Node.js is not installed.
  echo.
  echo   1. Go to https://nodejs.org
  echo   2. Click the big green LTS button and install it
  echo   3. Then double-click this script again
  echo.
  pause
  exit /b 1
)
echo OK  Node.js found

REM ── 2. Install EAS CLI ───────────────────────────────────
eas --version >nul 2>&1
if errorlevel 1 (
  echo.
  echo Installing EAS CLI (one-time, ~30 seconds)...
  npm install -g eas-cli
)
echo OK  EAS CLI found

REM ── 3. Log in to Expo ────────────────────────────────────
echo.
echo Signing in to your Expo account...
echo (Need a free account? Go to https://expo.dev and sign up first)
echo.
eas login

REM ── 4. Check we're in the right folder ──────────────────
if not exist "app.json" (
  echo.
  echo X  Can't find app.json in this folder.
  echo    Make sure you're running this script from inside the project folder.
  echo.
  pause
  exit /b 1
)

REM ── 5. Install dependencies ──────────────────────────────
echo.
echo Installing project dependencies...
npm install

REM ── 6. Initialize EAS project ───────────────────────────
echo.
echo Linking project to EAS...
eas init

REM ── 7. Check for Google service account JSON ────────────
echo.
if not exist "google-play-service-account.json" (
  echo WARNING: google-play-service-account.json not found.
  echo.
  echo   You need this file from Google Play Console.
  echo   See HOW_TO_PUBLISH.md - Steps 8-10 for click-by-click instructions.
  echo.
  echo   Once you have the file:
  echo   1. Rename it to:  google-play-service-account.json
  echo   2. Put it in this folder (next to app.json)
  echo   3. Run this script again
  echo.
  pause
  exit /b 1
)
echo OK  Google service account JSON found

REM ── 8. Build ─────────────────────────────────────────────
echo.
echo Building Android app (this takes ~15 minutes)...
echo You can watch progress at https://expo.dev - your project - Builds
echo.
eas build --platform android --profile production

REM ── 9. Submit ────────────────────────────────────────────
echo.
echo Uploading to Play Store (Internal testing track)...
eas submit --platform android --latest

echo.
echo ======================================================
echo   DONE! Your build is now in Play Console.
echo.
echo   Next steps:
echo   1. Go to https://play.google.com/console
echo   2. Your app - Testing - Internal testing
echo   3. Add your email as a tester
echo   4. Install on your phone and test purchases
echo   5. When happy - Promote release - Production
echo ======================================================
echo.
pause
