import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Brand } from '../components/Brand';
import { Button } from '../components/Button';
import { MetricCard } from '../components/MetricCard';
import { Screen } from '../components/Screen';
import { C, R } from '../theme';
import { MentisUser, StarterPlan } from '../types';

type Tab = 'Home' | 'Detox' | 'Train' | 'Progress' | 'Profile';

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

  return (
    <Screen contentStyle={{ paddingBottom: 18 }}>
      <View style={styles.appHeader}>
        <Brand compact />
        <View style={styles.avatar}><Text style={styles.avatarText}>{user.displayName[0]}</Text></View>
      </View>

      {tab === 'Home' && <Home user={user} plan={plan} />}
      {tab === 'Detox' && <Detox plan={plan} />}
      {tab === 'Train' && <Train />}
      {tab === 'Progress' && <Progress user={user} />}
      {tab === 'Profile' && <Profile user={user} onReset={onReset} />}

      <View style={styles.nav}>
        {(['Home','Detox','Train','Progress','Profile'] as Tab[]).map(t => (
          <Pressable key={t} onPress={() => { Haptics.selectionAsync().catch(() => {}); setTab(t); }} style={styles.navItem}>
            <View style={[styles.navDot, tab === t && styles.navDotActive]} />
            <Text style={[styles.navText, tab === t && styles.navTextActive]}>{t}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

function Home({ user, plan }: { user: MentisUser; plan: StarterPlan }) {
  const [focusOpen, setFocusOpen] = useState(false);
  const first = user.displayName.split(' ')[0];

  return (
    <View>
      <Text style={styles.hello}>Good morning, {first}.</Text>
      <Text style={styles.handle}>@{user.username}</Text>

      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <Text style={styles.heroKicker}>TODAY'S RESET</Text>
          <View style={styles.ready}><Text style={styles.readyText}>ready</Text></View>
        </View>
        <Text style={styles.heroTitle}>{plan.dailyFocusMinutes} minutes. One task.</Text>
        <Text style={styles.heroBody}>Mentis shields your chosen distractions while you focus.</Text>
        <Button title="Start focus session" variant="secondary" onPress={() => setFocusOpen(true)} style={{ marginTop: 20 }} />
      </View>

      <Text style={styles.section}>Today at a glance</Text>
      <View style={styles.metricRow}>
        <MetricCard value={`${user.draft.focusIndex}`} label="Focus index" hint="+4 this week" />
        <MetricCard value="4h 38m" label="Screen time" hint="−32m vs avg" />
      </View>

      <Text style={styles.section}>Your loop</Text>
      <Task done title="Morning focus reset" meta={`${plan.dailyFocusMinutes} min`} />
      <Task title="Pattern Lab" meta="2 min" />
      <Task title={`Shield ${plan.blockedApp}`} meta={`after ${plan.blockedAfter}`} />

      <Modal visible={focusOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetKicker}>FOCUS SHIELD</Text>
            <Text style={styles.sheetTitle}>{plan.dailyFocusMinutes}:00</Text>
            <Text style={styles.sheetBody}>{plan.blockedApp} will be treated as restricted in this prototype session.</Text>
            <View style={styles.sheetInfo}><Text style={styles.sheetInfoText}>Native app blocking is connected in the Android sprint later.</Text></View>
            <Button title="End demo session" onPress={() => setFocusOpen(false)} variant="dark" style={{ marginTop: 20 }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Task({ title, meta, done }: { title: string; meta: string; done?: boolean }) {
  return (
    <View style={styles.task}>
      <View style={[styles.taskCheck, done && styles.taskCheckDone]}>{done && <Text style={styles.checkText}>✓</Text>}</View>
      <View style={{ flex: 1 }}><Text style={styles.taskTitle}>{title}</Text><Text style={styles.taskMeta}>{meta}</Text></View>
      <Text style={styles.chev}>›</Text>
    </View>
  );
}

function Detox({ plan }: { plan: StarterPlan }) {
  const [shield, setShield] = useState(true);
  const [night, setNight] = useState(true);
  const [strict, setStrict] = useState(false);

  return (
    <View>
      <Text style={styles.pageTitle}>Detox</Text>
      <Text style={styles.pageSub}>Choose the moments Mentis should protect — not your entire phone.</Text>

      <View style={styles.detoxHero}>
        <Text style={styles.detoxKicker}>THIS WEEK</Text>
        <Text style={styles.detoxBig}>2h 14m</Text>
        <Text style={styles.detoxSub}>estimated distraction time avoided</Text>
      </View>

      <Text style={styles.section}>Protection rules</Text>
      <Setting title={`${plan.blockedApp} focus shield`} sub="During active focus sessions" value={shield} onChange={setShield} />
      <Setting title={`Night cutoff · ${plan.blockedAfter}`} sub={`Prompt before opening ${plan.blockedApp}`} value={night} onChange={setNight} />
      <Setting title="Strict mode" sub="No override during a session" value={strict} onChange={setStrict} />

      <View style={styles.nativeNote}>
        <Text style={styles.nativeTitle}>Native integration</Text>
        <Text style={styles.nativeText}>Expo Go can demo this UX. Real app blocking and screen-time access will be implemented as the Android native module in Sprint 2.</Text>
      </View>
    </View>
  );
}

function Setting({ title, sub, value, onChange }: { title: string; sub: string; value: boolean; onChange: (v:boolean)=>void }) {
  return (
    <View style={styles.setting}>
      <View style={{ flex: 1 }}><Text style={styles.settingTitle}>{title}</Text><Text style={styles.settingSub}>{sub}</Text></View>
      <Switch value={value} onValueChange={onChange} trackColor={{ false: '#D7DCE5', true: '#AEBDF8' }} thumbColor={value ? C.primary : '#fff'} />
    </View>
  );
}

function Train() {
  const [open, setOpen] = useState(false);

  return (
    <View>
      <Text style={styles.pageTitle}>Train</Text>
      <Text style={styles.pageSub}>Short challenges designed to replace the urge to scroll, not become another endless feed.</Text>

      <Pressable style={styles.featureGame} onPress={() => setOpen(true)}>
        <Text style={styles.gameKicker}>RECOMMENDED · 2 MIN</Text>
        <Text style={styles.gameTitle}>Pattern Lab</Text>
        <Text style={styles.gameBody}>Spot sequences, ignore noise, move up when accuracy stays high.</Text>
        <View style={styles.playPill}><Text style={styles.playText}>Play now</Text></View>
      </Pressable>

      <Text style={styles.section}>More challenges</Text>
      <GameRow title="Memory Grid" sub="Working memory · 3 min" status="Ready" />
      <GameRow title="Reaction Shift" sub="Selective attention · 2 min" status="Ready" />
      <GameRow title="Case Files" sub="Deduction stories · later sprint" status="Soon" />

      <Modal visible={open} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetKicker}>PATTERN LAB</Text>
            <Text style={styles.sheetTitleSmall}>●  ▲  ■  ●  ▲  ?</Text>
            <Text style={styles.sheetBody}>Your full playable version connects here. The onboarding already includes the first working pattern challenge.</Text>
            <Button title="Close" onPress={() => setOpen(false)} variant="dark" style={{ marginTop: 22 }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

function GameRow({ title, sub, status }: { title: string; sub: string; status: string }) {
  return (
    <View style={styles.gameRow}>
      <View style={styles.gameGlyph} />
      <View style={{ flex: 1 }}><Text style={styles.gameRowTitle}>{title}</Text><Text style={styles.gameRowSub}>{sub}</Text></View>
      <Text style={styles.gameStatus}>{status}</Text>
    </View>
  );
}

function Progress({ user }: { user: MentisUser }) {
  const values = [72, 58, 66, 45, 51, 38, 42];
  return (
    <View>
      <Text style={styles.pageTitle}>Progress</Text>
      <Text style={styles.pageSub}>Show improvement without turning wellbeing into another pressure metric.</Text>

      <View style={styles.progressTop}>
        <Text style={styles.progressLabel}>7-DAY SCREEN TIME</Text>
        <Text style={styles.progressBig}>−11%</Text>
        <Text style={styles.progressSmall}>compared with your starting week</Text>
        <View style={styles.bars}>
          {values.map((v,i)=><View key={i} style={styles.barSlot}><View style={[styles.bar,{height:v}]} /></View>)}
        </View>
        <View style={styles.days}>{['M','T','W','T','F','S','S'].map((d,i)=><Text key={i} style={styles.day}>{d}</Text>)}</View>
      </View>

      <Text style={styles.section}>Mind training</Text>
      <View style={styles.metricRow}>
        <MetricCard value={`${user.draft.focusIndex}`} label="Focus index" hint="baseline saved" />
        <MetricCard value="6" label="Day streak" hint="best: 8 days" />
      </View>
    </View>
  );
}

function Profile({ user, onReset }: { user: MentisUser; onReset: () => void }) {
  return (
    <View>
      <Text style={styles.pageTitle}>Profile</Text>
      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}><Text style={styles.profileLetter}>{user.displayName[0]}</Text></View>
        <Text style={styles.profileName}>{user.displayName}</Text>
        <Text style={styles.profileUser}>@{user.username}</Text>
        <Text style={styles.profileEmail}>{user.email}</Text>
      </View>

      <Text style={styles.section}>Your goals</Text>
      <View style={styles.goalWrap}>
        {user.draft.goals.map(g=><View key={g} style={styles.goalPill}><Text style={styles.goalPillText}>{g}</Text></View>)}
      </View>

      <View style={styles.profileNote}>
        <Text style={styles.profileNoteTitle}>Account architecture</Text>
        <Text style={styles.profileNoteText}>For this update, login and persistence are local so Expo Go works instantly. In Sprint 2 the same data moves to NestJS + PostgreSQL after Google OAuth.</Text>
      </View>

      <Button title="Reset demo and onboarding" variant="ghost" onPress={onReset} style={{ marginTop: 22 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  appHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.primarySoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: C.primary, fontWeight: '900' },
  hello: { color: C.ink, fontSize: 29, fontWeight: '900', letterSpacing: -0.8, marginTop: 34 },
  handle: { color: C.muted, fontSize: 12, marginTop: 3 },
  heroCard: { backgroundColor: C.dark, borderRadius: R.xl, padding: 21, marginTop: 22 },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroKicker: { color: '#9FB0CA', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  ready: { backgroundColor: '#22334A', borderRadius: 99, paddingHorizontal: 9, paddingVertical: 5 },
  readyText: { color: '#A9E5D1', fontSize: 10, fontWeight: '850' },
  heroTitle: { color: '#fff', fontSize: 25, fontWeight: '900', letterSpacing: -0.7, marginTop: 18 },
  heroBody: { color: '#B8C5D8', fontSize: 13, lineHeight: 20, marginTop: 7 },
  section: { color: C.text, fontWeight: '900', fontSize: 15, marginTop: 27, marginBottom: 10 },
  metricRow: { flexDirection: 'row', gap: 10 },
  task: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.line },
  taskCheck: { width: 22, height: 22, borderRadius: 8, borderWidth: 1.5, borderColor: '#CDD3DE', alignItems: 'center', justifyContent: 'center' },
  taskCheckDone: { backgroundColor: C.greenSoft, borderColor: '#BCE5D7' },
  checkText: { color: C.green, fontWeight: '900', fontSize: 12 },
  taskTitle: { color: C.text, fontSize: 13, fontWeight: '800' },
  taskMeta: { color: C.muted, fontSize: 11, marginTop: 3 },
  chev: { color: '#A4ADBA', fontSize: 24 },
  nav: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: C.line, marginTop: 30, paddingTop: 14 },
  navItem: { alignItems: 'center', minWidth: 55 },
  navDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: 'transparent', marginBottom: 6 },
  navDotActive: { backgroundColor: C.primary },
  navText: { color: C.muted, fontSize: 10, fontWeight: '750' },
  navTextActive: { color: C.ink },
  pageTitle: { color: C.ink, fontSize: 30, fontWeight: '900', letterSpacing: -0.8, marginTop: 34 },
  pageSub: { color: C.muted, fontSize: 14, lineHeight: 21, marginTop: 8 },
  detoxHero: { marginTop: 23, backgroundColor: C.greenSoft, borderRadius: R.xl, padding: 21 },
  detoxKicker: { color: C.green, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  detoxBig: { color: C.ink, fontSize: 34, fontWeight: '900', marginTop: 9, letterSpacing: -1 },
  detoxSub: { color: C.muted, fontSize: 12, marginTop: 3 },
  setting: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card, borderRadius: R.lg, borderWidth: 1, borderColor: C.line, padding: 16, marginBottom: 9 },
  settingTitle: { color: C.text, fontSize: 13, fontWeight: '850' },
  settingSub: { color: C.muted, fontSize: 11, marginTop: 4 },
  nativeNote: { backgroundColor: C.amberSoft, borderRadius: R.lg, padding: 16, marginTop: 14 },
  nativeTitle: { color: C.amber, fontSize: 12, fontWeight: '900' },
  nativeText: { color: C.muted, fontSize: 11, lineHeight: 17, marginTop: 5 },
  featureGame: { backgroundColor: C.dark, borderRadius: R.xl, padding: 21, marginTop: 22 },
  gameKicker: { color: '#94A6C5', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  gameTitle: { color: '#fff', fontSize: 28, fontWeight: '900', marginTop: 11 },
  gameBody: { color: '#B9C6D7', fontSize: 12, lineHeight: 19, marginTop: 7, maxWidth: 290 },
  playPill: { alignSelf: 'flex-start', backgroundColor: '#fff', paddingHorizontal: 13, paddingVertical: 9, borderRadius: 99, marginTop: 20 },
  playText: { color: C.dark, fontSize: 11, fontWeight: '900' },
  gameRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: C.line },
  gameGlyph: { width: 38, height: 38, borderRadius: 12, backgroundColor: C.primarySoft },
  gameRowTitle: { color: C.text, fontSize: 13, fontWeight: '850' },
  gameRowSub: { color: C.muted, fontSize: 10, marginTop: 3 },
  gameStatus: { color: C.primary, fontSize: 10, fontWeight: '850' },
  progressTop: { marginTop: 23, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: R.xl, padding: 19 },
  progressLabel: { color: C.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  progressBig: { color: C.green, fontSize: 35, fontWeight: '900', marginTop: 8 },
  progressSmall: { color: C.muted, fontSize: 11, marginTop: 1 },
  bars: { height: 82, flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 20 },
  barSlot: { flex: 1, height: 82, justifyContent: 'flex-end', backgroundColor: '#F1F3F7', borderRadius: 8, overflow: 'hidden' },
  bar: { backgroundColor: '#AFC0FF', width: '100%', borderRadius: 8 },
  days: { flexDirection: 'row', gap: 8, marginTop: 7 },
  day: { flex: 1, textAlign: 'center', color: C.muted, fontSize: 9, fontWeight: '700' },
  profileCard: { marginTop: 22, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: R.xl, padding: 22, alignItems: 'center' },
  profileAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: C.primarySoft, alignItems: 'center', justifyContent: 'center' },
  profileLetter: { color: C.primary, fontSize: 25, fontWeight: '900' },
  profileName: { color: C.ink, fontSize: 20, fontWeight: '900', marginTop: 12 },
  profileUser: { color: C.primary, fontSize: 12, fontWeight: '800', marginTop: 3 },
  profileEmail: { color: C.muted, fontSize: 11, marginTop: 6 },
  goalWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  goalPill: { backgroundColor: C.primarySoft, paddingHorizontal: 11, paddingVertical: 8, borderRadius: 99 },
  goalPillText: { color: C.primary, fontSize: 11, fontWeight: '800' },
  profileNote: { backgroundColor: C.blueSoft, borderRadius: R.lg, padding: 16, marginTop: 24 },
  profileNoteTitle: { color: C.text, fontSize: 12, fontWeight: '900' },
  profileNoteText: { color: C.muted, fontSize: 11, lineHeight: 17, marginTop: 5 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(8,14,24,0.42)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: C.bg, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 22, paddingBottom: 34 },
  sheetHandle: { width: 42, height: 5, borderRadius: 3, backgroundColor: '#CED4DE', alignSelf: 'center', marginBottom: 24 },
  sheetKicker: { color: C.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  sheetTitle: { color: C.ink, fontSize: 54, fontWeight: '900', letterSpacing: -2, marginTop: 8 },
  sheetTitleSmall: { color: C.ink, fontSize: 28, fontWeight: '900', marginTop: 16, letterSpacing: 1 },
  sheetBody: { color: C.muted, fontSize: 13, lineHeight: 20, marginTop: 9 },
  sheetInfo: { backgroundColor: C.amberSoft, borderRadius: R.md, padding: 13, marginTop: 16 },
  sheetInfoText: { color: C.amber, fontSize: 11, lineHeight: 17, fontWeight: '700' },
});
