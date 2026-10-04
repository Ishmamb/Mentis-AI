import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { ProgressHeader } from '../components/ProgressHeader';
import { Screen } from '../components/Screen';
import { C, R } from '../theme';
import { DraftProfile, ScreenTime } from '../types';

const times: ScreenTime[] = ['< 2h', '2–4h', '4–6h', '6h+'];
const apps = ['Instagram', 'TikTok', 'YouTube', 'Facebook', 'Reddit', 'X / Twitter'];

export function HabitsScreen({
  draft,
  setDraft,
  onNext,
}: {
  draft: DraftProfile;
  setDraft: (draft: DraftProfile) => void;
  onNext: () => void;
}) {
  const toggleApp = (app: string) => {
    const next = draft.apps.includes(app) ? draft.apps.filter(a => a !== app) : [...draft.apps, app];
    setDraft({ ...draft, apps: next.slice(0, 4) });
  };

  return (
    <Screen>
      <ProgressHeader step={2} />
      <Text style={styles.title}>A quick habit snapshot.</Text>
      <Text style={styles.subtitle}>No judgment. We only use this to set a realistic starting point.</Text>

      <Text style={styles.label}>Daily phone time</Text>
      <View style={styles.wrap}>
        {times.map(t => <Chip key={t} label={t} selected={draft.screenTime === t} onPress={() => setDraft({ ...draft, screenTime: t })} />)}
      </View>

      <Text style={styles.label}>Apps that pull you in most</Text>
      <Text style={styles.helper}>Choose up to four.</Text>
      <View style={styles.wrap}>
        {apps.map(a => <Chip key={a} label={a} selected={draft.apps.includes(a)} onPress={() => toggleApp(a)} />)}
      </View>

      <View style={styles.insight}>
        <Text style={styles.insightKicker}>WHY WE ASK</Text>
        <Text style={styles.insightText}>Your first plan should target one high-friction moment, not your whole phone.</Text>
      </View>

      <View style={{ flex: 1, minHeight: 34 }} />
      <Button title="Take a 30-sec focus check" onPress={onNext} disabled={!draft.screenTime || draft.apps.length === 0} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: C.ink, fontSize: 31, fontWeight: '900', letterSpacing: -0.8, marginTop: 42 },
  subtitle: { color: C.muted, fontSize: 15, lineHeight: 22, marginTop: 10 },
  label: { color: C.text, fontSize: 15, fontWeight: '850', marginTop: 30, marginBottom: 11 },
  helper: { color: C.muted, fontSize: 12, marginTop: -5, marginBottom: 11 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  insight: { backgroundColor: C.blueSoft, borderRadius: R.lg, padding: 17, marginTop: 30 },
  insightKicker: { color: C.primary, fontSize: 10, letterSpacing: 1, fontWeight: '900' },
  insightText: { color: C.text, lineHeight: 20, fontSize: 13, fontWeight: '650', marginTop: 7 },
});
