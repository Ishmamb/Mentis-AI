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
  createdAt: string;
};

export type StarterPlan = {
  id?: string;
  dailyFocusMinutes: number;
  dailyChallenges: number;
  blockedApp: string;
  blockedAfter: string;
  reason: string;
};

export type DailyInsight = {
  id: string;
  title: string;
  summary: string;
  body: string;
  action: string;
  source: string;
  completed: boolean;
};

export type DashboardData = {
  user: MentisUser;
  focusIndex: number;
  streak: number;
  dailyInsight: DailyInsight;
  todayPlan: { id: string; title: string; meta: string; done: boolean }[];
  weekly: { completedSessions: number; focusedMinutes: number };
  level: { name: string; level: number; nextAt: number | null; xp: number };
  activeGoal: { id: string; title: string; target: number; unit: string; progress: number } | null;
  plan: StarterPlan | null;
};

export type AppScreen = 'splash' | 'intro' | 'goals' | 'habits' | 'assessment' | 'login' | 'generating' | 'plan' | 'main';
