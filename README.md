# Mentis AI — V2 Faculty Release

Mentis AI is a full-stack digital wellbeing and focus-improvement mobile application built with **React Native (Expo)** on the frontend and **NestJS** on the backend. This repository is the **V2 Faculty Release**, a complete upgrade from the earlier Expo prototype into a production-ready, API-driven application.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [How the System Works](#how-the-system-works)
  - [Authentication Flow](#authentication-flow)
  - [Mobile ↔ API Communication](#mobile--api-communication)
  - [Database & ORM](#database--orm)
  - [AI Insights (Mentis AI Engine)](#ai-insights-mentis-ai-engine)
  - [Focus Sessions](#focus-sessions)
  - [Gamification & XP](#gamification--xp)
- [Quick Start (Windows)](#quick-start-windows)
- [Running on a Physical Phone](#running-on-a-physical-phone)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Database Management](#database-management)
- [Troubleshooting](#troubleshooting)
- [Security Notes](#security-notes)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile Frontend | React Native + Expo 57 + TypeScript |
| Backend API | NestJS (Node.js) + TypeScript |
| Database | PostgreSQL 16 (via Docker) |
| ORM | Prisma |
| Auth | JWT (access token + refresh token rotation) |
| AI Engine | OpenAI Responses API (with deterministic fallback) |
| API Docs | Swagger (auto-generated) |
| Containerization | Docker Compose |

---

## Architecture Overview

```
┌─────────────────────────────────────┐
│        React Native / Expo          │
│   (Mobile App — iOS & Android)      │
└──────────────┬──────────────────────┘
               │  REST + JWT Bearer Token
               ▼
┌─────────────────────────────────────┐
│         NestJS REST API             │
│         (Port 4000)                 │
│                                     │
│  ┌──────────┐  ┌─────────────────┐  │
│  │  Auth    │  │   Onboarding    │  │
│  │  Module  │  │   Module        │  │
│  └──────────┘  └─────────────────┘  │
│  ┌──────────┐  ┌─────────────────┐  │
│  │  Focus / │  │   Wellness /    │  │
│  │  Detox   │  │   Mood          │  │
│  └──────────┘  └─────────────────┘  │
│  ┌──────────┐  ┌─────────────────┐  │
│  │Community │  │   AI Engine     │  │
│  │/ Rewards │  │   (Insights)    │  │
│  └──────────┘  └─────────────────┘  │
│                                     │
│         ┌───────────┐               │
│         │  Prisma   │               │
│         │  ORM      │               │
│         └─────┬─────┘               │
└───────────────┼─────────────────────┘
                ▼
┌─────────────────────────────────────┐
│   PostgreSQL Database (Docker)      │
└─────────────────────────────────────┘
                +
┌─────────────────────────────────────┐
│   OpenAI API (Optional)             │
│   Falls back to deterministic       │
│   evidence-based suggestions        │
└─────────────────────────────────────┘
```

---

## Project Structure

```
mentis-ai-faculty-release/
├── apps/
│   ├── api/                     # NestJS Backend
│   │   ├── src/
│   │   │   ├── auth/            # JWT auth, login, register, refresh
│   │   │   ├── onboarding/      # User onboarding flow & assessment
│   │   │   ├── dashboard/       # Home screen data aggregation
│   │   │   ├── focus/           # Focus session lifecycle
│   │   │   ├── wellness/        # Mood check-ins, goals, reflections
│   │   │   ├── content/         # Games, audio, PDFs catalog
│   │   │   ├── community/       # XP, leaderboards, challenges
│   │   │   ├── ai/              # AI insight generation
│   │   │   └── prisma/          # Prisma service wrapper
│   │   ├── prisma/
│   │   │   ├── schema.prisma    # Full database schema definition
│   │   │   └── seed.ts          # Demo data seeder
│   │   └── .env                 # Backend environment config
│   └── mobile/                  # React Native Expo App
│       ├── src/
│       │   ├── screens/         # All app screens (Home, Train, Reflect…)
│       │   ├── components/      # Reusable UI components
│       │   ├── navigation/      # React Navigation stack & tab config
│       │   ├── api/             # Axios API client + typed request helpers
│       │   ├── context/         # Auth context (JWT token management)
│       │   └── hooks/           # Custom React hooks
│       ├── App.tsx              # App entry point + navigation root
│       └── .env                 # Mobile environment config (API URL)
├── docker-compose.yml           # PostgreSQL container definition
├── package.json                 # npm workspaces root (manages both apps)
├── SETUP_DEMO.bat               # One-click Windows setup script
├── START_BACKEND.bat            # Starts the NestJS API server
└── START_MOBILE.bat             # Starts the Expo dev server (QR code)
```

---

## How the System Works

### Authentication Flow

The app uses a **dual-token JWT system**:

1. **Registration / Login** → Backend validates credentials against PostgreSQL, generates:
   - A short-lived **Access Token** (used for all API requests, sent in `Authorization: Bearer <token>` header)
   - A long-lived **Refresh Token** (used only to silently renew the access token)
2. **Token Storage** → Both tokens are stored in `AsyncStorage` on the device (React Native).
3. **Auto-Refresh** → The Axios API client intercepts `401 Unauthorized` responses and automatically calls the `/auth/refresh` endpoint to get a new access token — transparent to the user.
4. **Logout** → Tokens are revoked server-side and cleared from device storage.

**Key files:**
- Backend: [`apps/api/src/auth/`](apps/api/src/auth/)
- Mobile: [`apps/mobile/src/context/`](apps/mobile/src/context/), [`apps/mobile/src/api/`](apps/mobile/src/api/)

---

### Mobile ↔ API Communication

The mobile app communicates with the backend exclusively through **REST API calls** using **Axios**.

- The API base URL is configured via the `EXPO_PUBLIC_API_URL` environment variable in `apps/mobile/.env`.
- All authenticated requests attach the JWT access token via an Axios request interceptor.
- For a **physical phone**, the URL must use your PC's **local network IP** (e.g., `http://192.168.0.103:4000/api`), not `localhost`, because the phone is a separate device on the network.
- For the **Android emulator**, use `http://10.0.2.2:4000/api` (the emulator's alias for the host machine's localhost).

---

### Database & ORM

The database layer uses **Prisma** as the ORM on top of **PostgreSQL**.

- **Schema** is defined in `apps/api/prisma/schema.prisma` — this is the single source of truth for the entire data model (users, sessions, moods, goals, XP events, challenges, collectibles, etc.).
- **`prisma db push`** — syncs the Prisma schema to the actual PostgreSQL database (creates/alters tables). Used in development.
- **`prisma generate`** — generates the type-safe Prisma Client from the schema, used throughout the NestJS services.
- **`prisma db seed`** — runs `seed.ts` which populates the database with the demo faculty account (`demo@mentis.app`) and sample focus history, mood data, goals, XP, leaderboard entries, and collectibles.
- PostgreSQL runs inside a **Docker container** defined in `docker-compose.yml`, persisting data to a named Docker volume (`mentis_postgres`).

---

### AI Insights (Mentis AI Engine)

The AI engine lives entirely server-side in [`apps/api/src/ai/ai.service.ts`](apps/api/src/ai/ai.service.ts).

**Two operating modes:**

| Mode | Behaviour |
|---|---|
| **No API key** (default) | Uses deterministic, evidence-based fallback responses. The mobile app shows a "safe fallback" label. The demo never depends on internet/API availability. |
| **OpenAI key set** | Calls the OpenAI Responses API to generate personalised daily insights and weekly reflections based on the user's actual focus and mood data. |

The mobile client **never** receives or stores the OpenAI API key — all AI calls are proxied through the NestJS backend.

---

### Focus Sessions

A focus session lifecycle is managed by the `FocusModule`:

1. **Start** → `POST /focus/start` — creates a new `FocusSession` record in the database with `status: ACTIVE`.
2. **Active state** → The session persists in the database, surviving app restarts.
3. **Complete** → `POST /focus/complete/:id` — marks session as `COMPLETED`, logs an XP reward event, and updates the user's focus index.
4. **Abandon** → `POST /focus/abandon/:id` — marks session as `ABANDONED` (no XP awarded).
5. All session history is retrievable via `GET /focus/history`.

---

### Gamification & XP

Mentis uses an XP and level system to encourage sustained engagement:

- XP is awarded for completing focus sessions, submitting mood check-ins, completing game challenges, and finishing goals.
- **4 levels:** Starter → Focused → Disciplined → Ascendant
- A **weekly leaderboard** ranks users by XP earned in the current week.
- **Community challenges** can be joined; completion grants bonus XP.
- **Collectibles** are unlocked at XP milestones and displayed on the Profile screen.
- All XP events are logged in an `XpEvent` table for a full audit trail.

---

## Quick Start (Windows)

**Prerequisites:**
1. [Node.js 22+](https://nodejs.org/)
2. [Docker Desktop](https://www.docker.com/products/docker-desktop/)
3. [Expo Go](https://expo.dev/go) on your phone **OR** Android Studio with an emulator

**Steps:**
1. Extract the project to a simple path, e.g. `E:\MentisAI`
2. Make sure **Docker Desktop is open and the engine is running** (green icon in taskbar)
3. Double-click **`SETUP_DEMO.bat`** — this will:
   - Start the PostgreSQL container
   - Install all Node.js dependencies
   - Generate the Prisma client
   - Push the database schema
   - Seed the demo account and data
4. Double-click **`START_BACKEND.bat`** in one terminal
5. Double-click **`START_MOBILE.bat`** in another terminal — scan the QR code with Expo Go

**Demo login:**
```
Email:    demo@mentis.app
Password: Mentis123!
```

---

## Running on a Physical Phone

Your phone cannot use `localhost` or `10.0.2.2` — it needs your PC's real local IP address.

1. Connect your PC and phone to the **same Wi-Fi network**
2. Find your PC's IP:
   ```
   ipconfig
   ```
   Look for the `IPv4 Address` under your active Wi-Fi adapter (e.g. `192.168.0.103`)
3. Edit `apps/mobile/.env`:
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.0.103:4000/api
   ```
4. Restart the Expo server (`START_MOBILE.bat`)
5. If Windows Firewall prompts about Node.js, click **Allow** for Private Networks

---

## Environment Variables

### Backend — `apps/api/.env`

```env
DATABASE_URL="postgresql://mentis:mentis@localhost:5432/mentis"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
OPENAI_API_KEY=""          # Optional — leave blank for deterministic fallback
OPENAI_MODEL="gpt-4o"      # Only used if API key is set
```

### Mobile — `apps/mobile/.env`

```env
EXPO_PUBLIC_API_URL=http://<YOUR_PC_IP>:4000/api
# Use http://10.0.2.2:4000/api for Android emulator
# Use http://192.168.x.x:4000/api for physical phone
```

---

## API Reference

When the backend is running, full interactive documentation is available at:

- **Swagger UI:** `http://localhost:4000/api/docs`
- **Health check:** `http://localhost:4000/api/health`

Key endpoint groups:

| Group | Base Path |
|---|---|
| Authentication | `/api/auth` |
| Onboarding | `/api/onboarding` |
| Dashboard | `/api/dashboard` |
| Focus Sessions | `/api/focus` |
| Wellness / Mood | `/api/wellness` |
| Goals | `/api/goals` |
| Games / Content | `/api/content` |
| Community / XP | `/api/community` |
| AI Insights | `/api/ai` |

---

## Database Management

From the project root:

```bash
# Reset and reseed demo data (use before a faculty demo)
npm run db:seed

# Re-sync schema changes to the database
npm run db:push

# Open Prisma Studio (visual DB browser)
npm run db:studio

# Regenerate Prisma Client after schema changes
npm run db:generate
```

---

## Troubleshooting

### `Network request failed` on phone
The phone cannot reach the backend. Check:
- Both devices are on the same Wi-Fi
- `apps/mobile/.env` uses the PC's LAN IP (not `localhost`)
- The backend is running and shows `Listening on port 4000`
- Windows Firewall allows Node.js on Private Networks

### Database connection error
```bash
docker compose up -d
npm run db:push
npm run db:seed
```

### Expo package mismatch
```bash
cd apps/mobile
npx expo-doctor@latest
npx expo install --fix
```

### Backend won't start (`@prisma/client` not found)
```bash
npm run db:generate
```

### Want a completely clean demo state
```bash
npm run db:seed
```
Then log in again with the demo account.

---

## Security Notes

This faculty build uses `AsyncStorage` for JWT storage to keep the Expo 57 dependency set minimal and reproducible. For a **production release**, the following hardening steps are required:

- Move refresh tokens to **Expo SecureStore** / native secure storage
- Add **rate limiting** on auth endpoints
- Implement **email verification** and **password recovery**
- Add **structured logging** and monitoring
- Use **cloud object storage** (S3 etc.) for audio/PDF assets
- Harden **CORS** rules to restrict allowed origins
- Add **helmet** and other HTTP security headers to the NestJS app
