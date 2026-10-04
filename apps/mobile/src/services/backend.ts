import { api, clearTokens, saveTokens } from './api';
import { DashboardData, DraftProfile, MentisUser, StarterPlan } from '../types';

type AuthResponse = { user: MentisUser; accessToken: string; refreshToken: string };

export async function register(email: string, displayName: string, password: string) {
  const data = await api<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify({ email, displayName, password }) }, false);
  await saveTokens(data.accessToken, data.refreshToken);
  return data.user;
}

export async function login(email: string, password: string) {
  const data = await api<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }, false);
  await saveTokens(data.accessToken, data.refreshToken);
  return data.user;
}

export async function logout() { await clearTokens(); }
export const me = () => api<MentisUser>('/auth/me');
export const getDashboard = () => api<DashboardData>('/dashboard');
export const getOnboarding = () => api<{ plan: StarterPlan | null; profile: unknown; assessment: unknown }>('/onboarding');

export async function completeOnboarding(draft: DraftProfile) {
  return api<{ focusIndex: number; plan: StarterPlan }>('/onboarding', {
    method: 'POST',
    body: JSON.stringify({
      goals: draft.goals,
      screenTime: draft.screenTime,
      apps: draft.apps,
      assessmentCorrect: draft.assessmentCorrect,
      focusIndex: draft.focusIndex,
      cognitiveAge: draft.cognitiveAge,
    }),
  });
}

export const startFocus = (plannedMinutes: number) => api<any>('/focus/sessions', { method: 'POST', body: JSON.stringify({ plannedMinutes }) });
export const finishFocus = (id: string, completedMinutes: number, status: 'COMPLETED' | 'ABANDONED' = 'COMPLETED') => api<any>(`/focus/sessions/${id}`, { method: 'PATCH', body: JSON.stringify({ completedMinutes, status }) });
export const focusHistory = () => api<any[]>('/focus/history');
export const dailyInsight = () => api<any>('/ai/daily-insight');
export const weeklyReflection = () => api<{ text: string; source: string }>('/ai/weekly-reflection');
export const addMood = (mood: number, focus?: number, energy?: number, stress?: number) => api<any>('/wellness/mood', { method: 'POST', body: JSON.stringify({ mood, focus, energy, stress }) });
export const moodHistory = () => api<any[]>('/wellness/mood');
export const goals = () => api<any[]>('/wellness/goals');
export const createGoal = (body: { title: string; category: string; target: number; unit: string; frequency?: string }) => api<any>('/wellness/goals', { method: 'POST', body: JSON.stringify(body) });
export const logGoal = (id: string, value: number) => api<any>(`/wellness/goals/${id}/log`, { method: 'POST', body: JSON.stringify({ value }) });
export const games = () => api<any[]>('/content/games');
export const completeGame = (id: string, score: number, durationSec: number) => api<any>(`/content/games/${id}/complete`, { method: 'POST', body: JSON.stringify({ score, durationSec }) });
export const offlinePacks = () => api<any[]>('/content/offline-packs');
export const downloadPack = (id: string) => api<{ pdfUrl: string }>(`/content/offline-packs/${id}/download`, { method: 'POST' });
export const audioTracks = () => api<any[]>('/content/audio');
export const leaderboard = () => api<any[]>('/community/leaderboard');
export const challenges = () => api<any[]>('/community/challenges');
export const joinChallenge = (id: string) => api<any>(`/community/challenges/${id}/join`, { method: 'POST' });
export const rewards = () => api<any>('/community/rewards');
