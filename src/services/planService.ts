import { DraftProfile, StarterPlan } from '../types';

/**
 * Local fallback for Update 1.
 * Later this exact function boundary becomes:
 * POST /plans/generate on NestJS.
 */
export async function generateStarterPlan(draft: DraftProfile): Promise<StarterPlan> {
  await new Promise(resolve => setTimeout(resolve, 1450));

  const heavy = draft.screenTime === '6h+' || draft.screenTime === '4–6h';
  const topApp = draft.apps[0] || 'your most-used app';

  return {
    dailyFocusMinutes: heavy ? 10 : 15,
    dailyChallenges: 2,
    blockedApp: topApp,
    blockedAfter: heavy ? '10:00 PM' : '11:00 PM',
    reason: heavy
      ? 'Start small: lower friction, protect your late-night attention, then build consistency.'
      : 'Your baseline is moderate, so we can use slightly longer focus blocks from day one.',
  };
}
