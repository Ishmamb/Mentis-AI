# Mentis AI

> **Don't just block the distraction. Replace it with something
> better.**

Mentis AI is a digital detox and cognitive-development platform designed
to help people reduce mindless scrolling, improve focus, build healthier
habits, train cognitive skills, and replace passive screen time with
meaningful activities.

This repository contains the **Faculty Release v1** of the Mentis AI
mobile application and backend developed for our university **Mobile
Application Development (MAD)** project, with the product and system
analysis work developed alongside the **System Analysis & Design (SAD)**
course.

The project evolved from an initial React Native/Expo prototype into a
full-stack application with a real NestJS API, PostgreSQL database,
authentication, persistent user data, AI-assisted personalization,
cognitive activities, goals, mood tracking, XP, levels, collectibles,
community challenges, offline content, and focus audio.

------------------------------------------------------------------------

## Table of Contents

-   [Product Vision](#product-vision)
-   [The Problem](#the-problem)
-   [Our Approach](#our-approach)
-   [Target Users](#target-users)
-   [Core Product Loop](#core-product-loop)
-   [Key Features](#key-features)
-   [Technical Architecture](#technical-architecture)
-   [Technology Stack](#technology-stack)
-   [Repository Structure](#repository-structure)
-   [Mobile Application](#mobile-application)
-   [Backend](#backend)
-   [Database](#database)
-   [Authentication & Security](#authentication--security)
-   [AI Architecture](#ai-architecture)
-   [Gamification & Community](#gamification--community)
-   [Offline Play](#offline-play)
-   [Focus & Calm](#focus--calm)
-   [UI/UX Design](#uiux-design)
-   [Figma & Design Evolution](#figma--design-evolution)
-   [SAD / Product Development
    Process](#sad--product-development-process)
-   [Scrum & Jira](#scrum--jira)
-   [Privacy & Product Safety](#privacy--product-safety)
-   [Current Implementation vs Future
    Scope](#current-implementation-vs-future-scope)
-   [Local Setup](#local-setup)
-   [Demo Account](#demo-account)
-   [API Documentation](#api-documentation)
-   [Development Philosophy](#development-philosophy)
-   [Project Team](#project-team)
-   [Academic Context](#academic-context)
-   [License](#license)

------------------------------------------------------------------------

# Product Vision

Mentis AI is built around a simple idea:

> **Digital wellbeing should not only remove distractions. It should
> give people something better to do instead.**

Most digital-detox concepts focus primarily on blocking applications or
showing screen-time statistics. Mentis takes a broader approach.

Instead of simply telling users:

> "Stop using your phone."

Mentis tries to provide an alternative:

> "Here is a healthier, useful activity you can do right now."

That alternative can be:

-   a focused work session
-   a cognitive challenge
-   a short brain game
-   a calming audio session
-   an offline printable puzzle
-   a personal goal
-   a reflection activity
-   an AI-generated recommendation
-   a community challenge

The long-term goal is to create a product that connects **digital detox,
cognitive development, personal growth, and healthy engagement** in one
ecosystem.

------------------------------------------------------------------------

# The Problem

Young users increasingly spend large amounts of time on highly engaging
digital platforms.

The problem is not simply "screen time."

The larger problems include:

-   mindless scrolling
-   difficulty starting focused work
-   repeated checking of distracting applications
-   low awareness of personal digital habits
-   lack of meaningful alternatives
-   inconsistent personal routines
-   weak motivation to maintain healthy habits
-   lack of engaging cognitive activities
-   lack of positive feedback for improvement

A conventional app blocker can restrict an application, but it does not
necessarily solve the underlying behavioral problem.

Mentis therefore follows a **replace rather than simply remove**
philosophy.

------------------------------------------------------------------------

# Our Approach

Mentis combines five major areas:

### 1. Measure

Understand user habits through onboarding, assessment, focus history,
mood check-ins, goals, and activity data.

### 2. Restrict

Provide focus sessions and a foundation for distraction-control
functionality.

### 3. Replace

Offer cognitive games, offline printable activities, focus audio, and
personalized recommendations.

### 4. Reflect

Show progress through Focus Index, mood, goals, streaks, sessions,
achievements, and weekly summaries.

### 5. Reward

Use XP, levels, collectibles, challenges, leaderboards, and shareable
achievements to create long-term motivation.

------------------------------------------------------------------------

# Core Product Loop

``` text
MEASURE
   ↓
RESTRICT
   ↓
REPLACE
   ↓
TRAIN
   ↓
REFLECT
   ↓
REWARD
   ↓
RETURN
```

This loop is the central product concept behind Mentis.

------------------------------------------------------------------------

# Target Users

The initial target audience is primarily:

-   students
-   university students
-   young professionals
-   Gen Z users
-   people who want to reduce distracting screen habits
-   people interested in productivity and cognitive training

The initial product direction is **Bangladesh-first**, while keeping the
product architecture and UX suitable for future international expansion.

The core age range considered during product planning was approximately
**16--24**, although the system itself is not restricted to that range.

------------------------------------------------------------------------

# Key Features

## Onboarding & Personalization

The user journey starts with a lightweight onboarding process:

``` text
Splash
  ↓
Introduction
  ↓
Goals
  ↓
Habit / Screen-Time Snapshot
  ↓
Cognitive / Focus Assessment
  ↓
Result
  ↓
Account
  ↓
Personalized Plan
  ↓
Home
```

The onboarding collects information such as:

-   user goals
-   approximate screen-time habits
-   distracting applications
-   focus-related preferences

The backend stores this information and uses it to generate a starter
plan.

------------------------------------------------------------------------

## Home Dashboard

The Home screen acts as the central command center.

It brings together:

-   Focus Index
-   daily plan
-   daily insight
-   focus sessions
-   streak/progress information
-   goals
-   recent activity
-   community information

The goal is to show the user **what matters today**, rather than
overwhelming them with analytics.

------------------------------------------------------------------------

## Detox & Focus Sessions

Users can start structured focus sessions.

A session can track:

-   planned duration
-   completed duration
-   start time
-   end time
-   completion status
-   earned XP

Focus sessions are stored on the backend and contribute to progress and
gamification.

The current architecture deliberately keeps device-level blocking
separate from the core focus-session system so native Android permission
complexity cannot break the main product.

------------------------------------------------------------------------

## Cognitive Games

The product includes a small set of meaningful cognitive activities
rather than an unnecessarily large game library.

Current seeded experiences include:

-   **Pattern Lab**
-   **Sudoku Sprint**
-   **Murder Mystery**

Game sessions record:

-   game
-   score
-   duration
-   completion
-   XP earned
-   timestamp

The game layer is connected to the wider Mentis progression system.

------------------------------------------------------------------------

## Offline Play

One of Mentis's distinctive concepts is encouraging users to physically
put their phone away.

The app can provide printable:

-   mystery cases
-   Sudoku packs
-   logic puzzles
-   offline challenges

Users can download and print these resources and solve them:

-   alone
-   with friends
-   with family
-   as group activities

The system supports FREE and PREMIUM content tiers.

This creates a direct bridge between a digital wellbeing application and
offline behavior.

------------------------------------------------------------------------

## Focus & Calm

Mentis also includes a lightweight audio section for focus and
relaxation-oriented listening.

Example categories include:

-   Rain
-   Deep Focus
-   Brown Noise
-   Calm Evening

Users can browse tracks, play audio, and save favorites.

The feature is intentionally presented as a wellness/productivity tool
rather than making medical or therapeutic claims.

------------------------------------------------------------------------

## Daily Mentis AI Insight

Mentis uses AI in a controlled way rather than putting an AI chatbot
everywhere.

The daily insight can consider high-level signals such as:

-   user goals
-   Focus Index
-   recent focus sessions
-   recent mood check-ins
-   selected distractions

It then generates a concise recommendation.

Example:

> Protect one small focus block today before opening your main
> distraction.

The generated insight is stored so the same request does not repeatedly
call the AI provider.

There is also a rule-based fallback when an external AI provider is
unavailable.

------------------------------------------------------------------------

## AI Weekly Reflection

Mentis can summarize the user's recent activity using:

-   completed focus sessions
-   focused minutes
-   XP
-   recent mood data

The result is a short reflection with:

-   a positive observation
-   a practical next step

The system is explicitly non-clinical.

------------------------------------------------------------------------

## Personal Goals

Users can create personal goals such as:

-   reading books
-   study targets
-   walking
-   sleep routines
-   prayer goals
-   reducing screen time
-   custom personal targets

Goals contain:

-   title
-   category
-   target
-   unit
-   frequency
-   deadline
-   status
-   progress logs

Goals are optional. Users who do not use them should not be overwhelmed
with irrelevant goal analytics.

------------------------------------------------------------------------

## Mood & Self-Reflection

Mentis includes a simple daily self-reflection model.

Users can record:

-   mood
-   focus
-   energy
-   stress
-   optional note

The system can then show trends and contextual observations.

These records are treated as **private personal data**.

Mentis does not use these values to diagnose mental-health conditions.

------------------------------------------------------------------------

## Community

Mentis is designed around an achievement-based community rather than a
traditional social-media feed.

Community features include:

-   leaderboards
-   top 3 / top 10 rankings
-   challenges
-   XP
-   levels
-   collectibles
-   achievements
-   rewards

The intended experience is competition around positive activities such
as:

-   focus consistency
-   cognitive games
-   offline challenges
-   streaks
-   community events

Private mood journals and personal reflections are not exposed as public
community data.

------------------------------------------------------------------------

## Levels

The current product model uses four broad progression levels:

``` text
Starter
   ↓
Focused
   ↓
Disciplined
   ↓
Ascendant
```

The level system is based on activity and XP rather than intelligence or
clinical measurements.

------------------------------------------------------------------------

## XP & Rewards

Mentis uses an **event-based XP system**.

Instead of allowing every module to directly modify one global XP
counter, meaningful actions generate XP events.

Examples:

``` text
FOCUS_SESSION_COMPLETED
DAILY_MOOD_CHECKIN
GAME_COMPLETED
GOAL_PROGRESS
GOAL_COMPLETED
```

This makes XP:

-   auditable
-   easier to analyze
-   easier to use for leaderboards
-   easier to extend
-   less prone to inconsistent updates

------------------------------------------------------------------------

## Collectibles

Users can unlock collectible rewards such as:

-   profile frames
-   badges
-   titles
-   themes
-   special content unlocks

The long-term product vision is to make progression feel personal and
rewarding without turning Mentis into a purely gamified application.

------------------------------------------------------------------------

## Community Challenges

Challenges connect individual activities to community progression.

Examples:

### Weekend Reset

Complete three focus sessions before the challenge ends.

### Offline Hour

Download an offline pack and spend an hour away from the feed.

Challenges track:

-   participation
-   progress
-   completion
-   XP rewards
-   start/end dates

------------------------------------------------------------------------

## Shareable Achievements

Mentis is designed to support visually attractive social sharing.

Possible share cards include:

-   focus streak
-   reclaimed time
-   level-up
-   game achievement
-   goal milestone
-   challenge completion

The goal is to create the same kind of lightweight social motivation
found in products that allow users to share achievements without turning
the app into a social feed.

------------------------------------------------------------------------

# Technical Architecture

Mentis uses a **modular monolith** architecture.

This is intentional.

For a university project, building microservices, Kafka pipelines,
distributed transactions, and unnecessary infrastructure would increase
complexity without providing meaningful product value.

``` text
                    ┌─────────────────────┐
                    │ React Native / Expo │
                    │      Mobile App     │
                    └──────────┬──────────┘
                               │
                         REST + JWT
                               │
                               ▼
                    ┌─────────────────────┐
                    │     NestJS API      │
                    │                     │
                    │ Auth                │
                    │ Onboarding          │
                    │ Assessment          │
                    │ Dashboard           │
                    │ Focus               │
                    │ Wellness            │
                    │ Content             │
                    │ Community           │
                    │ AI                  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     PostgreSQL      │
                    └─────────────────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
          AI Provider                    Static Assets
        (optional/live)                 Audio + PDFs
```

### Architectural principles

-   one backend deployment
-   clear domain boundaries
-   centralized authentication
-   centralized AI policy
-   relational persistence
-   reusable frontend components
-   server-side business logic
-   graceful fallback behavior
-   no unnecessary distributed infrastructure

------------------------------------------------------------------------

# Technology Stack

## Frontend

-   React Native
-   TypeScript
-   Expo 57
-   React Native 0.86
-   React 19
-   AsyncStorage
-   Expo Haptics
-   Expo Status Bar

## Backend

-   NestJS 11
-   TypeScript
-   REST API
-   JWT authentication
-   class-validator
-   Swagger/OpenAPI

## Database

-   PostgreSQL
-   Prisma ORM 6

## Development

-   Node.js
-   npm workspaces
-   Docker Compose
-   Git / GitHub
-   VS Code

## AI

-   Server-side AI integration
-   Optional OpenAI Responses API
-   Rule-based fallback when an external provider is unavailable

------------------------------------------------------------------------

# Repository Structure

``` text
mentis-ai-faculty-release/
│
├── apps/
│   ├── mobile/
│   │   ├── assets/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── screens/
│   │   │   ├── services/
│   │   │   ├── storage/
│   │   │   ├── theme/
│   │   │   └── types/
│   │   ├── App.tsx
│   │   └── package.json
│   │
│   └── api/
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── seed.ts
│       ├── public/
│       │   ├── audio/
│       │   └── packs/
│       ├── src/
│       │   ├── ai/
│       │   ├── auth/
│       │   ├── community/
│       │   ├── content/
│       │   ├── dashboard/
│       │   ├── focus/
│       │   ├── onboarding/
│       │   ├── prisma/
│       │   └── wellness/
│       └── package.json
│
├── docs/
│   ├── architecture.md
│   └── database.md
│
├── docker-compose.yml
├── package.json
├── SETUP_DEMO.bat
├── START_BACKEND.bat
├── START_MOBILE.bat
└── README.md
```

------------------------------------------------------------------------

# Mobile Application

The mobile application started as an Expo/React Native prototype and was
progressively rebuilt into a backend-connected application.

## Primary navigation

``` text
Home
Detox
Train
Progress
Profile
```

The visual language was developed around:

-   soft off-white backgrounds
-   white surfaces
-   deep navy text
-   indigo primary actions
-   rounded cards
-   restrained shadows
-   clear typography
-   generous spacing
-   minimal visual noise

The goal was to keep the interface calm and premium rather than looking
like a generic AI-generated dashboard.

------------------------------------------------------------------------

# Backend

The NestJS application is divided into domain-oriented modules.

``` text
src/
├── ai/
├── auth/
├── community/
├── content/
├── dashboard/
├── focus/
├── onboarding/
├── prisma/
└── wellness/
```

### Authentication

Provides:

-   registration
-   login
-   JWT access tokens
-   refresh tokens
-   logout
-   protected API routes

Passwords are stored as hashes rather than plaintext.

------------------------------------------------------------------------

# Database

PostgreSQL was selected because Mentis contains strongly related data
around users and activity.

The main relationship model is:

``` text
User
 ├── OnboardingProfile
 ├── AssessmentResult[]
 ├── StarterPlan[]
 ├── FocusSession[]
 ├── MoodEntry[]
 ├── Goal[]
 │    └── GoalLog[]
 ├── GameSession[]
 ├── DailyInsight[]
 ├── OfflineDownload[]
 ├── AudioFavorite[]
 ├── XPEvent[]
 ├── ActivityEvent[]
 ├── ChallengeParticipant[]
 └── UserCollectible[]
```

Major database domains include:

  Domain           Main data
  ---------------- ------------------------------------
  Authentication   users, refresh tokens
  Onboarding       habits, goals, screen-time profile
  Assessment       focus result, assessment history
  Focus            focus sessions
  Wellness         mood entries, goals
  Games            games, game sessions
  AI               daily insights
  Offline          printable packs, downloads
  Audio            tracks, favorites
  Community        challenges, participation
  Rewards          XP, collectibles
  Analytics        activity events

------------------------------------------------------------------------

# Authentication & Security

Security principles include:

-   password hashing
-   JWT-based authorization
-   refresh-token persistence
-   protected backend routes
-   DTO validation
-   whitelist validation
-   server-side AI API keys
-   no AI credentials in the mobile application
-   separation of private wellness data from community data

The mobile client never directly calls the external AI provider.

The NestJS backend acts as the policy boundary.

------------------------------------------------------------------------

# AI Architecture

AI is intentionally **controlled and useful**.

The architecture is:

``` text
React Native
      │
      ▼
NestJS AI Module
      │
      ├── user context
      ├── activity context
      ├── safety rules
      └── prompt construction
             │
             ▼
       AI Provider
             │
             ▼
        AI response
```

If the provider is unavailable:

``` text
AI request
    │
    ├── success → AI response
    │
    └── failure → deterministic fallback
```

This ensures the application does not stop working because of:

-   API outage
-   missing API key
-   network failure
-   provider failure

AI is used for personalization rather than replacing the entire product.

------------------------------------------------------------------------

# Gamification & Community

Mentis uses a progression model based on meaningful activity.

``` text
Activity
   ↓
XP Event
   ↓
XP / Level
   ↓
Achievement
   ↓
Collectible
   ↓
Community Rank
   ↓
Shareable Achievement
```

This connects different parts of the application.

For example:

``` text
Complete Focus Session
        ↓
       XP
        ↓
       Level
        ↓
Leaderboard Position
        ↓
Collectible Unlock
```

The same architecture can later support more activity categories without
rewriting the reward system.

------------------------------------------------------------------------

# Offline Play

Offline Play is intentionally different from normal digital content.

The user can download a printable PDF, leave their phone, and continue
the activity physically.

This supports the central Mentis philosophy:

> The goal is not to make users spend more time inside Mentis. The goal
> is to help them spend their time better.

------------------------------------------------------------------------

# Focus & Calm

The audio feature provides lightweight focus/calming content.

The current release includes bundled development assets so the feature
can be demonstrated without relying on an external streaming provider.

Available examples include:

-   Rain by the Window
-   Deep Focus
-   Soft Brown Noise
-   Calm Evening

------------------------------------------------------------------------

# UI/UX Design

The original Mentis UI was developed through multiple iterations.

The design direction was intentionally moved away from:

-   excessive gradients
-   neon AI aesthetics
-   generic SaaS dashboards
-   overloaded cards
-   unnecessary analytics
-   decorative UI without purpose

The preferred direction is:

-   calm
-   premium
-   minimal
-   human
-   youthful
-   functional
-   consistent

### Design principles

1.  **Hierarchy over decoration**
2.  **Meaningful data over data density**
3.  **Whitespace over clutter**
4.  **Consistency over novelty**
5.  **AI as a useful layer, not a visual gimmick**
6.  **Gamification without childishness**
7.  **Privacy by default**

------------------------------------------------------------------------

# Figma & Design Evolution

Figma was used as the main UI/UX design and system-analysis workspace.

The project contains:

-   mobile application designs
-   web application concepts
-   administrative portal concepts
-   game flows
-   onboarding
-   detox
-   progress
-   profile
-   settings
-   community concepts
-   offline content
-   audio/focus concepts

The existing mobile Figma design was used as the visual reference for
the final React Native implementation.

The project deliberately moved away from blindly accepting AI-generated
UI.

AI-generated design tools were useful for exploration, but the final
direction was controlled by:

-   existing Mentis visual language
-   product requirements
-   usability
-   consistency
-   faculty feedback
-   actual technical feasibility

------------------------------------------------------------------------

# SAD / Product Development Process

Mentis was not developed as only a coding project.

The product was analyzed through the System Analysis & Design process.

Major areas included:

### Project Discovery

-   problem identification
-   product idea
-   value proposition
-   target-user definition

### Benchmark Analysis

Competitor and benchmark analysis was used to understand:

-   digital wellbeing products
-   focus tools
-   cognitive games
-   productivity applications
-   gamification patterns

### Feasibility Analysis

The team considered:

-   technical feasibility
-   operational feasibility
-   economic considerations
-   user adoption
-   Android-specific restrictions
-   AI/API dependency
-   team capacity

### Requirements Analysis

Requirements were divided into:

-   functional requirements
-   non-functional requirements
-   user flows
-   system behavior
-   privacy requirements

### System Analysis

The project included work around:

-   use cases
-   activity flows
-   swimlanes
-   data flow concepts
-   system architecture
-   database design

### UI/UX

Figma was used for:

-   information architecture
-   screen design
-   components
-   user flows
-   major prototype
-   minor/admin prototype

------------------------------------------------------------------------

# Scrum & Jira

The project was organized around Scrum concepts and managed in Jira.

The backlog included:

-   discovery
-   benchmark analysis
-   survey
-   feasibility
-   requirements
-   DFD/use cases
-   SRS
-   UX architecture
-   major prototype
-   minor/admin prototype
-   testing
-   project management

The Jira workflow used:

``` text
To Do
  ↓
In Progress
  ↓
In Review
  ↓
Done
```

The team also organized work around milestone-based sprints.

Important project-management principles included:

-   issue ownership
-   story points
-   acceptance criteria
-   sprint goals
-   sprint reviews
-   retrospective thinking
-   risk/dependency tracking
-   faculty feedback/change tracking

Historical work was represented in Jira as completed backlog work rather
than pretending Jira had been used from the first day of the project.

------------------------------------------------------------------------

# Major Prototype vs Minor Prototype

The project distinguishes between two major areas.

## Major Prototype

The main user-facing Mentis application:

-   onboarding
-   assessment
-   personalization
-   Home
-   Detox
-   Focus
-   Train
-   Progress
-   Profile
-   Goals
-   Mood
-   AI personalization
-   community

## Minor Prototype

Secondary/administrative workflows:

-   admin login
-   dashboard
-   users
-   content management
-   reports
-   support
-   community management
-   settings

The web/admin designs are part of the broader product system and SAD
work, while this Faculty Release focuses primarily on the functioning
mobile application and API.

------------------------------------------------------------------------

# Privacy & Product Safety

Mentis is a productivity/digital-wellbeing product, not a medical
diagnostic system.

Therefore:

-   mood is self-reported
-   Focus Index is a product metric
-   cognitive scores are gamified/product-oriented
-   no medical diagnosis is made
-   no medical claims should be inferred from the app
-   personal goals are private
-   mood entries are private
-   community features expose achievement information rather than
    private reflections

Any future expansion into health-related claims would require a
substantially different safety and validation process.

------------------------------------------------------------------------

# Current Implementation vs Future Scope

This distinction is important.

## Implemented in Faculty Release v1

-   React Native + Expo mobile application
-   NestJS backend
-   PostgreSQL
-   Prisma ORM
-   registration/login
-   JWT authentication
-   refresh tokens
-   persistent onboarding
-   assessment persistence
-   starter-plan generation
-   dashboard API
-   focus session persistence
-   daily insight generation
-   AI/fallback architecture
-   mood tracking
-   personal goals
-   goal progress
-   cognitive game catalog
-   game session persistence
-   XP events
-   levels
-   leaderboard
-   collectibles
-   community challenges
-   offline printable PDF content
-   focus/calming audio
-   audio favorites
-   Swagger API documentation
-   PostgreSQL seed data
-   faculty demo account
-   Docker PostgreSQL setup

## Planned / Future Engineering

### Android OS-level App Blocking

True system-level app blocking requires Android-specific permissions and
native functionality.

The core focus-session architecture is intentionally independent of this
feature so the application remains reliable.

### Google OAuth

The backend is designed so social authentication can be added without
replacing the core authentication architecture.

### Push Notification Infrastructure

The product design includes:

-   daily insights
-   focus reminders
-   streak notifications
-   challenge notifications
-   weekly summaries

The current release focuses on the core product/backend foundation.

### Advanced AI Coach

The current AI layer is intentionally controlled.

Future versions can expand into:

-   contextual coaching
-   richer recommendations
-   adaptive plans
-   better weekly reflections
-   activity-aware coaching

### Web Application

The broader product design includes a web experience consistent with the
mobile application.

The web direction includes:

-   user dashboard
-   Detox
-   Train
-   Progress
-   Community
-   Profile

### Admin Portal

The planned operational web layer includes:

-   user management
-   content management
-   game management
-   offline pack management
-   audio management
-   community management
-   reports
-   support tickets
-   settings

The administrative experience is intentionally designed as operational
software rather than a decorative dashboard.

------------------------------------------------------------------------

# Local Setup

## Requirements

Install:

-   Node.js 22+
-   npm
-   Docker Desktop
-   Android Studio / Android emulator, or Expo Go for compatible
    development

------------------------------------------------------------------------

## 1. Start PostgreSQL

From the project root:

``` bash
docker compose up -d
```

------------------------------------------------------------------------

## 2. Install dependencies

``` bash
npm install
```

------------------------------------------------------------------------

## 3. Generate Prisma Client

``` bash
npm run db:generate
```

------------------------------------------------------------------------

## 4. Create/update the database

For development:

``` bash
npm run db:push
```

or use Prisma migrations when working with migration history:

``` bash
npm run db:migrate
```

------------------------------------------------------------------------

## 5. Seed the demo database

``` bash
npm run db:seed
```

The seed creates:

-   demo users
-   onboarding data
-   assessment history
-   focus history
-   mood history
-   goals
-   game catalog
-   game history
-   offline packs
-   audio tracks
-   XP events
-   challenges
-   collectibles
-   daily insight

------------------------------------------------------------------------

## 6. Start the backend

``` bash
npm run dev:api
```

Backend:

``` text
http://localhost:4000/api
```

Swagger:

``` text
http://localhost:4000/api/docs
```

------------------------------------------------------------------------

## 7. Start the mobile application

``` bash
npm run dev:mobile
```

Or use:

``` text
START_MOBILE.bat
```

For Android Emulator, `10.0.2.2` can be used to access the host machine.

For a physical device, set:

``` env
EXPO_PUBLIC_API_URL=http://YOUR-PC-LAN-IP:4000/api
```

Example:

``` env
EXPO_PUBLIC_API_URL=http://192.168.0.105:4000/api
```

Your computer and phone must be on the same network.

------------------------------------------------------------------------

# Demo Account

A seeded demo account is included for faculty presentation.

``` text
Email:    demo@mentis.app
Password: Mentis123!
```

The account contains sample activity so the application does not open as
an empty system.

It includes:

-   onboarding information
-   assessment result
-   focus history
-   mood history
-   goal progress
-   game activity
-   XP history
-   collectibles
-   challenge participation
-   daily insight

------------------------------------------------------------------------

# API Documentation

Once the backend is running:

``` text
http://localhost:4000/api/docs
```

Swagger provides an interactive view of the REST API.

The API is organized around domains including:

``` text
/auth
/onboarding
/dashboard
/focus
/wellness
/content
/community
/ai
```

------------------------------------------------------------------------

# Development Philosophy

Mentis follows several engineering principles.

## Build the core before the edge

A reliable login, database, focus session, and progress system is more
valuable than ten unfinished integrations.

## Keep AI behind the backend

API credentials and policy logic must never be placed in the mobile
client.

## Prefer a modular monolith for this scale

Clear modules give us most of the organizational benefits of
service-oriented architecture without the operational cost of
microservices.

## Make the demo resilient

External AI services should improve the experience, not determine
whether the application works.

## Use real persistence

Important product actions should survive application restarts and be
represented in PostgreSQL.

## Avoid meaningless complexity

Mentis intentionally does not require:

-   Kafka
-   Kubernetes
-   Redis for every operation
-   microservices
-   real-time infrastructure everywhere
-   custom game engines

The architecture should serve the product, not the other way around.

------------------------------------------------------------------------

# Project Team

Mentis AI was developed as a team project.

  -----------------------------------------------------------------------
  Member                              Responsibility areas
  ----------------------------------- -----------------------------------
  **Ishmamul Hoque Bhuiyan**          Product direction, architecture,
                                      mobile development, integration,
                                      project management

  **Tanvir Rahaman Pranto**           Requirements, UX/product work,
                                      Detox and supporting workflows

  **Nabila Binte Alam**               UI/UX, design system, onboarding
                                      and product interface work

  **Nayeem**                          System analysis,
                                      dashboard/supporting workflows,
                                      research and testing

  **GM Akif Qaium**                   SRS, assessment/game/content
                                      workflows, system analysis
  -----------------------------------------------------------------------

Responsibilities evolved across milestones and were tracked through the
project's Scrum/Jira workflow.

------------------------------------------------------------------------

# Academic Context

Mentis AI was developed as part of the team's university coursework,
particularly:

-   **Mobile Application Development (MAD)**
-   **System Analysis & Design (SAD)**

The project combines:

``` text
Product Research
      +
System Analysis
      +
UI/UX Design
      +
Mobile Development
      +
Backend Engineering
      +
Database Design
      +
AI Integration
      +
Software Project Management
```

The objective is not only to demonstrate a mobile interface, but to
demonstrate how a product moves from:

``` text
Problem
  ↓
Research
  ↓
Requirements
  ↓
Feasibility
  ↓
System Design
  ↓
UI/UX
  ↓
Prototype
  ↓
Implementation
  ↓
Backend
  ↓
Database
  ↓
Testing
  ↓
Demonstration
```

------------------------------------------------------------------------

# Final Product Philosophy

Mentis is ultimately built around one principle:

> **A digital detox product should not simply take something away. It
> should help the user build something better in its place.**

Whether that replacement is:

-   20 minutes of focused work
-   a puzzle
-   a game
-   a printed mystery
-   a personal goal
-   a calming audio session
-   a community challenge
-   or a better daily habit

the purpose remains the same:

**help people take their attention back.**

------------------------------------------------------------------------

# License

This project was developed as an academic university project.

Unless explicitly stated otherwise, the source code and original project
materials are intended for educational/project use.

Third-party libraries and assets remain subject to their respective
licenses.
