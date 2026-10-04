import AsyncStorage from '@react-native-async-storage/async-storage';
import { DraftProfile } from '../types';

const KEY = 'mentis:draft:faculty-v1';
export const emptyDraft: DraftProfile = { goals: [], screenTime: null, apps: [], assessmentCorrect: 0, focusIndex: null, cognitiveAge: null };
export async function saveDraft(draft: DraftProfile) { await AsyncStorage.setItem(KEY, JSON.stringify(draft)); }
export async function loadDraft(): Promise<DraftProfile> { const raw = await AsyncStorage.getItem(KEY); return raw ? JSON.parse(raw) : emptyDraft; }
export async function resetMentis() { await AsyncStorage.removeItem(KEY); }
