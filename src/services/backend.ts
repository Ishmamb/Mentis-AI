import { api, clearTokens, saveTokens } from './api';
import { DashboardData, DraftProfile, MentisUser, StarterPlan } from '../types';

type AuthResponse = { user: MentisUser; accessToken: string; refreshToken: string };

const FALLBACK_USER: MentisUser = {
  id: 'demo-faculty-id',
  email: 'demo@mentis.app',
  displayName: 'Mentis Demo',
  username: 'steady_focus248',
  createdAt: new Date().toISOString(),
};

const FALLBACK_PLAN: StarterPlan = {
  dailyFocusMinutes: 10,
  dailyChallenges: 2,
  blockedApp: 'Instagram',
  blockedAfter: '10:00 PM',
  reason: 'Start small: protect one high-friction moment, then build consistency.',
};

export async function register(email: string, displayName: string, password: string) {
  try {
    const data = await api<AuthResponse>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify({ email, displayName, password }) },
      false,
      3000
    );
    await saveTokens(data.accessToken, data.refreshToken);
    return data.user;
  } catch {
    // Instant fallback when backend is offline
    const user: MentisUser = {
      id: `local-${Date.now()}`,
      email,
      displayName: displayName || 'Mentis Student',
      username: (displayName || 'student').toLowerCase().replace(/\s+/g, '_'),
      createdAt: new Date().toISOString(),
    };
    await saveTokens('local-access', 'local-refresh');
    return user;
  }
}

export async function login(email: string, password: string) {
  try {
    const data = await api<AuthResponse>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) },
      false,
      3000
    );
    await saveTokens(data.accessToken, data.refreshToken);
    return data.user;
  } catch {
    // Instant fallback
    await saveTokens('demo-access', 'demo-refresh');
    return FALLBACK_USER;
  }
}

export async function logout() {
  await clearTokens();
}

export const me = async (): Promise<MentisUser> => {
  try {
    return await api<MentisUser>('/auth/me', {}, true, 2000);
  } catch {
    return FALLBACK_USER;
  }
};

export const getOnboarding = async () => {
  try {
    return await api<{ plan: StarterPlan | null; profile: unknown; assessment: unknown }>('/onboarding', {}, true, 2000);
  } catch {
    return { plan: FALLBACK_PLAN, profile: null, assessment: null };
  }
};

export async function completeOnboarding(draft: DraftProfile) {
  try {
    return await api<{ focusIndex: number; plan: StarterPlan }>('/onboarding', {
      method: 'POST',
      body: JSON.stringify({
        goals: draft.goals,
        screenTime: draft.screenTime,
        apps: draft.apps,
        assessmentCorrect: draft.assessmentCorrect,
        focusIndex: draft.focusIndex,
        cognitiveAge: draft.cognitiveAge,
      }),
    }, true, 3000);
  } catch {
    return {
      focusIndex: draft.focusIndex || 78,
      plan: {
        dailyFocusMinutes: 10,
        dailyChallenges: 2,
        blockedApp: draft.apps[0] || 'Instagram',
        blockedAfter: '10:00 PM',
        reason: 'Start small: protect high-friction moments and build consistency.',
      },
    };
  }
}

export const getDashboard = async (): Promise<DashboardData> => {
  try {
    return await api<DashboardData>('/dashboard', {}, true, 2500);
  } catch {
    return {
      user: FALLBACK_USER,
      focusIndex: 78,
      streak: 6,
      dailyInsight: {
        id: 'insight-1',
        title: 'Protect one small block today',
        summary: 'Your recent sessions are consistent. Try one short focus block before opening Instagram tonight.',
        body: 'Consistency is doing more for you than longer sessions.',
        action: 'Start a focus session',
        source: 'FALLBACK',
        completed: false,
      },
      todayPlan: [
        { id: '1', title: '10 min single-task focus', meta: 'Shield Instagram', done: false },
        { id: '2', title: 'Play 1 chess or sudoku game', meta: 'Tactical mental reset', done: false },
      ],
      weekly: { completedSessions: 6, focusedMinutes: 85 },
      level: { name: 'Disciplined', level: 3, nextAt: 600, xp: 420 },
      activeGoal: { id: 'g1', title: 'Read 30 books', target: 30, unit: 'books', progress: 12 },
      plan: FALLBACK_PLAN,
    };
  }
};

export const startFocus = async (plannedMinutes: number) => {
  try {
    return await api<any>('/focus/sessions', { method: 'POST', body: JSON.stringify({ plannedMinutes }) }, true, 2500);
  } catch {
    return { id: `local-session-${Date.now()}`, plannedMinutes, status: 'ACTIVE', startedAt: new Date().toISOString() };
  }
};

export const finishFocus = async (id: string, completedMinutes: number, status: 'COMPLETED' | 'ABANDONED' = 'COMPLETED') => {
  try {
    return await api<any>(`/focus/sessions/${id}`, { method: 'PATCH', body: JSON.stringify({ completedMinutes, status }) }, true, 2500);
  } catch {
    return { id, completedMinutes, status };
  }
};

export const focusHistory = async () => {
  try {
    return await api<any[]>('/focus/history', {}, true, 2500);
  } catch {
    const today = Date.now();
    return [
      { id: '1', status: 'COMPLETED', plannedMinutes: 15, completedMinutes: 15, startedAt: new Date(today - 86400000).toISOString() },
      { id: '2', status: 'COMPLETED', plannedMinutes: 10, completedMinutes: 10, startedAt: new Date(today - 172800000).toISOString() },
      { id: '3', status: 'COMPLETED', plannedMinutes: 20, completedMinutes: 20, startedAt: new Date(today - 259200000).toISOString() },
    ];
  }
};

export const dailyInsight = () => api<any>('/ai/daily-insight', {}, true, 2500).catch(() => ({}));
export const weeklyReflection = async () => {
  try {
    return await api<{ text: string; source: string }>('/ai/weekly-reflection', {}, true, 2500);
  } catch {
    return { text: 'You showed steady consistency this week with 6 completed resets.', source: 'FALLBACK' };
  }
};

export const addMood = async (mood: number, focus?: number, energy?: number, stress?: number) => {
  try {
    return await api<any>('/wellness/mood', { method: 'POST', body: JSON.stringify({ mood, focus, energy, stress }) }, true, 2500);
  } catch {
    return { id: `m-${Date.now()}`, mood };
  }
};

export const moodHistory = async () => {
  try {
    return await api<any[]>('/wellness/mood', {}, true, 2500);
  } catch {
    return [
      { id: '1', mood: 4, createdAt: new Date().toISOString() },
      { id: '2', mood: 5, createdAt: new Date(Date.now() - 86400000).toISOString() },
      { id: '3', mood: 3, createdAt: new Date(Date.now() - 172800000).toISOString() },
      { id: '4', mood: 4, createdAt: new Date(Date.now() - 259200000).toISOString() },
      { id: '5', mood: 5, createdAt: new Date(Date.now() - 345600000).toISOString() },
    ];
  }
};

export const goals = async () => {
  try {
    return await api<any[]>('/wellness/goals', {}, true, 2500);
  } catch {
    return [{ id: 'g1', title: 'Read 30 books', target: 30, logs: [{ value: 12 }] }];
  }
};

export const createGoal = (body: { title: string; category: string; target: number; unit: string; frequency?: string }) =>
  api<any>('/wellness/goals', { method: 'POST', body: JSON.stringify(body) }, true, 2500).catch(() => ({ id: 'new', ...body }));

export const logGoal = (id: string, value: number) =>
  api<any>(`/wellness/goals/${id}/log`, { method: 'POST', body: JSON.stringify({ value }) }, true, 2500).catch(() => ({ id, value }));

export const games = async () => {
  try {
    return await api<any[]>('/content/games', {}, true, 2500);
  } catch {
    return [
      { id: 'g-pattern', slug: 'pattern-lab', title: 'Pattern Lab', difficulty: 'Easy', estimatedMinutes: 2, xpReward: 20 },
      { id: 'g-sudoku', slug: 'sudoku-sprint', title: 'Sudoku Sprint', difficulty: 'Medium', estimatedMinutes: 5, xpReward: 30 },
      { id: 'g-mystery', slug: 'mystery-case', title: 'Murder Mystery', difficulty: 'Medium', estimatedMinutes: 7, xpReward: 35 },
      { id: 'g-chess', slug: 'mentis-chess', title: 'Mindful Chess', difficulty: 'Medium', estimatedMinutes: 10, xpReward: 50 },
    ];
  }
};

export const completeGame = async (id: string, score: number, durationSec: number) => {
  try {
    return await api<any>(`/content/games/${id}/complete`, { method: 'POST', body: JSON.stringify({ score, durationSec }) }, true, 2500);
  } catch {
    return { id, score, durationSec, xpEarned: 30 };
  }
};

export const offlinePacks = async () => {
  try {
    return await api<any[]>('/content/offline-packs', {}, true, 2500);
  } catch {
    return [
      { id: 'p1', slug: 'mystery-case-01', title: 'Mystery Case #01', difficulty: 'Easy', playersMin: 1, playersMax: 4, pageCount: 6, tier: 'FREE', pdfUrl: '/assets/packs/mystery-case-01.pdf' },
      { id: 'p2', slug: 'sudoku-weekend', title: 'Sudoku Weekend Pack', difficulty: 'Medium', playersMin: 1, playersMax: 1, pageCount: 8, tier: 'FREE', pdfUrl: '/assets/packs/sudoku-weekend.pdf' },
      { id: 'p3', slug: 'logic-reset', title: 'Logic Reset Pack', difficulty: 'Easy', playersMin: 1, playersMax: 2, pageCount: 5, tier: 'FREE', pdfUrl: '/assets/packs/logic-reset.pdf' },
      { id: 'p4', slug: 'detective-night', title: 'Detective Night', difficulty: 'Hard', playersMin: 2, playersMax: 6, pageCount: 14, tier: 'PREMIUM', pdfUrl: '/assets/packs/detective-night.pdf' },
    ];
  }
};

export const downloadPack = (id: string) =>
  api<{ pdfUrl: string }>(`/content/offline-packs/${id}/download`, { method: 'POST' }, true, 2500).catch(() => ({ pdfUrl: '/assets/packs/mystery-case-01.pdf' }));

export const audioTracks = async () => {
  try {
    return await api<any[]>('/content/audio', {}, true, 2500);
  } catch {
    return [
      { id: 'a1', title: 'Rain by the Window', category: 'Rain', audioUrl: '/assets/audio/rain-focus.wav' },
      { id: 'a2', title: 'Deep Focus', category: 'Focus', audioUrl: '/assets/audio/deep-focus.wav' },
      { id: 'a3', title: 'Soft Brown Noise', category: 'Brown Noise', audioUrl: '/assets/audio/brown-noise.wav' },
      { id: 'a4', title: 'Calm Evening', category: 'Calm', audioUrl: '/assets/audio/calm-evening.wav' },
    ];
  }
};

export const leaderboard = async () => {
  try {
    return await api<any[]>('/community/leaderboard', {}, true, 2500);
  } catch {
    return [
      { rank: 1, displayName: 'Nabila Alam', username: 'clear_mind415', points: 510 },
      { rank: 2, displayName: 'Mentis Demo', username: 'steady_focus248', points: 420 },
      { rank: 3, displayName: 'Tanvir Pranto', username: 'deep_focus316', points: 360 },
      { rank: 4, displayName: 'Akif Qaium', username: 'quiet_orbit722', points: 290 },
    ];
  }
};

export const challenges = async () => {
  try {
    return await api<any[]>('/community/challenges', {}, true, 2500);
  } catch {
    return [
      { id: 'c1', title: 'Weekend Reset', description: 'Complete three focus sessions before the challenge ends.', xpReward: 60 },
      { id: 'c2', title: 'Offline Hour', description: 'Download an offline pack and spend one hour away from your feed.', xpReward: 40 },
    ];
  }
};

export const joinChallenge = (id: string) =>
  api<any>(`/community/challenges/${id}/join`, { method: 'POST' }, true, 2500).catch(() => ({ id }));

export const rewards = async () => {
  try {
    return await api<any>('/community/rewards', {}, true, 2500);
  } catch {
    return {
      xp: 420,
      level: 'Disciplined',
      unlocked: [
        { id: '1', collectible: { title: 'First Reset', rarity: 'Common' } },
        { id: '2', collectible: { title: 'Deep Worker', rarity: 'Uncommon' } },
      ],
    };
  }
};
