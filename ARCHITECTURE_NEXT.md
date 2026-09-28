# Mentis AI — Development Architecture

## Current Update (Expo Go)
React Native + TypeScript
- UI / interactions
- onboarding
- cognitive baseline
- local draft persistence
- demo Google sign-in
- starter-plan generation service boundary
- dashboard / Detox / Train / Progress / Profile

## Sprint 1 — Foundation
Mobile:
- React Native + TypeScript
- reusable components
- onboarding
- Google OAuth

Backend:
- NestJS
- AuthModule
- UsersModule
- OnboardingModule
- PlansModule

Database:
- PostgreSQL
- TypeORM

API examples:
- POST /auth/google
- GET /users/me
- PUT /users/me/onboarding
- POST /plans/generate
- GET /plans/current

## Sprint 2 — Core Detox Loop
- Android Usage Access permission
- installed-app selection
- app restriction / shield
- focus sessions
- two complete brain games
- session logs
- streaks

Backend modules:
- DetoxModule
- GamesModule
- ProgressModule

## Sprint 3 — Intelligence + Analytics
- AI Focus Coach
- adaptive game difficulty
- weekly analytics
- achievements
- notifications
- polish / QA / APK

## Data model direction
User
OnboardingProfile
DetoxGoal
BlockedAppRule
FocusSession
Game
GameSession
Achievement
ProgressSnapshot
