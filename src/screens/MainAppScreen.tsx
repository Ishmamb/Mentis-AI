import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
  Modal,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Brand } from '../components/Brand';
import { Button } from '../components/Button';
import { ChessGame } from '../components/ChessGame';
import { MentisAiModal } from '../components/MentisAiModal';
import { MetricCard } from '../components/MetricCard';
import { MysteryCaseGame } from '../components/MysteryCaseGame';
import { Screen } from '../components/Screen';
import { SudokuGame } from '../components/SudokuGame';
import { ZenBreathing } from '../components/ZenBreathing';
import { assetUrl } from '../services/api';
import {
  addMood,
  audioTracks,
  challenges,
  completeGame,
  createGoal,
  downloadPack,
  finishFocus,
  focusHistory,
  games,
  getDashboard,
  goals,
  joinChallenge,
  leaderboard,
  logGoal,
  moodHistory,
  offlinePacks,
  rewards,
  startFocus,
  weeklyReflection,
} from '../services/backend';
import { C, R } from '../theme';
import { DashboardData, MentisUser, StarterPlan } from '../types';

type Tab = 'Home' | 'Detox' | 'Train' | 'Progress' | 'Profile';
type TrainCategory = 'games' | 'breathe' | 'packs' | 'audio';

type AsyncState<T> = { loading: boolean; data: T; error?: string };

export function MainAppScreen({
  user,
  plan,
  onReset,
}: {
  user: MentisUser;
  plan: StarterPlan;
  onReset: () => void;
}) {
  const [tab, setTab] = useState<Tab>('Home');
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [focusOpen, setFocusOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [copilotOpen, setCopilotOpen] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setDashboard(await getDashboard());
    } catch (e: any) {
      Alert.alert('API connection', e?.message || 'Could not load dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const startQuickFocus = async () => {
    try {
      const session = await startFocus(1);
      setActiveSession(session);
      setFocusOpen(true);
    } catch (e: any) {
      Alert.alert('Could not start focus', e?.message || 'Check the API.');
    }
  };

  const completeQuickFocus = async () => {
    if (!activeSession) return;
    try {
      await finishFocus(activeSession.id, 1, 'COMPLETED');
      setFocusOpen(false);
      setActiveSession(null);
      await refresh();
      Alert.alert('Focus reset complete', 'Your session was saved to PostgreSQL and XP was added.');
    } catch (e: any) {
      Alert.alert('Could not finish session', e?.message);
    }
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.center}>
          <ActivityIndicator color={C.primary} size="large" />
          <Text style={styles.loadingText}>Loading your Mentis workspace…</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen contentStyle={{ paddingBottom: 22 }}>
      {/* Top App Header */}
      <View style={styles.appHeader}>
        <Brand compact />
        <View style={styles.headerRight}>
          <Pressable
            style={styles.copilotTrigger}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              setCopilotOpen(true);
            }}
          >
            <Text style={styles.copilotIcon}>✨</Text>
            <Text style={styles.copilotText}>Mentis AI</Text>
          </Pressable>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.displayName[0]?.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      {/* Screen Tabs */}
      {tab === 'Home' && (
        <Home
          user={user}
          plan={plan}
          dashboard={dashboard}
          onFocus={startQuickFocus}
          onOpenCopilot={() => setCopilotOpen(true)}
          onNavigateToTrain={() => setTab('Train')}
          onRefresh={refresh}
        />
      )}
      {tab === 'Detox' && (
        <Detox
          plan={plan}
          onFocus={startQuickFocus}
          onOpenBreathing={() => {
            setTab('Train');
          }}
        />
      )}
      {tab === 'Train' && (
        <Train
          onRefresh={refresh}
          onStartFocus={startQuickFocus}
        />
      )}
      {tab === 'Progress' && <Progress onRefresh={refresh} />}
      {tab === 'Profile' && <Profile user={user} onReset={onReset} />}

      {/* Modern Floating Bottom Navigation */}
      <View style={styles.nav}>
        {(['Home', 'Detox', 'Train', 'Progress', 'Profile'] as Tab[]).map(t => {
          const isActive = tab === t;
          return (
            <Pressable
              key={t}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setTab(t);
              }}
              style={styles.navItem}
            >
              <View style={[styles.navDot, isActive && styles.navDotActive]} />
              <Text style={[styles.navText, isActive && styles.navTextActive]}>{t}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Focus Timer Modal */}
      <Modal visible={focusOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetKicker}>LIVE BACKEND FOCUS SESSION</Text>
            <Text style={styles.sheetTitle}>01:00</Text>
            <Text style={styles.sheetBody}>
              This demo session already exists in PostgreSQL with ACTIVE status. Completing it writes the final duration, activity event and XP event.
            </Text>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                For presentation speed, you can complete the one-minute demo immediately.
              </Text>
            </View>
            <Button
              title="Complete demo session"
              onPress={completeQuickFocus}
              variant="dark"
              style={{ marginTop: 18 }}
            />
            <Button
              title="Close without completing"
              onPress={() => setFocusOpen(false)}
              variant="ghost"
              style={{ marginTop: 6 }}
            />
          </View>
        </View>
      </Modal>

      {/* Mentis AI Copilot Modal */}
      <MentisAiModal
        visible={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        onStartFocus={() => {
          setCopilotOpen(false);
          startQuickFocus();
        }}
        onStartBreathing={() => {
          setCopilotOpen(false);
          setTab('Train');
        }}
      />
    </Screen>
  );
}

function Home({
  user,
  plan,
  dashboard,
  onFocus,
  onOpenCopilot,
  onNavigateToTrain,
  onRefresh,
}: {
  user: MentisUser;
  plan: StarterPlan;
  dashboard: DashboardData | null;
  onFocus: () => void;
  onOpenCopilot: () => void;
  onNavigateToTrain: () => void;
  onRefresh: () => Promise<void>;
}) {
  const first = user.displayName.split(' ')[0];
  const d = dashboard;

  return (
    <View>
      <Text style={styles.hello}>Good day, {first}.</Text>
      <Text style={styles.handle}>
        @{user.username} · {d?.level.name || 'Starter'}
      </Text>

      {/* Hero Focus Action */}
      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <Text style={styles.heroKicker}>DAILY ATTENTION RESET</Text>
          <Pill text="live postgres" tone="green" />
        </View>
        <Text style={styles.heroTitle}>{plan.dailyFocusMinutes} minutes. One single task.</Text>
        <Text style={styles.heroBody}>
          Shield your prefrontal cortex from algorithmic noise. Sessions record persistent XP in real time.
        </Text>
        <View style={styles.heroActionRow}>
          <Button
            title="Start 1-min quick reset"
            variant="secondary"
            onPress={onFocus}
            style={{ flex: 1 }}
          />
        </View>
      </View>

      {/* Quick In-App Activities Launchpad */}
      <Text style={styles.section}>Quick Training Hub</Text>
      <View style={styles.launchpadGrid}>
        <Pressable style={styles.launchCard} onPress={onNavigateToTrain}>
          <View style={[styles.launchIconBox, { backgroundColor: '#EEF2FF' }]}>
            <Text style={styles.launchIcon}>♟️</Text>
          </View>
          <Text style={styles.launchTitle}>Play Chess</Text>
          <Text style={styles.launchSub}>Tactical Bot or 2P</Text>
        </Pressable>

        <Pressable style={styles.launchCard} onPress={onNavigateToTrain}>
          <View style={[styles.launchIconBox, { backgroundColor: '#EAF8F3' }]}>
            <Text style={styles.launchIcon}>🧩</Text>
          </View>
          <Text style={styles.launchTitle}>Play Sudoku</Text>
          <Text style={styles.launchSub}>Free API Connect</Text>
        </Pressable>

        <Pressable style={styles.launchCard} onPress={onNavigateToTrain}>
          <View style={[styles.launchIconBox, { backgroundColor: '#FFF6E8' }]}>
            <Text style={styles.launchIcon}>🧘</Text>
          </View>
          <Text style={styles.launchTitle}>Breathwork</Text>
          <Text style={styles.launchSub}>4-4-4-4 Reset</Text>
        </Pressable>
      </View>

      {/* Metrics Row */}
      <Text style={styles.section}>Today at a glance</Text>
      <View style={styles.metricRow}>
        <MetricCard
          value={`${d?.focusIndex ?? 0}`}
          label="Focus index"
          hint={`${d?.streak ?? 0}-session streak`}
        />
        <MetricCard
          value={`${d?.level.xp ?? 0}`}
          label="Total XP"
          hint={d?.level.name || 'Starter'}
        />
      </View>

      {/* AI Daily Insight */}
      <Text style={styles.section}>Mentis AI insight</Text>
      <View style={styles.insightCard}>
        <View style={styles.rowBetween}>
          <Text style={styles.insightKicker}>PERSONALIZED BY MENTIS AI</Text>
          <Pill text={d?.dailyInsight.source === 'OPENAI' ? 'live AI' : 'neural guard'} />
        </View>
        <Text style={styles.insightTitle}>{d?.dailyInsight.title}</Text>
        <Text style={styles.insightBody}>{d?.dailyInsight.summary}</Text>
        <View style={styles.insightButtons}>
          <Pressable onPress={onFocus} style={styles.textAction}>
            <Text style={styles.textActionText}>Start the suggested reset →</Text>
          </Pressable>
          <Pressable onPress={onOpenCopilot} style={styles.textAction}>
            <Text style={[styles.textActionText, { color: C.text }]}>Ask Copilot ✨</Text>
          </Pressable>
        </View>
      </View>

      {/* Active Personal Goal */}
      {!!d?.activeGoal && (
        <>
          <Text style={styles.section}>Personal goal</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{d.activeGoal.title}</Text>
            <Text style={styles.cardMeta}>
              {d.activeGoal.progress} / {d.activeGoal.target} {d.activeGoal.unit}
            </Text>
            <ProgressBar value={Math.min(1, d.activeGoal.progress / d.activeGoal.target)} />
          </View>
        </>
      )}

      {/* Weekly Summary */}
      <Text style={styles.section}>This week</Text>
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>Focus sessions</Text>
          <Text style={styles.bigInline}>{d?.weekly.completedSessions || 0}</Text>
        </View>
        <Text style={styles.cardMeta}>
          {d?.weekly.focusedMinutes || 0} focused minutes recorded by the backend.
        </Text>
      </View>

      <Button
        title="Refresh server data"
        variant="ghost"
        onPress={onRefresh}
        style={{ marginTop: 8 }}
      />
    </View>
  );
}

function Detox({ plan, onFocus, onOpenBreathing }: { plan: StarterPlan; onFocus: () => void; onOpenBreathing: () => void }) {
  const [state, setState] = useState<AsyncState<any[]>>({ loading: true, data: [] });

  const load = useCallback(async () => {
    try {
      setState({ loading: false, data: await focusHistory() });
    } catch (e: any) {
      setState({ loading: false, data: [], error: e?.message });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const completed = state.data.filter(x => x.status === 'COMPLETED');
  const mins = completed.reduce((s, x) => s + x.completedMinutes, 0);

  return (
    <View>
      <Text style={styles.pageTitle}>Detox</Text>
      <Text style={styles.pageSub}>
        Protect specific high-friction moments instead of fighting your entire phone.
      </Text>

      <View style={styles.detoxHero}>
        <Text style={styles.detoxKicker}>RECORDED FOCUS TIME</Text>
        <Text style={styles.detoxBig}>{mins} min</Text>
        <Text style={styles.detoxSub}>
          {completed.length} completed sessions securely stored in your database
        </Text>
      </View>

      {/* Urge Surfing Quick Box */}
      <View style={styles.urgeBox}>
        <View style={styles.urgeTop}>
          <Text style={styles.urgeTitle}>Feeling an impulse to scroll?</Text>
          <Pill text="urge surfing" tone="default" />
        </View>
        <Text style={styles.urgeBody}>
          Dopamine cravings peak within 90 seconds. Neutralize the spike with a brief breath cycle or focus sprint.
        </Text>
        <View style={styles.urgeBtnRow}>
          <Button
            title="Start focus reset"
            onPress={onFocus}
            variant="dark"
            style={{ flex: 1 }}
          />
          <Button
            title="4-4-4-4 Breath"
            onPress={onOpenBreathing}
            variant="secondary"
            style={{ flex: 1 }}
          />
        </View>
      </View>

      <Text style={styles.section}>Protection plan</Text>
      <SettingRow
        title={`${plan.blockedApp} focus shield`}
        sub="During active focus sessions"
        status="Configured"
      />
      <SettingRow
        title={`Night cutoff · ${plan.blockedAfter}`}
        sub={`Protect the late-night ${plan.blockedApp} loop`}
        status="Planned"
      />
      <SettingRow
        title="Android native restriction"
        sub="Native Usage Access integration remains isolated from the core demo"
        status="Optional"
      />

      <Text style={styles.section}>Recent sessions</Text>
      {state.loading ? (
        <ActivityIndicator color={C.primary} />
      ) : (
        state.data.slice(0, 5).map(x => (
          <View key={x.id} style={styles.listRow}>
            <View>
              <Text style={styles.cardTitle}>
                {x.status === 'COMPLETED' ? 'Completed focus' : x.status}
              </Text>
              <Text style={styles.cardMeta}>
                {new Date(x.startedAt).toLocaleDateString()} · planned {x.plannedMinutes} min
              </Text>
            </View>
            <Text style={styles.scoreSmall}>{x.completedMinutes}m</Text>
          </View>
        ))
      )}
    </View>
  );
}

function Train({
  onRefresh,
  onStartFocus,
}: {
  onRefresh: () => Promise<void>;
  onStartFocus: () => void;
}) {
  const [category, setCategory] = useState<TrainCategory>('games');
  const [activeGame, setActiveGame] = useState<'chess' | 'sudoku' | 'mystery' | 'breathing' | null>(null);
  const [allGames, setGames] = useState<any[]>([]);
  const [packs, setPacks] = useState<any[]>([]);
  const [audio, setAudio] = useState<any[]>([]);
  const [answer, setAnswer] = useState<number | null>(null);
  const [savingPattern, setSavingPattern] = useState(false);

  const load = useCallback(async () => {
    try {
      const [g, p, a] = await Promise.all([games(), offlinePacks(), audioTracks()]);
      setGames(g);
      setPacks(p);
      setAudio(a);
    } catch (e: any) {
      Alert.alert('Train data', e?.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Handle recorded game score and XP persistence to backend
  const handleRecordGame = async (gameSlug: string, score: number, durationSec: number) => {
    const matched = allGames.find(x => x.slug === gameSlug) || allGames[0];
    if (matched) {
      try {
        await completeGame(matched.id, score, durationSec);
        await onRefresh();
      } catch (err: any) {
        console.warn('Game complete error:', err?.message);
      }
    }
  };

  const playPattern = async (pick: number) => {
    setAnswer(pick);
    if (pick !== 32) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      return;
    }
    const game = allGames.find(x => x.slug === 'pattern-lab') || allGames[0];
    if (!game) return;
    setSavingPattern(true);
    try {
      await completeGame(game.id, 900, 64);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      await onRefresh();
      Alert.alert('Pattern solved', `Score 900 · +${game.xpReward} XP saved to PostgreSQL.`);
    } catch (e: any) {
      Alert.alert('Could not save score', e?.message);
    } finally {
      setSavingPattern(false);
    }
  };

  const openPack = async (pack: any) => {
    try {
      const result = await downloadPack(pack.id);
      await Linking.openURL(assetUrl(result.pdfUrl));
    } catch (e: any) {
      Alert.alert('Download failed', e?.message);
    }
  };

  return (
    <View>
      <Text style={styles.pageTitle}>Cognitive Hub</Text>
      <Text style={styles.pageSub}>
        Replace the scrolling habit with interactive chess, sudoku, logic puzzles, breathwork, or calm audio.
      </Text>

      {/* Segmented Category Filter */}
      <View style={styles.trainTabs}>
        <Pressable
          style={[styles.trainTabBtn, category === 'games' && styles.trainTabBtnActive]}
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            setCategory('games');
          }}
        >
          <Text style={[styles.trainTabLabel, category === 'games' && styles.trainTabLabelActive]}>
            🎮 Games
          </Text>
        </Pressable>
        <Pressable
          style={[styles.trainTabBtn, category === 'breathe' && styles.trainTabBtnActive]}
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            setCategory('breathe');
          }}
        >
          <Text style={[styles.trainTabLabel, category === 'breathe' && styles.trainTabLabelActive]}>
            🧘 Breathwork
          </Text>
        </Pressable>
        <Pressable
          style={[styles.trainTabBtn, category === 'packs' && styles.trainTabBtnActive]}
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            setCategory('packs');
          }}
        >
          <Text style={[styles.trainTabLabel, category === 'packs' && styles.trainTabLabelActive]}>
            📦 Offline Packs
          </Text>
        </Pressable>
        <Pressable
          style={[styles.trainTabBtn, category === 'audio' && styles.trainTabBtnActive]}
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            setCategory('audio');
          }}
        >
          <Text style={[styles.trainTabLabel, category === 'audio' && styles.trainTabLabelActive]}>
            🎵 Soundscapes
          </Text>
        </Pressable>
      </View>

      {/* CATEGORY 1: MINDFUL GAMES */}
      {category === 'games' && (
        <View>
          {activeGame === 'chess' ? (
            <ChessGame
              onClose={() => setActiveGame(null)}
              onRecordGame={async (score, dur) => {
                await handleRecordGame('mentis-chess', score, dur);
              }}
            />
          ) : activeGame === 'sudoku' ? (
            <SudokuGame
              onClose={() => setActiveGame(null)}
              onRecordGame={async (score, dur) => {
                await handleRecordGame('sudoku-sprint', score, dur);
              }}
            />
          ) : activeGame === 'mystery' ? (
            <MysteryCaseGame
              onClose={() => setActiveGame(null)}
              onRecordGame={async (score, dur) => {
                await handleRecordGame('mystery-case', score, dur);
              }}
            />
          ) : (
            <View>
              {/* Featured 1: Mindful Chess */}
              <View style={styles.featuredGameCard}>
                <View style={styles.featuredTop}>
                  <View style={styles.tagGroup}>
                    <Pill text="playable in-app" tone="green" />
                    <Pill text="AI Bot + 2P" tone="default" />
                  </View>
                  <Text style={styles.xpBadge}>+50 XP</Text>
                </View>
                <Text style={styles.featuredTitle}>♟️ Mindful Chess</Text>
                <Text style={styles.featuredBody}>
                  Full 8x8 tactical chessboard. Play against the Mentis Mindful AI Bot (Novice, Tactical, Grandmaster) or Pass & Play with a colleague.
                </Text>
                <Button
                  title="Launch Chess Game →"
                  variant="dark"
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setActiveGame('chess');
                  }}
                  style={{ marginTop: 14 }}
                />
              </View>

              {/* Featured 2: Sudoku Sprint */}
              <View style={styles.featuredGameCard}>
                <View style={styles.featuredTop}>
                  <View style={styles.tagGroup}>
                    <Pill text="playable in-app" tone="green" />
                    <Pill text="Free API Connect" tone="default" />
                  </View>
                  <Text style={styles.xpBadge}>+30 XP</Text>
                </View>
                <Text style={styles.featuredTitle}>🧩 Sudoku Sprint</Text>
                <Text style={styles.featuredBody}>
                  Connects to free Sudoku puzzle APIs with automatic offline generation fallback. Features pencil notes, strike limits, smart hints, and difficulty tiers.
                </Text>
                <Button
                  title="Launch Sudoku Sprint →"
                  variant="dark"
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setActiveGame('sudoku');
                  }}
                  style={{ marginTop: 14 }}
                />
              </View>

              {/* Featured 3: Murder Mystery Mini-Game */}
              <View style={styles.featuredGameCard}>
                <View style={styles.featuredTop}>
                  <View style={styles.tagGroup}>
                    <Pill text="deductive reasoning" tone="default" />
                  </View>
                  <Text style={styles.xpBadge}>+35 XP</Text>
                </View>
                <Text style={styles.featuredTitle}>🕵️ Case #104: Midnight Archive</Text>
                <Text style={styles.featuredBody}>
                  Inspect 3 pieces of physical evidence, analyze suspect testimonies, catch the weather contradiction, and accuse the culprit.
                </Text>
                <Button
                  title="Investigate Case →"
                  variant="secondary"
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setActiveGame('mystery');
                  }}
                  style={{ marginTop: 14 }}
                />
              </View>

              {/* Featured 4: Pattern Lab */}
              <Text style={styles.section}>Quick Numeric Sprint</Text>
              <View style={styles.gameHero}>
                <Text style={styles.gameKicker}>PATTERN LAB · INSTANT LOGIC RESET</Text>
                <Text style={styles.gameTitle}>2 · 4 · 8 · 16 · ?</Text>
                <Text style={styles.gameBody}>
                  Choose the next number. A correct answer records a GameSession and XPEvent in PostgreSQL.
                </Text>
                <View style={styles.answerRow}>
                  {[24, 32, 34].map(v => (
                    <Pressable
                      key={v}
                      onPress={() => playPattern(v)}
                      style={[styles.answerBox, answer === v && styles.answerBoxActive]}
                    >
                      <Text style={styles.answerText}>{v}</Text>
                    </Pressable>
                  ))}
                </View>
                {savingPattern && <ActivityIndicator color="#fff" style={{ marginTop: 12 }} />}
              </View>
            </View>
          )}
        </View>
      )}

      {/* CATEGORY 2: ZEN BREATHWORK */}
      {category === 'breathe' && (
        <View>
          {activeGame === 'breathing' ? (
            <ZenBreathing
              onClose={() => setActiveGame(null)}
              onComplete={async mins => {
                await onRefresh();
              }}
            />
          ) : (
            <View style={styles.breathLauncherCard}>
              <Text style={styles.breathKicker}>NEURO-REGULATION</Text>
              <Text style={styles.breathTitle}>Conscious Breathwork</Text>
              <Text style={styles.breathBody}>
                Box breathing (4-4-4-4) lowers cortisol and restores sympathetic balance within 120 seconds. An ideal countermeasure for digital impulse.
              </Text>
              <Button
                title="Begin Breath Session →"
                variant="dark"
                onPress={() => setActiveGame('breathing')}
                style={{ marginTop: 18 }}
              />
            </View>
          )}
        </View>
      )}

      {/* CATEGORY 3: OFFLINE PACKS */}
      {category === 'packs' && (
        <View>
          <Text style={styles.section}>Printable Offline Packs</Text>
          <Text style={styles.microCopy}>
            Download the PDF pack, print it, and leave your screen completely behind.
          </Text>
          {packs.map(p => (
            <Pressable key={p.id} onPress={() => openPack(p)} style={styles.packCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{p.title}</Text>
                <Text style={styles.cardMeta}>
                  {p.difficulty} · {p.playersMin}-{p.playersMax} player(s) · {p.pageCount} pages · +{p.xpReward} XP
                </Text>
              </View>
              <Pill
                text={p.tier === 'FREE' ? 'download PDF' : 'premium'}
                tone={p.tier === 'FREE' ? 'green' : 'default'}
              />
            </Pressable>
          ))}
        </View>
      )}

      {/* CATEGORY 4: FOCUS AUDIO */}
      {category === 'audio' && (
        <View>
          <Text style={styles.section}>Focus Soundscapes</Text>
          <Text style={styles.microCopy}>
            Continuous acoustic soundscapes engineered to mask room noise and eliminate audio distraction.
          </Text>
          {audio.map(a => (
            <Pressable
              key={a.id}
              onPress={() => Linking.openURL(assetUrl(a.audioUrl))}
              style={styles.listRow}
            >
              <View>
                <Text style={styles.cardTitle}>{a.title}</Text>
                <Text style={styles.cardMeta}>{a.category} · studio mastered acoustic stream</Text>
              </View>
              <Text style={styles.play}>▶</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function Progress({ onRefresh }: { onRefresh: () => Promise<void> }) {
  const [moods, setMoods] = useState<any[]>([]);
  const [goalList, setGoals] = useState<any[]>([]);
  const [reflection, setReflection] = useState('Loading your weekly reflection…');

  const load = useCallback(async () => {
    try {
      const [m, g, r] = await Promise.all([moodHistory(), goals(), weeklyReflection()]);
      setMoods(m);
      setGoals(g);
      setReflection(r.text);
    } catch (e: any) {
      setReflection(e?.message || 'Could not load progress.');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const checkIn = async (mood: number) => {
    try {
      await addMood(mood, mood, Math.max(1, mood - 1), Math.max(1, 6 - mood));
      await load();
      await onRefresh();
      Alert.alert('Check-in saved', '+5 XP added to your account.');
    } catch (e: any) {
      Alert.alert('Could not save mood', e?.message);
    }
  };

  const ensureGoal = async () => {
    try {
      await createGoal({
        title: 'Read 30 books',
        category: 'Learning',
        target: 30,
        unit: 'books',
        frequency: 'yearly',
      });
      await load();
      await onRefresh();
    } catch (e: any) {
      Alert.alert('Could not create goal', e?.message);
    }
  };

  const addOne = async (goal: any) => {
    try {
      await logGoal(goal.id, 1);
      await load();
      await onRefresh();
      Alert.alert('Goal updated', '+1 progress and +10 XP.');
    } catch (e: any) {
      Alert.alert('Could not update goal', e?.message);
    }
  };

  const primaryGoal = goalList[0];
  const progress = primaryGoal ? primaryGoal.logs.reduce((s: number, x: any) => s + x.value, 0) : 0;
  const recent = moods.slice(0, 7).reverse();

  return (
    <View>
      <Text style={styles.pageTitle}>Progress</Text>
      <Text style={styles.pageSub}>
        Reflection combines what you actually did: focus blocks, mood check-ins, personal goals, games and XP.
      </Text>

      <Text style={styles.section}>Daily mood check-in</Text>
      <View style={styles.moodRow}>
        {[1, 2, 3, 4, 5].map(v => (
          <Pressable key={v} onPress={() => checkIn(v)} style={styles.mood}>
            <Text style={styles.moodEmoji}>{['😞', '😕', '😐', '🙂', '😄'][v - 1]}</Text>
            <Text style={styles.moodNumber}>{v}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.section}>7-day mood index</Text>
      <View style={styles.card}>
        <View style={styles.bars}>
          {recent.map((m, i) => (
            <View key={m.id || i} style={styles.barColumn}>
              <View style={[styles.bar, { height: 12 + m.mood * 13 }]} />
              <Text style={styles.barLabel}>{m.mood}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.cardMeta}>Self-reported reflection only — not a clinical measure.</Text>
      </View>

      <Text style={styles.section}>Personal goal</Text>
      {!primaryGoal ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>No active goal yet</Text>
          <Text style={styles.cardMeta}>
            Goals are optional modules; unused goals never clutter the dashboard.
          </Text>
          <Button
            title="Create demo reading goal"
            onPress={ensureGoal}
            variant="secondary"
            style={{ marginTop: 14 }}
          />
        </View>
      ) : (
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>{primaryGoal.title}</Text>
            <Text style={styles.bigInline}>
              {progress}/{primaryGoal.target}
            </Text>
          </View>
          <ProgressBar value={Math.min(1, progress / primaryGoal.target)} />
          <Button
            title={`Add 1 ${primaryGoal.unit}`}
            onPress={() => addOne(primaryGoal)}
            variant="secondary"
            style={{ marginTop: 14 }}
          />
        </View>
      )}

      <Text style={styles.section}>Mentis weekly reflection</Text>
      <View style={styles.insightCard}>
        <Text style={styles.insightKicker}>MENTIS NOTICED…</Text>
        <Text style={styles.insightBody}>{reflection}</Text>
      </View>
    </View>
  );
}

function Profile({ user, onReset }: { user: MentisUser; onReset: () => void }) {
  const [board, setBoard] = useState<any[]>([]);
  const [rewardData, setRewardData] = useState<any>({ xp: 0, level: 'Starter', unlocked: [] });
  const [challengeList, setChallenges] = useState<any[]>([]);

  const load = useCallback(async () => {
    try {
      const [b, r, c] = await Promise.all([leaderboard(), rewards(), challenges()]);
      setBoard(b);
      setRewardData(r);
      setChallenges(c);
    } catch (e: any) {
      Alert.alert('Community data', e?.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const join = async (id: string) => {
    try {
      await joinChallenge(id);
      Alert.alert('Challenge joined', 'Your participation is stored in the backend.');
    } catch (e: any) {
      Alert.alert('Could not join', e?.message);
    }
  };

  const share = () => {
    Share.share({
      message: `Mentis AI — ${rewardData.level} · ${rewardData.xp} XP. Taking my attention back, one reset at a time.`,
    });
  };

  return (
    <View>
      <View style={styles.profileHero}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>{user.displayName[0]}</Text>
        </View>
        <Text style={styles.profileName}>{user.displayName}</Text>
        <Text style={styles.handle}>@{user.username}</Text>
        <Pill text={`${rewardData.level} · ${rewardData.xp} XP`} tone="green" />
      </View>

      <Text style={styles.section}>Community leaderboard</Text>
      <View style={styles.card}>
        {board.length === 0 ? (
          <Text style={styles.cardMeta}>Complete activities to populate the leaderboard.</Text>
        ) : (
          board.slice(0, 10).map(row => (
            <View key={row.id || row.username} style={styles.leaderRow}>
              <Text style={styles.rank}>#{row.rank}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{row.displayName}</Text>
                <Text style={styles.cardMeta}>@{row.username}</Text>
              </View>
              <Text style={styles.scoreSmall}>{row.points} XP</Text>
            </View>
          ))
        )}
      </View>

      <Text style={styles.section}>Collectibles</Text>
      <View style={styles.collectGrid}>
        {rewardData.unlocked.map((link: any) => (
          <View key={link.id} style={styles.collectible}>
            <Text style={styles.collectibleMark}>◆</Text>
            <Text style={styles.collectibleTitle}>{link.collectible.title}</Text>
            <Text style={styles.collectibleMeta}>{link.collectible.rarity}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.section}>Active challenges</Text>
      {challengeList.map(c => (
        <View key={c.id} style={styles.packCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{c.title}</Text>
            <Text style={styles.cardMeta}>
              {c.description} · +{c.xpReward} XP
            </Text>
          </View>
          <Pressable onPress={() => join(c.id)}>
            <Text style={styles.joinText}>Join</Text>
          </Pressable>
        </View>
      ))}

      <Button
        title="Share my Mentis progress"
        onPress={share}
        variant="secondary"
        style={{ marginTop: 22 }}
      />
      <View style={styles.accountCard}>
        <Text style={styles.cardTitle}>Backend account</Text>
        <Text style={styles.cardMeta}>{user.email}</Text>
        <Text style={styles.cardMeta}>User ID: {user.id.slice(0, 12)}…</Text>
      </View>
      <Button
        title="Log out & restart onboarding"
        variant="ghost"
        onPress={onReset}
        style={{ marginTop: 12 }}
      />
    </View>
  );
}

function Pill({ text, tone = 'default' }: { text: string; tone?: 'default' | 'green' }) {
  return (
    <View style={[styles.pill, tone === 'green' && styles.pillGreen]}>
      <Text style={[styles.pillText, tone === 'green' && styles.pillTextGreen]}>{text}</Text>
    </View>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${Math.round(value * 100)}%` }]} />
    </View>
  );
}

function SettingRow({ title, sub, status }: { title: string; sub: string; status: string }) {
  return (
    <View style={styles.setting}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardMeta}>{sub}</Text>
      </View>
      <Pill text={status} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { minHeight: 600, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: C.muted, marginTop: 12, fontSize: 13 },
  appHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  copilotTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: C.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  copilotIcon: { fontSize: 13 },
  copilotText: { color: C.primary, fontSize: 11, fontWeight: '800' },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: C.primary, fontWeight: '900' },
  hello: { color: C.ink, fontSize: 29, fontWeight: '900', letterSpacing: -0.8, marginTop: 28 },
  handle: { color: C.muted, fontSize: 12, marginTop: 4, marginBottom: 8 },
  heroCard: { backgroundColor: C.dark, borderRadius: R.xl, padding: 21, marginTop: 16 },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroKicker: { color: '#9FB0CA', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  heroTitle: { color: '#fff', fontSize: 25, fontWeight: '900', letterSpacing: -0.7, marginTop: 16 },
  heroBody: { color: '#B8C5D8', fontSize: 13, lineHeight: 20, marginTop: 7 },
  heroActionRow: { marginTop: 18 },
  launchpadGrid: { flexDirection: 'row', gap: 10, marginTop: 4 },
  launchCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: R.md,
    padding: 13,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: 'center',
  },
  launchIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  launchIcon: { fontSize: 20 },
  launchTitle: { color: C.ink, fontSize: 12, fontWeight: '800' },
  launchSub: { color: C.muted, fontSize: 9, fontWeight: '600', marginTop: 2 },
  section: { color: C.text, fontWeight: '900', fontSize: 15, marginTop: 26, marginBottom: 10 },
  metricRow: { flexDirection: 'row', gap: 10 },
  insightCard: {
    backgroundColor: C.primarySoft,
    borderRadius: R.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: '#DCE3FF',
  },
  insightKicker: { color: C.primary, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  insightTitle: { color: C.ink, fontSize: 18, fontWeight: '900', marginTop: 10 },
  insightBody: { color: C.text, fontSize: 13, lineHeight: 20, marginTop: 7 },
  insightButtons: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 13 },
  textAction: { paddingVertical: 4 },
  textActionText: { color: C.primary, fontWeight: '800', fontSize: 12 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  card: { backgroundColor: C.card, borderRadius: R.lg, padding: 17, borderWidth: 1, borderColor: C.line },
  cardTitle: { color: C.text, fontSize: 13, fontWeight: '800' },
  cardMeta: { color: C.muted, fontSize: 11, lineHeight: 17, marginTop: 4 },
  bigInline: { color: C.ink, fontSize: 20, fontWeight: '900' },
  progressTrack: { height: 8, borderRadius: 99, backgroundColor: '#E6EAF2', overflow: 'hidden', marginTop: 12 },
  progressFill: { height: 8, borderRadius: 99, backgroundColor: C.primary },
  pageTitle: { color: C.ink, fontSize: 31, fontWeight: '900', letterSpacing: -0.8, marginTop: 28 },
  pageSub: { color: C.muted, fontSize: 14, lineHeight: 22, marginTop: 6 },
  detoxHero: { backgroundColor: C.greenSoft, borderRadius: R.xl, padding: 21, marginTop: 18 },
  detoxKicker: { color: C.green, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  detoxBig: { color: C.ink, fontSize: 35, fontWeight: '900', marginTop: 9 },
  detoxSub: { color: C.muted, fontSize: 12, marginTop: 4 },
  urgeBox: {
    backgroundColor: C.card,
    borderRadius: R.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: C.line,
    marginTop: 14,
  },
  urgeTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  urgeTitle: { color: C.ink, fontSize: 14, fontWeight: '800' },
  urgeBody: { color: C.muted, fontSize: 12, lineHeight: 18, marginTop: 6 },
  urgeBtnRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  setting: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  listRow: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.md,
    padding: 14,
    marginBottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  scoreSmall: { color: C.primary, fontWeight: '900', fontSize: 12 },
  trainTabs: {
    flexDirection: 'row',
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.line,
    padding: 4,
    marginTop: 16,
    marginBottom: 8,
  },
  trainTabBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 10,
  },
  trainTabBtnActive: {
    backgroundColor: C.primarySoft,
  },
  trainTabLabel: {
    color: C.muted,
    fontSize: 10,
    fontWeight: '700',
  },
  trainTabLabelActive: {
    color: C.primary,
    fontWeight: '900',
  },
  featuredGameCard: {
    backgroundColor: C.card,
    borderRadius: R.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: C.line,
    marginTop: 12,
  },
  featuredTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  xpBadge: {
    color: C.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  featuredTitle: {
    color: C.ink,
    fontSize: 19,
    fontWeight: '900',
    marginTop: 10,
  },
  featuredBody: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  breathLauncherCard: {
    backgroundColor: C.dark,
    borderRadius: R.xl,
    padding: 22,
    marginTop: 12,
  },
  breathKicker: {
    color: '#93C5FD',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  breathTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 8,
  },
  breathBody: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  gameHero: { backgroundColor: C.dark, borderRadius: R.xl, padding: 20, marginTop: 4 },
  gameKicker: { color: '#9FB0CA', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  gameTitle: { color: '#fff', fontSize: 28, fontWeight: '900', marginTop: 14 },
  gameBody: { color: '#B8C5D8', fontSize: 12, lineHeight: 18, marginTop: 7 },
  answerRow: { flexDirection: 'row', gap: 9, marginTop: 18 },
  answerBox: {
    flex: 1,
    minHeight: 54,
    borderRadius: R.md,
    backgroundColor: C.dark2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#28354A',
  },
  answerBoxActive: { backgroundColor: '#25345B', borderColor: '#748CF3' },
  answerText: { color: '#fff', fontWeight: '900', fontSize: 18 },
  microCopy: { color: C.muted, fontSize: 11, lineHeight: 17, marginTop: -5, marginBottom: 10 },
  packCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.md,
    padding: 14,
    marginBottom: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  play: { color: C.primary, fontSize: 18, fontWeight: '900' },
  moodRow: { flexDirection: 'row', gap: 7 },
  mood: {
    flex: 1,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 15,
    alignItems: 'center',
    paddingVertical: 11,
  },
  moodEmoji: { fontSize: 21 },
  moodNumber: { color: C.muted, fontSize: 9, fontWeight: '800', marginTop: 5 },
  bars: { height: 94, flexDirection: 'row', alignItems: 'flex-end', gap: 9, marginBottom: 8 },
  barColumn: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: '70%', borderRadius: 7, backgroundColor: C.primary },
  barLabel: { color: C.muted, fontSize: 9, marginTop: 5 },
  profileHero: { alignItems: 'center', paddingTop: 24 },
  profileAvatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: C.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: { color: '#fff', fontSize: 28, fontWeight: '900' },
  profileName: { color: C.ink, fontSize: 23, fontWeight: '900', marginTop: 13 },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  rank: { width: 27, color: C.primary, fontWeight: '900' },
  collectGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  collectible: {
    width: '48.5%',
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.md,
    padding: 14,
  },
  collectibleMark: { color: C.primary, fontSize: 19 },
  collectibleTitle: { color: C.ink, fontWeight: '900', fontSize: 12, marginTop: 8 },
  collectibleMeta: { color: C.muted, fontSize: 9, marginTop: 3 },
  joinText: { color: C.primary, fontWeight: '900', fontSize: 12 },
  accountCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.md,
    padding: 15,
    marginTop: 14,
  },
  pill: {
    borderRadius: 99,
    paddingHorizontal: 9,
    paddingVertical: 5,
    backgroundColor: C.primarySoft,
  },
  pillText: { color: C.primary, fontSize: 9, fontWeight: '900' },
  pillGreen: { backgroundColor: C.greenSoft },
  pillTextGreen: { color: C.green },
  nav: {
    flexDirection: 'row',
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 24,
    paddingHorizontal: 4,
    paddingVertical: 9,
    marginTop: 24,
  },
  navItem: { flex: 1, alignItems: 'center', gap: 5 },
  navDot: { width: 5, height: 5, borderRadius: 99, backgroundColor: '#D9DEE8' },
  navDotActive: { backgroundColor: C.primary },
  navText: { color: C.muted, fontSize: 9, fontWeight: '700' },
  navTextActive: { color: C.primary, fontWeight: '900' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(6,11,22,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: C.card,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: 34,
  },
  sheetHandle: {
    width: 42,
    height: 5,
    borderRadius: 99,
    backgroundColor: '#D8DDE7',
    alignSelf: 'center',
    marginBottom: 22,
  },
  sheetKicker: { color: C.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  sheetTitle: { color: C.ink, fontSize: 50, fontWeight: '900', letterSpacing: -2, marginTop: 8 },
  sheetBody: { color: C.muted, fontSize: 13, lineHeight: 20, marginTop: 8 },
  infoBox: { backgroundColor: C.primarySoft, borderRadius: R.md, padding: 13, marginTop: 16 },
  infoText: { color: C.text, fontSize: 11, lineHeight: 17, fontWeight: '600' },
});
