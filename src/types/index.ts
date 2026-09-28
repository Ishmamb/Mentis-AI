export type Goal = 'Study better' | 'Reduce scrolling' | 'Improve focus' | 'Sleep better';

export type ScreenTime = '< 2h' | '2–4h' | '4–6h' | '6h+';

export type DraftProfile = {
  goals: Goal[];
  screenTime: ScreenTime | null;
  apps: string[];
  assessmentCorrect: number;
  focusIndex: number | null;
  cognitiveAge: number | null;
};

export type MentisUser = {
  id: string;
  email: string;
  displayName: string;
  username: string;
  draft: DraftProfile;
  createdAt: string;
};

export type StarterPlan = {
  dailyFocusMinutes: number;
  dailyChallenges: number;
  blockedApp: string;
  blockedAfter: string;
  reason: string;
};

export type AppScreen =
  | 'splash'
  | 'intro'
  | 'goals'
  | 'habits'
  | 'assessment'
  | 'login'
  | 'generating'
  | 'plan'
  | 'main';
