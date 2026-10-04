# Mentis AI - Faculty Release v1

This repository upgrades the earlier Expo prototype into a real full-stack application:

- React Native + TypeScript + Expo 57 mobile frontend
- NestJS REST API
- PostgreSQL
- Prisma ORM
- JWT access + refresh authentication
- Persistent onboarding, focus sessions, goals, mood, games, XP, community and AI insights
- Swagger API documentation
- Seeded faculty demo account/data
- Optional OpenAI daily insight / weekly reflection with deterministic fallback

The existing Mentis visual direction is preserved: off-white background, navy/ink typography, indigo primary actions, rounded cards and restrained color.

## Fastest Windows demo setup

Prerequisites:

1. Node.js 22+
2. Docker Desktop
3. Expo Go on your phone OR Android Studio emulator

Then:

1. Extract the project to a simple path such as `E:\MentisAI`.
2. Double-click `SETUP_DEMO.bat`.
3. Wait for PostgreSQL, npm packages, Prisma schema and seed data to finish.
4. Open one terminal and run `START_BACKEND.bat`.
5. Open a second terminal and run `START_MOBILE.bat`.

### Demo login

- Email: `demo@mentis.app`
- Password: `Mentis123!`

The seeded account already contains focus history, mood data, a personal goal, game history, XP, leaderboards, challenges and collectibles.

## Android emulator

The included mobile `.env.demo` uses:

`EXPO_PUBLIC_API_URL=http://10.0.2.2:4000/api`

That is correct for the standard Android emulator.

## Physical Android phone

Your phone cannot use `10.0.2.2` or `localhost` to reach the PC. Put both devices on the same Wi-Fi, find the PC IPv4 address with:

`ipconfig`

Then edit `apps/mobile/.env` to something like:

`EXPO_PUBLIC_API_URL=http://192.168.0.105:4000/api`

Restart Expo after changing the file.

If Windows Firewall asks about Node, allow Private Networks.

## API URLs

When backend is running:

- Health: `http://localhost:4000/api/health`
- Swagger: `http://localhost:4000/api/docs`
- Static demo assets: `http://localhost:4000/assets/...`

## What is genuinely implemented

### Authentication

- register
- login
- JWT access token
- refresh token rotation
- logout
- persistent mobile session

### Onboarding

- goals
- screen-time range
- distracting apps
- three-step cognitive/focus baseline
- server-saved assessment
- backend-generated starter plan

### Home

- real dashboard endpoint
- focus index
- XP and level
- active personal goal
- weekly focus summary
- persisted Daily Insight

### Mentis AI

`apps/api/src/ai/ai.service.ts` has two modes.

With `OPENAI_API_KEY` empty, Mentis uses deterministic, evidence-based fallback suggestions so the faculty demo never depends on internet/API availability.

If you add an OpenAI API key to `apps/api/.env`, the backend calls the Responses API and still falls back safely if the request fails.

AI is server-side; the mobile app never receives the provider API key.

### Detox / Focus

- start focus session
- active database state
- complete or abandon session
- focus history
- XP reward on completion
- activity event logging

True Android OS-level app restriction is intentionally isolated from the main demo and is not required for the rest of the product to work.

### Train

- backend game catalog
- playable Pattern Lab demo
- persisted game score
- XP rewards
- Sudoku/Mystery catalog records
- Offline Play PDF catalog
- real locally served printable PDF files
- Focus & Calm audio catalog
- locally served demo WAV audio assets

### Reflect / Progress

- mood check-ins
- seven-day mood visualization
- personal goals
- goal progress logs
- goal completion logic
- weekly AI reflection

All wellness data is treated as non-clinical self-reflection.

### Community / Loyalty

- XP event model
- four levels: Starter, Focused, Disciplined, Ascendant
- weekly leaderboard
- community challenges
- join challenge
- unlockable collectibles
- native share sheet for progress sharing

## Database reset before faculty demo

From project root:

```bash
npm run db:push
npm run db:seed
```

`db:seed` intentionally resets the faculty data set so the app returns to a predictable demonstration state.

## OpenAI configuration - optional

Edit `apps/api/.env`:

```env
OPENAI_API_KEY="your-key"
OPENAI_MODEL="gpt-6-luna"
```

If you do not set a key, everything still works. The UI labels the insight as a safe fallback instead of pretending an external AI call occurred.

## Architecture

```text
React Native / Expo
        |
        | REST + JWT
        v
NestJS modular API
        |
        +---- Auth / Onboarding / Dashboard
        +---- Focus / Wellness / Content
        +---- Community / Rewards / AI
        |
        +----> PostgreSQL via Prisma
        |
        +----> Optional OpenAI Responses API
        |
        +----> Static PDF / audio demo assets
```

See `docs/architecture.md` and `docs/database.md` for the detailed explanation you can use in viva.

## Important demo sequence

1. Start backend and open Swagger once.
2. Start Expo app.
3. Use the seeded demo login if time is short.
4. Show Home and the Daily Insight.
5. Start the 1-minute faculty focus demo and complete it immediately.
6. Refresh Home and show XP/focus data updated.
7. Open Train and solve Pattern Lab correctly (`32`).
8. Open one Offline Play PDF.
9. Open Focus & Calm audio.
10. Open Progress and submit a mood check-in.
11. Add +1 to the reading goal.
12. Show weekly Mentis reflection.
13. Open Profile: leaderboard, level, collectibles and challenges.
14. Use Share Progress.
15. Return to Swagger and show that the data is coming from a real API.

## Troubleshooting

### `Network request failed` on phone

Almost always the phone cannot reach the PC. Use the PC LAN IP in `apps/mobile/.env` and make sure backend says it is listening on port 4000.

### Database connection error

Run:

```bash
docker compose up -d
```

Then:

```bash
npm run db:push
npm run db:seed
```

### Expo package mismatch

Run inside `apps/mobile`:

```bash
npx expo-doctor@latest
npx expo install --fix
```

### Want a completely clean demo

```bash
npm run db:seed
```

Then log in again with the demo account.

## Security / production notes

This faculty build stores mobile JWTs in AsyncStorage to keep the Expo 57 dependency set minimal and reproducible. For a production release, move refresh credentials to Expo SecureStore / native secure storage and add rate limiting, email verification, password recovery, structured logging, cloud object storage, monitoring and hardened CORS rules.
