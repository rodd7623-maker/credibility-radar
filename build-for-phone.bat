@echo off
:: ============================================================
::  Credibility Radar — Build for Your Phone (Direct Install)
::  Windows — right-click → Run as administrator
:: ============================================================

echo.
echo ======================================================
echo   Credibility Radar — Build for Your Phone
echo ======================================================
echo.
echo   This builds an APK you can install directly.
echo   No Play Store needed. Takes ~12 minutes.
echo.

:: ── 1. Check Node.js ─────────────────────────────────────
where node >nul 2>&1
if %errorlevel% neq 0 (
  echo [ERROR] Node.js is not installed.
  echo.
  echo   1. Go to https://nodejs.org
  echo   2. Click the big green LTS button and install it
  echo   3. Restart your computer then run this script again
  echo.
  pause
  exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo [OK] Node.js %NODE_VER% found

:: ── 2. Install EAS CLI if needed ─────────────────────────
where eas >nul 2>&1
if %errorlevel% neq 0 (
  echo.
  echo [INFO] Installing EAS CLI (one-time, ~30 seconds)...
  npm install -g eas-cli
)
echo [OK] EAS CLI ready

:: ── 3. Log in to Expo ────────────────────────────────────
echo.
echo [INFO] Signing in to Expo...
echo        (Need a free account? Go to https://expo.dev/signup)
echo.
eas login

:: ── 4. Check project folder ──────────────────────────────
if not exist "app.json" (
  echo.
  echo [ERROR] Can't find app.json.
  echo         Make sure you're running this from the project folder.
  echo.
  pause
  exit /b 1
)

:: ── 5. Install dependencies ──────────────────────────────
echo.
echo [INFO] Installing dependencies...
where bun >nul 2>&1
if %errorlevel% equ 0 (
  bun install
) else (
  npm install
)

:: ── 6. Build preview APK ─────────────────────────────────
echo.
echo [INFO] Building APK for your phone...
echo        This runs on Expo's cloud — takes ~12 minutes
echo        Watch progress at https://expo.dev → your project → Builds
echo.
eas build --platform android --profile preview

echo.
echo ======================================================
echo   Build complete!
echo.
echo   How to install on your phone:
echo.
echo   1. Go to https://expo.dev → your project → Builds
echo   2. Click the latest build
echo   3. Scan the QR code with your Android phone
echo      OR click the download link and transfer the APK
echo.
echo   On your phone:
echo   4. Open the downloaded .apk file
echo   5. If prompted 'Unknown sources' → tap Allow
echo   6. Tap Install
echo.
echo   [!] This is a TEST build. Purchases use test mode.
echo       Use a Google test account for IAP testing.
echo ======================================================
echo.
pause
