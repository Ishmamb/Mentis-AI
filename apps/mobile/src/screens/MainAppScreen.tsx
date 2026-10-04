import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Modal, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Brand } from '../components/Brand';
import { Button } from '../components/Button';
import { MetricCard } from '../components/MetricCard';
import { Screen } from '../components/Screen';
import { assetUrl } from '../services/api';
import {
  addMood, audioTracks, challenges, completeGame, createGoal, downloadPack, finishFocus, focusHistory,
  games, getDashboard, goals, joinChallenge, leaderboard, logGoal, moodHistory, offlinePacks, rewards,
  startFocus, weeklyReflection,
} from '../services/backend';
import { C, R } from '../theme';
import { DashboardData, MentisUser, StarterPlan } from '../types';

type Tab = 'Home' | 'Detox' | 'Train' | 'Progress' | 'Profile';

type AsyncState<T> = { loading: boolean; data: T; error?: string };

export function MainAppScreen({ user, plan, onReset }: { user: MentisUser; plan: StarterPlan; onReset: () => void }) {
  const [tab, setTab] = useState<Tab>('Home');
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [focusOpen, setFocusOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<any>(null);

  const refresh = useCallback(async () => {
    try { setDashboard(await getDashboard()); }
    catch (e: any) { Alert.alert('API connection', e?.message || 'Could not load dashboard.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const startQuickFocus = async () => {
    try {
      const session = await startFocus(1);
      setActiveSession(session);
      setFocusOpen(true);
    } catch (e: any) { Alert.alert('Could not start focus', e?.message || 'Check the API.'); }
  };

  const completeQuickFocus = async () => {
    if (!activeSession) return;
    try {
      await finishFocus(activeSession.id, 1, 'COMPLETED');
      setFocusOpen(false);
      setActiveSession(null);
      await refresh();
      Alert.alert('Focus reset complete', 'Your session was saved to PostgreSQL and XP was added.');
    } catch (e: any) { Alert.alert('Could not finish session', e?.message); }
  };

  if (loading) return <Screen><View style={styles.center}><ActivityIndicator color={C.primary} /><Text style={styles.loadingText}>Loading your Mentis workspace…</Text></View></Screen>;

  return (
    <Screen contentStyle={{ paddingBottom: 18 }}>
      <View style={styles.appHeader}>
        <Brand compact />
        <View style={styles.avatar}><Text style={styles.avatarText}>{user.displayName[0]?.toUpperCase()}</Text></View>
      </View>

      {tab === 'Home' && <Home user={user} plan={plan} dashboard={dashboard} onFocus={startQuickFocus} onRefresh={refresh} />}
      {tab === 'Detox' && <Detox plan={plan} onFocus={startQuickFocus} />}
      {tab === 'Train' && <Train onRefresh={refresh} />}
      {tab === 'Progress' && <Progress onRefresh={refresh} />}
      {tab === 'Profile' && <Profile user={user} onReset={onReset} />}

      <View style={styles.nav}>
        {(['Home','Detox','Train','Progress','Profile'] as Tab[]).map(t => (
          <Pressable key={t} onPress={() => { Haptics.selectionAsync().catch(() => {}); setTab(t); }} style={styles.navItem}>
            <View style={[styles.navDot, tab === t && styles.navDotActive]} />
            <Text style={[styles.navText, tab === t && styles.navTextActive]}>{t}</Text>
          </Pressable>
        ))}
      </View>

      <Modal visible={focusOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetKicker}>LIVE BACKEND FOCUS SESSION</Text>
            <Text style={styles.sheetTitle}>01:00</Text>
            <Text style={styles.sheetBody}>This demo session already exists in PostgreSQL with ACTIVE status. Completing it writes the final duration, activity event and XP event.</Text>
            <View style={styles.infoBox}><Text style={styles.infoText}>For presentation speed, you can complete the one-minute demo immediately.</Text></View>
            <Button title="Complete demo session" onPress={completeQuickFocus} variant="dark" style={{ marginTop: 18 }} />
            <Button title="Close without completing" onPress={() => setFocusOpen(false)} variant="ghost" style={{ marginTop: 6 }} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function Home({ user, plan, dashboard, onFocus, onRefresh }: { user: MentisUser; plan: StarterPlan; dashboard: DashboardData | null; onFocus: () => void; onRefresh: () => Promise<void> }) {
  const first = user.displayName.split(' ')[0];
  const d = dashboard;
  return (
    <View>
      <Text style={styles.hello}>Good evening, {first}.</Text>
      <Text style={styles.handle}>@{user.username} · {d?.level.name || 'Starter'}</Text>

      <View style={styles.heroCard}>
        <View style={styles.heroTop}><Text style={styles.heroKicker}>TODAY'S RESET</Text><Pill text="backend live" tone="green" /></View>
        <Text style={styles.heroTitle}>{plan.dailyFocusMinutes} minutes. One task.</Text>
        <Text style={styles.heroBody}>Your plan is stored on the server; focus sessions update progress and XP in real time.</Text>
        <Button title="Start 1-minute faculty demo" variant="secondary" onPress={onFocus} style={{ marginTop: 20 }} />
      </View>

      <Text style={styles.section}>Today at a glance</Text>
      <View style={styles.metricRow}>
        <MetricCard value={`${d?.focusIndex ?? 0}`} label="Focus index" hint={`${d?.streak ?? 0}-session streak`} />
        <MetricCard value={`${d?.level.xp ?? 0}`} label="Total XP" hint={d?.level.name || 'Starter'} />
      </View>

      <Text style={styles.section}>Mentis AI insight</Text>
      <View style={styles.insightCard}>
        <View style={styles.rowBetween}><Text style={styles.insightKicker}>PERSONALIZED BY MENTIS AI</Text><Pill text={d?.dailyInsight.source === 'OPENAI' ? 'live AI' : 'safe fallback'} /></View>
        <Text style={styles.insightTitle}>{d?.dailyInsight.title}</Text>
        <Text style={styles.insightBody}>{d?.dailyInsight.summary}</Text>
        <Pressable onPress={onFocus} style={styles.textAction}><Text style={styles.textActionText}>Start the suggested reset →</Text></Pressable>
      </View>

      {!!d?.activeGoal && <>
        <Text style={styles.section}>Personal goal</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{d.activeGoal.title}</Text>
          <Text style={styles.cardMeta}>{d.activeGoal.progress} / {d.activeGoal.target} {d.activeGoal.unit}</Text>
          <ProgressBar value={Math.min(1, d.activeGoal.progress / d.activeGoal.target)} />
        </View>
      </>}

      <Text style={styles.section}>This week</Text>
      <View style={styles.card}>
        <View style={styles.rowBetween}><Text style={styles.cardTitle}>Focus sessions</Text><Text style={styles.bigInline}>{d?.weekly.completedSessions || 0}</Text></View>
        <Text style={styles.cardMeta}>{d?.weekly.focusedMinutes || 0} focused minutes recorded by the backend.</Text>
      </View>
      <Button title="Refresh server data" variant="ghost" onPress={onRefresh} style={{ marginTop: 8 }} />
    </View>
  );
}

function Detox({ plan, onFocus }: { plan: StarterPlan; onFocus: () => void }) {
  const [state, setState] = useState<AsyncState<any[]>>({ loading: true, data: [] });
  const load = useCallback(async () => {
    try { setState({ loading: false, data: await focusHistory() }); } catch (e: any) { setState({ loading: false, data: [], error: e?.message }); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const completed = state.data.filter(x => x.status === 'COMPLETED');
  const mins = completed.reduce((s, x) => s + x.completedMinutes, 0);
  return <View>
    <Text style={styles.pageTitle}>Detox</Text>
    <Text style={styles.pageSub}>Protect specific moments instead of fighting your entire phone.</Text>
    <View style={styles.detoxHero}><Text style={styles.detoxKicker}>RECORDED FOCUS</Text><Text style={styles.detoxBig}>{mins} min</Text><Text style={styles.detoxSub}>{completed.length} completed sessions in your database</Text></View>
    <Text style={styles.section}>Protection plan</Text>
    <SettingRow title={`${plan.blockedApp} focus shield`} sub="During active focus sessions" status="Configured" />
    <SettingRow title={`Night cutoff · ${plan.blockedAfter}`} sub={`Protect the late-night ${plan.blockedApp} loop`} status="Planned" />
    <SettingRow title="Android native restriction" sub="Native Usage Access integration remains isolated from the core demo" status="Optional" />
    <Button title="Start focus session" onPress={onFocus} style={{ marginTop: 20 }} />
    <Text style={styles.section}>Recent sessions</Text>
    {state.loading ? <ActivityIndicator color={C.primary} /> : state.data.slice(0,5).map(x => <View key={x.id} style={styles.listRow}><View><Text style={styles.cardTitle}>{x.status === 'COMPLETED' ? 'Completed focus' : x.status}</Text><Text style={styles.cardMeta}>{new Date(x.startedAt).toLocaleDateString()} · planned {x.plannedMinutes} min</Text></View><Text style={styles.scoreSmall}>{x.completedMinutes}m</Text></View>)}
  </View>;
}

function Train({ onRefresh }: { onRefresh: () => Promise<void> }) {
  const [allGames, setGames] = useState<any[]>([]);
  const [packs, setPacks] = useState<any[]>([]);
  const [audio, setAudio] = useState<any[]>([]);
  const [answer, setAnswer] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const load = useCallback(async () => {
    try { const [g,p,a] = await Promise.all([games(), offlinePacks(), audioTracks()]); setGames(g); setPacks(p); setAudio(a); } catch (e: any) { Alert.alert('Train data', e?.message); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const playPattern = async (pick: number) => {
    setAnswer(pick);
    if (pick !== 32) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {}); return; }
    const game = allGames.find(x => x.slug === 'pattern-lab') || allGames[0];
    if (!game) return;
    setSaving(true);
    try {
      await completeGame(game.id, 900, 64);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      await onRefresh();
      Alert.alert('Pattern solved', `Score 900 · +${game.xpReward} XP saved to the backend.`);
    } catch (e: any) { Alert.alert('Could not save score', e?.message); }
    finally { setSaving(false); }
  };

  const openPack = async (pack: any) => {
    try { const result = await downloadPack(pack.id); await Linking.openURL(assetUrl(result.pdfUrl)); }
    catch (e: any) { Alert.alert('Download failed', e?.message); }
  };

  return <View>
    <Text style={styles.pageTitle}>Train</Text>
    <Text style={styles.pageSub}>Replace the scroll impulse with a short challenge, an offline activity, or calm focus audio.</Text>

    <Text style={styles.section}>Playable challenge</Text>
    <View style={styles.gameHero}>
      <Text style={styles.gameKicker}>PATTERN LAB · LIVE SCORE PERSISTENCE</Text>
      <Text style={styles.gameTitle}>2 · 4 · 8 · 16 · ?</Text>
      <Text style={styles.gameBody}>Choose the next number. A correct answer records a GameSession and XPEvent.</Text>
      <View style={styles.answerRow}>{[24,32,34].map(v => <Pressable key={v} onPress={() => playPattern(v)} style={[styles.answerBox, answer === v && styles.answerBoxActive]}><Text style={styles.answerText}>{v}</Text></Pressable>)}</View>
      {saving && <ActivityIndicator color="#fff" style={{ marginTop: 12 }} />}
    </View>

    <Text style={styles.section}>Brain games</Text>
    {allGames.map(g => <View key={g.id} style={styles.listRow}><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{g.title}</Text><Text style={styles.cardMeta}>{g.difficulty} · {g.estimatedMinutes} min · +{g.xpReward} XP</Text></View><Pill text={g.tier.toLowerCase()} /></View>)}

    <Text style={styles.section}>Offline Play</Text>
    <Text style={styles.microCopy}>Download the pack, print it, and leave the phone behind.</Text>
    {packs.map(p => <Pressable key={p.id} onPress={() => openPack(p)} style={styles.packCard}>
      <View style={{ flex: 1 }}><Text style={styles.cardTitle}>{p.title}</Text><Text style={styles.cardMeta}>{p.difficulty} · {p.playersMin}-{p.playersMax} player(s) · {p.pageCount} pages</Text></View><Pill text={p.tier === 'FREE' ? 'free PDF' : 'premium'} tone={p.tier === 'FREE' ? 'green' : 'default'} />
    </Pressable>)}

    <Text style={styles.section}>Focus & Calm</Text>
    {audio.map(a => <Pressable key={a.id} onPress={() => Linking.openURL(assetUrl(a.audioUrl))} style={styles.listRow}><View><Text style={styles.cardTitle}>{a.title}</Text><Text style={styles.cardMeta}>{a.category} · demo audio asset</Text></View><Text style={styles.play}>▶</Text></Pressable>)}
  </View>;
}

function Progress({ onRefresh }: { onRefresh: () => Promise<void> }) {
  const [moods, setMoods] = useState<any[]>([]);
  const [goalList, setGoals] = useState<any[]>([]);
  const [reflection, setReflection] = useState('Loading your weekly reflection…');
  const load = useCallback(async () => {
    try {
      const [m,g,r] = await Promise.all([moodHistory(), goals(), weeklyReflection()]);
      setMoods(m); setGoals(g); setReflection(r.text);
    } catch (e: any) { setReflection(e?.message || 'Could not load progress.'); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const checkIn = async (mood: number) => {
    try { await addMood(mood, mood, Math.max(1, mood - 1), Math.max(1, 6 - mood)); await load(); await onRefresh(); Alert.alert('Check-in saved', '+5 XP added.'); }
    catch (e: any) { Alert.alert('Could not save mood', e?.message); }
  };
  const ensureGoal = async () => {
    try { await createGoal({ title: 'Read 30 books', category: 'Learning', target: 30, unit: 'books', frequency: 'yearly' }); await load(); await onRefresh(); }
    catch (e: any) { Alert.alert('Could not create goal', e?.message); }
  };
  const addOne = async (goal: any) => {
    try { await logGoal(goal.id, 1); await load(); await onRefresh(); Alert.alert('Goal updated', '+1 progress and +10 XP.'); }
    catch (e: any) { Alert.alert('Could not update goal', e?.message); }
  };

  const primaryGoal = goalList[0];
  const progress = primaryGoal ? primaryGoal.logs.reduce((s: number, x: any) => s + x.value, 0) : 0;
  const recent = moods.slice(0,7).reverse();
  return <View>
    <Text style={styles.pageTitle}>Progress</Text>
    <Text style={styles.pageSub}>Reflection combines what you actually did: focus, mood, goals, games and XP.</Text>

    <Text style={styles.section}>Daily mood check-in</Text>
    <View style={styles.moodRow}>{[1,2,3,4,5].map(v => <Pressable key={v} onPress={() => checkIn(v)} style={styles.mood}><Text style={styles.moodEmoji}>{['😞','😕','😐','🙂','😄'][v-1]}</Text><Text style={styles.moodNumber}>{v}</Text></Pressable>)}</View>

    <Text style={styles.section}>7-day mood index</Text>
    <View style={styles.card}><View style={styles.bars}>{recent.map((m, i) => <View key={m.id || i} style={styles.barColumn}><View style={[styles.bar,{ height: 12 + m.mood*13 }]} /><Text style={styles.barLabel}>{m.mood}</Text></View>)}</View><Text style={styles.cardMeta}>Self-reported reflection only — not a clinical measure.</Text></View>

    <Text style={styles.section}>Personal goal</Text>
    {!primaryGoal ? <View style={styles.card}><Text style={styles.cardTitle}>No active goal yet</Text><Text style={styles.cardMeta}>Goals are optional modules; unused goals never clutter the dashboard.</Text><Button title="Create demo reading goal" onPress={ensureGoal} variant="secondary" style={{ marginTop: 14 }} /></View> : <View style={styles.card}>
      <View style={styles.rowBetween}><Text style={styles.cardTitle}>{primaryGoal.title}</Text><Text style={styles.bigInline}>{progress}/{primaryGoal.target}</Text></View>
      <ProgressBar value={Math.min(1, progress / primaryGoal.target)} />
      <Button title={`Add 1 ${primaryGoal.unit}`} onPress={() => addOne(primaryGoal)} variant="secondary" style={{ marginTop: 14 }} />
    </View>}

    <Text style={styles.section}>Mentis weekly reflection</Text>
    <View style={styles.insightCard}><Text style={styles.insightKicker}>MENTIS NOTICED…</Text><Text style={styles.insightBody}>{reflection}</Text></View>
  </View>;
}

function Profile({ user, onReset }: { user: MentisUser; onReset: () => void }) {
  const [board, setBoard] = useState<any[]>([]);
  const [rewardData, setRewardData] = useState<any>({ xp: 0, level: 'Starter', unlocked: [] });
  const [challengeList, setChallenges] = useState<any[]>([]);
  const load = useCallback(async () => {
    try { const [b,r,c] = await Promise.all([leaderboard(), rewards(), challenges()]); setBoard(b); setRewardData(r); setChallenges(c); }
    catch (e: any) { Alert.alert('Community data', e?.message); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const join = async (id: string) => { try { await joinChallenge(id); Alert.alert('Challenge joined', 'Your participation is stored in the backend.'); } catch (e: any) { Alert.alert('Could not join', e?.message); } };
  const share = () => Share.share({ message: `Mentis AI — ${rewardData.level} · ${rewardData.xp} XP. Taking my attention back, one reset at a time.` });

  return <View>
    <View style={styles.profileHero}><View style={styles.profileAvatar}><Text style={styles.profileAvatarText}>{user.displayName[0]}</Text></View><Text style={styles.profileName}>{user.displayName}</Text><Text style={styles.handle}>@{user.username}</Text><Pill text={`${rewardData.level} · ${rewardData.xp} XP`} tone="green" /></View>

    <Text style={styles.section}>Community leaderboard</Text>
    <View style={styles.card}>{board.length === 0 ? <Text style={styles.cardMeta}>Complete activities to populate the leaderboard.</Text> : board.slice(0,10).map(row => <View key={row.id || row.username} style={styles.leaderRow}><Text style={styles.rank}>#{row.rank}</Text><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{row.displayName}</Text><Text style={styles.cardMeta}>@{row.username}</Text></View><Text style={styles.scoreSmall}>{row.points} XP</Text></View>)}</View>

    <Text style={styles.section}>Collectibles</Text>
    <View style={styles.collectGrid}>{rewardData.unlocked.map((link: any) => <View key={link.id} style={styles.collectible}><Text style={styles.collectibleMark}>◆</Text><Text style={styles.collectibleTitle}>{link.collectible.title}</Text><Text style={styles.collectibleMeta}>{link.collectible.rarity}</Text></View>)}</View>

    <Text style={styles.section}>Active challenges</Text>
    {challengeList.map(c => <View key={c.id} style={styles.packCard}><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{c.title}</Text><Text style={styles.cardMeta}>{c.description} · +{c.xpReward} XP</Text></View><Pressable onPress={() => join(c.id)}><Text style={styles.joinText}>Join</Text></Pressable></View>)}

    <Button title="Share my Mentis progress" onPress={share} variant="secondary" style={{ marginTop: 22 }} />
    <View style={styles.accountCard}><Text style={styles.cardTitle}>Backend account</Text><Text style={styles.cardMeta}>{user.email}</Text><Text style={styles.cardMeta}>User ID: {user.id.slice(0,12)}…</Text></View>
    <Button title="Log out & restart onboarding" variant="ghost" onPress={onReset} style={{ marginTop: 12 }} />
  </View>;
}

function Pill({ text, tone = 'default' }: { text: string; tone?: 'default' | 'green' }) {
  return <View style={[styles.pill, tone === 'green' && styles.pillGreen]}><Text style={[styles.pillText, tone === 'green' && styles.pillTextGreen]}>{text}</Text></View>;
}
function ProgressBar({ value }: { value: number }) { return <View style={styles.progressTrack}><View style={[styles.progressFill,{ width: `${Math.round(value*100)}%` }]} /></View>; }
function SettingRow({ title, sub, status }: { title: string; sub: string; status: string }) { return <View style={styles.setting}><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{title}</Text><Text style={styles.cardMeta}>{sub}</Text></View><Pill text={status} /></View>; }

const styles = StyleSheet.create({
  center: { minHeight: 600, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: C.muted, marginTop: 12, fontSize: 13 },
  appHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.primarySoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: C.primary, fontWeight: '900' },
  hello: { color: C.ink, fontSize: 29, fontWeight: '900', letterSpacing: -0.8, marginTop: 34 },
  handle: { color: C.muted, fontSize: 12, marginTop: 4, marginBottom: 8 },
  heroCard: { backgroundColor: C.dark, borderRadius: R.xl, padding: 21, marginTop: 18 },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroKicker: { color: '#9FB0CA', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  heroTitle: { color: '#fff', fontSize: 25, fontWeight: '900', letterSpacing: -0.7, marginTop: 18 },
  heroBody: { color: '#B8C5D8', fontSize: 13, lineHeight: 20, marginTop: 7 },
  section: { color: C.text, fontWeight: '900', fontSize: 15, marginTop: 27, marginBottom: 10 },
  metricRow: { flexDirection: 'row', gap: 10 },
  insightCard: { backgroundColor: C.primarySoft, borderRadius: R.lg, padding: 18, borderWidth: 1, borderColor: '#DCE3FF' },
  insightKicker: { color: C.primary, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  insightTitle: { color: C.ink, fontSize: 18, fontWeight: '900', marginTop: 10 },
  insightBody: { color: C.text, fontSize: 13, lineHeight: 20, marginTop: 7 },
  textAction: { marginTop: 13 }, textActionText: { color: C.primary, fontWeight: '850', fontSize: 12 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  card: { backgroundColor: C.card, borderRadius: R.lg, padding: 17, borderWidth: 1, borderColor: C.line },
  cardTitle: { color: C.text, fontSize: 13, fontWeight: '850' },
  cardMeta: { color: C.muted, fontSize: 11, lineHeight: 17, marginTop: 4 },
  bigInline: { color: C.ink, fontSize: 20, fontWeight: '900' },
  progressTrack: { height: 8, borderRadius: 99, backgroundColor: '#E6EAF2', overflow: 'hidden', marginTop: 12 },
  progressFill: { height: 8, borderRadius: 99, backgroundColor: C.primary },
  pageTitle: { color: C.ink, fontSize: 31, fontWeight: '900', letterSpacing: -0.8, marginTop: 34 },
  pageSub: { color: C.muted, fontSize: 14, lineHeight: 22, marginTop: 8 },
  detoxHero: { backgroundColor: C.greenSoft, borderRadius: R.xl, padding: 21, marginTop: 22 },
  detoxKicker: { color: C.green, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  detoxBig: { color: C.ink, fontSize: 35, fontWeight: '900', marginTop: 9 },
  detoxSub: { color: C.muted, fontSize: 12, marginTop: 4 },
  setting: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.line },
  listRow: { backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: R.md, padding: 14, marginBottom: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  scoreSmall: { color: C.primary, fontWeight: '900', fontSize: 12 },
  gameHero: { backgroundColor: C.dark, borderRadius: R.xl, padding: 20 },
  gameKicker: { color: '#9FB0CA', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  gameTitle: { color: '#fff', fontSize: 28, fontWeight: '900', marginTop: 14 },
  gameBody: { color: '#B8C5D8', fontSize: 12, lineHeight: 18, marginTop: 7 },
  answerRow: { flexDirection: 'row', gap: 9, marginTop: 18 },
  answerBox: { flex: 1, minHeight: 54, borderRadius: R.md, backgroundColor: C.dark2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#28354A' },
  answerBoxActive: { backgroundColor: '#25345B', borderColor: '#748CF3' }, answerText: { color: '#fff', fontWeight: '900', fontSize: 18 },
  microCopy: { color: C.muted, fontSize: 11, lineHeight: 17, marginTop: -5, marginBottom: 10 },
  packCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: R.md, padding: 14, marginBottom: 9, flexDirection: 'row', alignItems: 'center', gap: 12 },
  play: { color: C.primary, fontSize: 18, fontWeight: '900' },
  moodRow: { flexDirection: 'row', gap: 7 }, mood: { flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 15, alignItems: 'center', paddingVertical: 11 },
  moodEmoji: { fontSize: 21 }, moodNumber: { color: C.muted, fontSize: 9, fontWeight: '800', marginTop: 5 },
  bars: { height: 94, flexDirection: 'row', alignItems: 'flex-end', gap: 9, marginBottom: 8 }, barColumn: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: '70%', borderRadius: 7, backgroundColor: C.primary }, barLabel: { color: C.muted, fontSize: 9, marginTop: 5 },
  profileHero: { alignItems: 'center', paddingTop: 36 }, profileAvatar: { width: 74, height: 74, borderRadius: 37, backgroundColor: C.dark, alignItems: 'center', justifyContent: 'center' },
  profileAvatarText: { color: '#fff', fontSize: 28, fontWeight: '900' }, profileName: { color: C.ink, fontSize: 23, fontWeight: '900', marginTop: 13 },
  leaderRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.line }, rank: { width: 27, color: C.primary, fontWeight: '900' },
  collectGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 }, collectible: { width: '48.5%', backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: R.md, padding: 14 },
  collectibleMark: { color: C.primary, fontSize: 19 }, collectibleTitle: { color: C.ink, fontWeight: '900', fontSize: 12, marginTop: 8 }, collectibleMeta: { color: C.muted, fontSize: 9, marginTop: 3 },
  joinText: { color: C.primary, fontWeight: '900', fontSize: 12 }, accountCard: { backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: R.md, padding: 15, marginTop: 14 },
  pill: { borderRadius: 99, paddingHorizontal: 9, paddingVertical: 5, backgroundColor: C.primarySoft }, pillText: { color: C.primary, fontSize: 9, fontWeight: '900' },
  pillGreen: { backgroundColor: C.greenSoft }, pillTextGreen: { color: C.green },
  nav: { flexDirection: 'row', backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 24, paddingHorizontal: 4, paddingVertical: 9, marginTop: 32 },
  navItem: { flex: 1, alignItems: 'center', gap: 5 }, navDot: { width: 5, height: 5, borderRadius: 99, backgroundColor: '#D9DEE8' }, navDotActive: { backgroundColor: C.primary },
  navText: { color: C.muted, fontSize: 9, fontWeight: '750' }, navTextActive: { color: C.primary, fontWeight: '900' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(6,11,22,0.45)', justifyContent: 'flex-end' }, sheet: { backgroundColor: C.card, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 34 },
  sheetHandle: { width: 42, height: 5, borderRadius: 99, backgroundColor: '#D8DDE7', alignSelf: 'center', marginBottom: 22 }, sheetKicker: { color: C.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  sheetTitle: { color: C.ink, fontSize: 50, fontWeight: '900', letterSpacing: -2, marginTop: 8 }, sheetBody: { color: C.muted, fontSize: 13, lineHeight: 20, marginTop: 8 },
  infoBox: { backgroundColor: C.primarySoft, borderRadius: R.md, padding: 13, marginTop: 16 }, infoText: { color: C.text, fontSize: 11, lineHeight: 17, fontWeight: '650' },
});
