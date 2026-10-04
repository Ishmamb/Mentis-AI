import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function wipe() {
  await prisma.challengeParticipant.deleteMany();
  await prisma.userCollectible.deleteMany();
  await prisma.collectible.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.activityEvent.deleteMany();
  await prisma.xPEvent.deleteMany();
  await prisma.audioFavorite.deleteMany();
  await prisma.audioTrack.deleteMany();
  await prisma.offlineDownload.deleteMany();
  await prisma.offlinePack.deleteMany();
  await prisma.dailyInsight.deleteMany();
  await prisma.gameSession.deleteMany();
  await prisma.game.deleteMany();
  await prisma.goalLog.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.moodEntry.deleteMany();
  await prisma.focusSession.deleteMany();
  await prisma.starterPlan.deleteMany();
  await prisma.assessmentResult.deleteMany();
  await prisma.onboardingProfile.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
}

async function createUser(email: string, displayName: string, username: string) {
  return prisma.user.create({
    data: { email, displayName, username, passwordHash: await bcrypt.hash('Mentis123!', 12) },
  });
}

async function main() {
  await wipe();

  const demo = await createUser('demo@mentis.app', 'Mentis Demo', 'steady_focus248');
  const nabila = await createUser('nabila@mentis.app', 'Nabila Alam', 'clear_mind415');
  const tanvir = await createUser('tanvir@mentis.app', 'Tanvir Pranto', 'deep_focus316');
  const akif = await createUser('akif@mentis.app', 'Akif Qaium', 'quiet_orbit722');

  await prisma.onboardingProfile.create({ data: { userId: demo.id, goals: ['Improve focus', 'Reduce scrolling', 'Study better'], screenTime: '4–6h', apps: ['Instagram', 'YouTube', 'Facebook'] } });
  await prisma.assessmentResult.create({ data: { userId: demo.id, correctAnswers: 3, focusIndex: 78, cognitiveAge: 20 } });
  await prisma.starterPlan.create({ data: { userId: demo.id, dailyFocusMinutes: 10, dailyChallenges: 2, blockedApp: 'Instagram', blockedAfter: '10:00 PM', reason: 'Start small: protect one high-friction moment, then build consistency.' } });

  const today = Date.now();
  for (let i = 0; i < 6; i++) {
    const startedAt = new Date(today - i * 24 * 60 * 60 * 1000 - 18 * 60 * 60 * 1000);
    await prisma.focusSession.create({ data: { userId: demo.id, plannedMinutes: 15, completedMinutes: i === 2 ? 10 : 15, status: 'COMPLETED', startedAt, endedAt: new Date(startedAt.getTime() + 15 * 60 * 1000) } });
  }
  for (let i = 0; i < 7; i++) {
    await prisma.moodEntry.create({ data: { userId: demo.id, mood: [4,4,3,5,4,4,5][i], focus: [4,3,3,5,4,4,5][i], energy: [3,4,3,4,4,5,4][i], stress: [3,3,4,2,3,2,2][i], createdAt: new Date(today - i * 24 * 60 * 60 * 1000) } });
  }
  const goal = await prisma.goal.create({ data: { userId: demo.id, title: 'Read 30 books', category: 'Learning', target: 30, unit: 'books', frequency: 'yearly', status: 'ACTIVE' } });
  await prisma.goalLog.createMany({ data: [
    { goalId: goal.id, value: 4, note: 'January–March' },
    { goalId: goal.id, value: 3, note: 'April–June' },
    { goalId: goal.id, value: 5, note: 'July–September' },
  ] });

  const games = await Promise.all([
    prisma.game.create({ data: { slug: 'pattern-lab', title: 'Pattern Lab', description: 'A fast pattern-recognition reset.', difficulty: 'Easy', estimatedMinutes: 2, xpReward: 20 } }),
    prisma.game.create({ data: { slug: 'sudoku-sprint', title: 'Sudoku Sprint', description: 'A compact logic challenge with a clean finish.', difficulty: 'Medium', estimatedMinutes: 5, xpReward: 30 } }),
    prisma.game.create({ data: { slug: 'mystery-case', title: 'Murder Mystery', description: 'Inspect clues and make one evidence-based accusation.', difficulty: 'Medium', estimatedMinutes: 7, xpReward: 35 } }),
  ]);
  await prisma.gameSession.create({ data: { userId: demo.id, gameId: games[0].id, score: 880, durationSec: 92, xpEarned: 20 } });
  await prisma.gameSession.create({ data: { userId: demo.id, gameId: games[1].id, score: 720, durationSec: 264, xpEarned: 30 } });

  await prisma.offlinePack.createMany({ data: [
    { slug: 'mystery-case-01', title: 'Mystery Case #01', description: 'A printable evidence pack for one or more players.', difficulty: 'Easy', playersMin: 1, playersMax: 4, estimatedMinutes: 25, pageCount: 6, tier: 'FREE', pdfUrl: '/assets/packs/mystery-case-01.pdf', xpReward: 20 },
    { slug: 'sudoku-weekend', title: 'Sudoku Weekend Pack', description: 'A set of printable puzzles for a screen-free break.', difficulty: 'Medium', playersMin: 1, playersMax: 1, estimatedMinutes: 30, pageCount: 8, tier: 'FREE', pdfUrl: '/assets/packs/sudoku-weekend.pdf', xpReward: 15 },
    { slug: 'logic-reset', title: 'Logic Reset Pack', description: 'Short logic puzzles designed for solo use.', difficulty: 'Easy', playersMin: 1, playersMax: 2, estimatedMinutes: 20, pageCount: 5, tier: 'FREE', pdfUrl: '/assets/packs/logic-reset.pdf', xpReward: 15 },
    { slug: 'detective-night', title: 'Detective Night', description: 'A richer group mystery designed for an offline evening.', difficulty: 'Hard', playersMin: 2, playersMax: 6, estimatedMinutes: 60, pageCount: 14, tier: 'PREMIUM', pdfUrl: '/assets/packs/detective-night.pdf', xpReward: 40 },
  ] });

  await prisma.audioTrack.createMany({ data: [
    { slug: 'rain-window', title: 'Rain by the Window', category: 'Rain', durationSec: 1800, audioUrl: '/assets/audio/rain-focus.wav', tier: 'FREE' },
    { slug: 'deep-focus', title: 'Deep Focus', category: 'Focus', durationSec: 1500, audioUrl: '/assets/audio/deep-focus.wav', tier: 'FREE' },
    { slug: 'brown-noise', title: 'Soft Brown Noise', category: 'Brown Noise', durationSec: 1800, audioUrl: '/assets/audio/brown-noise.wav', tier: 'FREE' },
    { slug: 'calm-evening', title: 'Calm Evening', category: 'Calm', durationSec: 1200, audioUrl: '/assets/audio/calm-evening.wav', tier: 'PREMIUM' },
  ] });

  const startsAt = new Date(today - 2 * 24 * 60 * 60 * 1000);
  const endsAt = new Date(today + 5 * 24 * 60 * 60 * 1000);
  await prisma.challenge.createMany({ data: [
    { slug: 'weekend-reset', title: 'Weekend Reset', description: 'Complete three focus sessions before the challenge ends.', targetType: 'FOCUS_SESSIONS', targetValue: 3, xpReward: 60, startsAt, endsAt, status: 'ACTIVE' },
    { slug: 'offline-hour', title: 'Offline Hour', description: 'Download an offline pack and spend one hour away from your feed.', targetType: 'OFFLINE_ACTIVITY', targetValue: 1, xpReward: 40, startsAt, endsAt, status: 'ACTIVE' },
  ] });

  await prisma.collectible.createMany({ data: [
    { slug: 'first-reset', title: 'First Reset', type: 'Badge', rarity: 'Common', description: 'Completed the first focus reset.', unlockXp: 20 },
    { slug: 'deep-worker', title: 'Deep Worker', type: 'Title', rarity: 'Uncommon', description: 'A title for users building repeatable focus.', unlockXp: 200 },
    { slug: 'indigo-frame', title: 'Indigo Frame', type: 'Profile Frame', rarity: 'Rare', description: 'A premium profile frame earned through consistency.', unlockXp: 600 },
    { slug: 'ascendant-mark', title: 'Ascendant Mark', type: 'Achievement Card', rarity: 'Legendary', description: 'Awarded after reaching the Ascendant tier.', unlockXp: 1200 },
  ] });

  const xpRows = [
    { userId: demo.id, points: 420, type: 'SEED_PROGRESS' },
    { userId: nabila.id, points: 510, type: 'SEED_PROGRESS' },
    { userId: tanvir.id, points: 360, type: 'SEED_PROGRESS' },
    { userId: akif.id, points: 290, type: 'SEED_PROGRESS' },
  ];
  for (const row of xpRows) await prisma.xPEvent.create({ data: row });

  await prisma.dailyInsight.create({ data: { userId: demo.id, dateKey: new Date().toISOString().slice(0, 10), category: 'Focus reset', title: 'Protect one small block today', summary: 'Your recent sessions are consistent. Try one short focus block before opening Instagram tonight.', body: 'Consistency is doing more for you than longer sessions. Protect one small block at the same time today, then leave the rest of the evening flexible.', action: 'Start a focus session', source: 'SEED' } });

  console.log('Seed complete. Demo login: demo@mentis.app / Mentis123!');
}

main().finally(async () => prisma.$disconnect());
