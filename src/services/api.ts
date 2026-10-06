import AsyncStorage from '@react-native-async-storage/async-storage';

const configured = process.env.EXPO_PUBLIC_API_URL;
export const API_URL = configured || 'http://10.0.2.2:4000/api';
export const SERVER_URL = API_URL.replace(/\/api\/?$/, '');

const ACCESS = 'mentis:access';
const REFRESH = 'mentis:refresh';

export async function saveTokens(accessToken: string, refreshToken: string) {
  await Promise.all([AsyncStorage.setItem(ACCESS, accessToken), AsyncStorage.setItem(REFRESH, refreshToken)]);
}
export async function clearTokens() {
  await AsyncStorage.multiRemove([ACCESS, REFRESH]);
}
export async function hasSession() { return Boolean(await AsyncStorage.getItem(ACCESS)); }

async function refreshAccess() {
  const refreshToken = await AsyncStorage.getItem(REFRESH);
  if (!refreshToken) return null;
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) { await clearTokens(); return null; }
  const data = await res.json();
  await saveTokens(data.accessToken, data.refreshToken);
  return data.accessToken as string;
}

export async function api<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const token = await AsyncStorage.getItem(ACCESS);
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(init.headers as Record<string, string> || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  let res = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (res.status === 401 && retry) {
    const next = await refreshAccess();
    if (next) {
      headers.Authorization = `Bearer ${next}`;
      res = await fetch(`${API_URL}${path}`, { ...init, headers });
    }
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.message || `Request failed (${res.status})`);
  return body as T;
}

export function assetUrl(path: string) {
  return path.startsWith('http') ? path : `${SERVER_URL}${path}`;
}
