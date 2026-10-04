import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
  constructor(private readonly config: ConfigService, private readonly prisma: PrismaService) {}

  private async askOpenAI(prompt: string): Promise<string | null> {
    const key = this.config.get<string>('OPENAI_API_KEY');
    if (!key) return null;
    try {
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: this.config.get<string>('OPENAI_MODEL') || 'gpt-6-luna',
          input: prompt,
          max_output_tokens: 180,
        }),
      });
      if (!response.ok) return null;
      const data: any = await response.json();
      if (typeof data.output_text === 'string') return data.output_text.trim();
      const text = data.output?.flatMap((item: any) => item.content || []).find((c: any) => c.type === 'output_text')?.text;
      return typeof text === 'string' ? text.trim() : null;
    } catch {
      return null;
    }
  }

  async getDailyInsight(userId: string) {
    const dateKey = new Date().toISOString().slice(0, 10);
    const existing = await this.prisma.dailyInsight.findUnique({ where: { userId_dateKey: { userId, dateKey } } });
    if (existing) return existing;

    const [profile, assessment, recentFocus, recentMood] = await Promise.all([
      this.prisma.onboardingProfile.findUnique({ where: { userId } }),
      this.prisma.assessmentResult.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      this.prisma.focusSession.findMany({ where: { userId }, orderBy: { startedAt: 'desc' }, take: 5 }),
      this.prisma.moodEntry.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    ]);

    const completed = recentFocus.filter(x => x.status === 'COMPLETED').length;
    const topApp = profile?.apps?.[0] || 'your main distraction';
    const fallback = completed >= 3
      ? `You have already completed ${completed} recent focus sessions. Protect that momentum with one short session before opening ${topApp} tonight.`
      : `Make the next step tiny: finish one ${assessment?.focusIndex && assessment.focusIndex < 65 ? '10' : '15'}-minute focus session before opening ${topApp}.`;
    const prompt = `You are Mentis AI, a calm digital-detox coach. Give exactly one concise, non-clinical daily suggestion in 1-2 sentences. User goals: ${profile?.goals?.join(', ') || 'focus'}. Focus index: ${assessment?.focusIndex ?? 'unknown'}. Recent completed focus sessions: ${completed}. Latest mood 1-5: ${recentMood?.mood ?? 'unknown'}. Avoid diagnosis and exaggerated claims.`;
    const aiText = await this.askOpenAI(prompt);
    return this.prisma.dailyInsight.create({
      data: {
        userId,
        dateKey,
        category: 'Focus reset',
        title: 'Protect one small block today',
        summary: aiText || fallback,
        body: aiText || fallback,
        action: 'Start a focus session',
        source: aiText ? 'OPENAI' : 'RULES',
      },
    });
  }

  async weeklyReflection(userId: string) {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [focus, mood, xp] = await Promise.all([
      this.prisma.focusSession.findMany({ where: { userId, startedAt: { gte: since } } }),
      this.prisma.moodEntry.findMany({ where: { userId, createdAt: { gte: since } } }),
      this.prisma.xPEvent.aggregate({ where: { userId, createdAt: { gte: since } }, _sum: { points: true } }),
    ]);
    const completed = focus.filter(x => x.status === 'COMPLETED');
    const minutes = completed.reduce((sum, x) => sum + x.completedMinutes, 0);
    const avgMood = mood.length ? mood.reduce((s, x) => s + x.mood, 0) / mood.length : null;
    const fallback = `This week you completed ${completed.length} focus sessions for ${minutes} focused minutes and earned ${xp._sum.points || 0} XP.${avgMood ? ` Your average check-in mood was ${avgMood.toFixed(1)}/5.` : ''} Next week, protect one repeatable time block instead of chasing a perfect day.`;
    const prompt = `Write a concise weekly Mentis reflection, maximum 3 sentences, non-clinical. Completed focus sessions=${completed.length}, focused minutes=${minutes}, XP=${xp._sum.points || 0}, average mood=${avgMood ?? 'no data'}. Mention one positive observation and one practical next step.`;
    return { text: (await this.askOpenAI(prompt)) || fallback, source: this.config.get<string>('OPENAI_API_KEY') ? 'AI_OR_FALLBACK' : 'RULES' };
  }
}
