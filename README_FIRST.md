# MENTIS AI — RUN THIS FIRST

This version was rebuilt cleanly for **Expo SDK 57 / Expo Go**.

## Easiest method on Windows

### First time only
1. Extract the ZIP.
2. Open the extracted folder.
3. Double-click **START_MENTIS.bat**.
4. Wait while `npm install` finishes.
5. A QR code will appear.
6. Make sure the iPhone and laptop are on the same Wi‑Fi.
7. Open the iPhone Camera, scan the QR, and open it in **Expo Go**.

### Every time after that
Just double-click **START_MENTIS.bat** again.

---

## Manual terminal method

Open PowerShell in this folder and run:

```powershell
npm install
npx expo start --clear
```

Then scan the QR with your iPhone.

## Requirements
- Node.js 22.13+ (your Node 22.20 is fine)
- Latest Expo Go on iPhone
- Laptop + iPhone on the same Wi‑Fi

## If the phone cannot connect
Run:

```powershell
npx expo start --tunnel --clear
```

Then scan the new QR.

## Important
You do **not** need to log in to Expo just to run this locally in Expo Go.

---

# What this build includes

Fully runnable flow:

Splash
→ premium onboarding
→ goals
→ screen-time/app habit questions
→ 3-step cognitive focus check
→ Google-style login
→ automatic username
→ plan generation
→ working app shell + dashboard

Inside the app:
- Home
- Detox
- Train
- Progress
- Profile
- simulated focus-session popup
- toggles for protection rules
- local persistence using AsyncStorage
- reset demo option

## Google login in this update

The button is intentionally **demo Google login** so the project opens immediately with no OAuth keys.

Later replace:
`src/services/authService.ts`

with:

Google OAuth
→ NestJS `/auth/google`
→ JWT
→ PostgreSQL

The pre-login answers are already saved locally and attached to the generated user object, so the future backend flow is straightforward.

## App blocking

Expo Go cannot perform real operating-system app blocking.

For the current update, the full Detox UX is included and interactive.

Sprint 2:
React Native
→ native Android Usage Access / app restriction module
→ NestJS logging
→ PostgreSQL

That is the point where the real blocker is connected without throwing away this UI.
