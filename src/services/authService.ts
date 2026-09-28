import { DraftProfile, MentisUser } from '../types';

const firstNames = ['quiet', 'steady', 'clear', 'deep', 'bright', 'calm'];
const nouns = ['mind', 'focus', 'orbit', 'north', 'pulse', 'frame'];

function username() {
  const a = firstNames[Math.floor(Math.random() * firstNames.length)];
  const b = nouns[Math.floor(Math.random() * nouns.length)];
  const n = Math.floor(100 + Math.random() * 900);
  return `${a}_${b}${n}`;
}

/**
 * Classroom/demo auth.
 * Keeps the UI fully runnable in Expo Go without Google Cloud credentials.
 *
 * Sprint 2 replacement:
 * Google OAuth -> NestJS POST /auth/google -> JWT -> PostgreSQL.
 */
export async function signInWithGoogleDemo(draft: DraftProfile): Promise<MentisUser> {
  await new Promise(resolve => setTimeout(resolve, 700));
  return {
    id: `google-demo-${Date.now()}`,
    email: 'student.demo@gmail.com',
    displayName: 'Mentis User',
    username: username(),
    draft,
    createdAt: new Date().toISOString(),
  };
}
