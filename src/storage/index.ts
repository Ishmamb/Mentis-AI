import AsyncStorage from '@react-native-async-storage/async-storage';
import { DraftProfile, MentisUser, StarterPlan } from '../types';

const K = {
  draft: 'mentis:draft:v2',
  user: 'mentis:user:v2',
  plan: 'mentis:plan:v2',
};

export const emptyDraft: DraftProfile = {
  goals: [],
  screenTime: null,
  apps: [],
  assessmentCorrect: 0,
  focusIndex: null,
  cognitiveAge: null,
};

export async function saveDraft(draft: DraftProfile) {
  await AsyncStorage.setItem(K.draft, JSON.stringify(draft));
}

export async function loadDraft(): Promise<DraftProfile> {
  const raw = await AsyncStorage.getItem(K.draft);
  return raw ? JSON.parse(raw) : emptyDraft;
}

export async function saveUser(user: MentisUser) {
  await AsyncStorage.setItem(K.user, JSON.stringify(user));
}

export async function loadUser(): Promise<MentisUser | null> {
  const raw = await AsyncStorage.getItem(K.user);
  return raw ? JSON.parse(raw) : null;
}

export async function savePlan(plan: StarterPlan) {
  await AsyncStorage.setItem(K.plan, JSON.stringify(plan));
}

export async function loadPlan(): Promise<StarterPlan | null> {
  const raw = await AsyncStorage.getItem(K.plan);
  return raw ? JSON.parse(raw) : null;
}

export async function resetMentis() {
  await AsyncStorage.multiRemove([K.draft, K.user, K.plan]);
}
