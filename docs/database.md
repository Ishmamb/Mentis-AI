# Mentis AI - Database Design

PostgreSQL is used because Mentis data is relational and strongly connected around the user.

## Main relationship map

```text
User
 |-- OnboardingProfile
 |-- AssessmentResult[]
 |-- StarterPlan[]
 |-- FocusSession[]
 |-- MoodEntry[]
 |-- Goal[] -- GoalLog[]
 |-- GameSession[] -- Game
 |-- DailyInsight[]
 |-- OfflineDownload[] -- OfflinePack
 |-- AudioFavorite[] -- AudioTrack
 |-- XPEvent[]
 |-- ActivityEvent[]
 |-- ChallengeParticipant[] -- Challenge
 `-- UserCollectible[] -- Collectible
```

## XP design

XP is event-based rather than only storing a mutable total.

Examples:

- FOCUS_SESSION_COMPLETED
- DAILY_MOOD_CHECKIN
- GAME_COMPLETED
- GOAL_PROGRESS
- GOAL_COMPLETED

Benefits:

- auditable
- easier leaderboard queries
- prevents unrelated modules from directly mutating one counter
- supports future category leaderboards

## Activity events

ActivityEvent is a lightweight event history used for future analytics and personalization. It is not a message queue; it is an application-level activity log stored in PostgreSQL.

## Privacy principle

Mood entries and personal goals are private product data. Community endpoints expose achievement/XP information, not raw mood journals or private reflections.
