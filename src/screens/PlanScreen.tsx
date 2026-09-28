import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Brand } from '../components/Brand';
import { Screen } from '../components/Screen';
import { C, R } from '../theme';
import { DraftProfile, MentisUser, StarterPlan } from '../types';

export function PlanScreen({
  user,
  draft,
  plan,
  onStart,
}: {
  user: MentisUser;
  draft: DraftProfile;
  plan: StarterPlan;
  onStart: () => void;
}) {
  return (
    <Screen>
      <Brand compact />
      <Text style={styles.kicker}>PLAN 01 · START SMALL</Text>
      <Text style={styles.title}>You're ready, @{user.username}.</Text>
      <Text style={styles.subtitle}>{plan.reason}</Text>

      <View style={styles.scoreRow}>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreValue}>{draft.focusIndex}</Text>
          <Text style={styles.scoreLabel}>Focus index</Text>
        </View>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreValue}>{draft.cognitiveAge}</Text>
          <Text style={styles.scoreLabel}>Cognitive age*</Text>
        </View>
      </View>

      <Text style={styles.section}>Your first 7 days</Text>
      <View style={styles.planCard}>
        <PlanRow n="01" title={`${plan.dailyFocusMinutes} min focus reset`} sub="One focused block before you ask for more." />
        <View style={styles.sep} />
        <PlanRow n="02" title={`Shield ${plan.blockedApp} after ${plan.blockedAfter}`} sub="Protect the time where scrolling usually wins." />
        <View style={styles.sep} />
        <PlanRow n="03" title={`${plan.dailyChallenges} brain challenges / day`} sub="Short enough to finish. Hard enough to engage." />
      </View>

      <View style={styles.note}>
        <Text style={styles.noteTitle}>This plan will adapt.</Text>
        <Text style={styles.noteText}>Later the NestJS backend will recalculate it from real progress and screen-time data.</Text>
      </View>

      <Button title="Start Mentis" onPress={onStart} style={{ marginTop: 28 }} />
      <Text style={styles.disclaimer}>*Gamified estimate for the prototype, not a clinical measure.</Text>
    </Screen>
  );
}

function PlanRow({ n, title, sub }: { n: string; title: string; sub: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.n}>{n}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSub}>{sub}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  kicker: { color: C.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.1, marginTop: 42 },
  title: { color: C.ink, fontSize: 32, fontWeight: '900', letterSpacing: -0.9, marginTop: 9 },
  subtitle: { color: C.muted, fontSize: 14, lineHeight: 21, marginTop: 10 },
  scoreRow: { flexDirection: 'row', gap: 10, marginTop: 26 },
  scoreCard: { flex: 1, backgroundColor: C.primarySoft, borderRadius: R.lg, padding: 17 },
  scoreValue: { color: C.ink, fontSize: 29, fontWeight: '900' },
  scoreLabel: { color: C.muted, fontSize: 11, fontWeight: '700', marginTop: 3 },
  section: { color: C.text, fontSize: 15, fontWeight: '900', marginTop: 28, marginBottom: 10 },
  planCard: { backgroundColor: C.card, borderRadius: R.xl, borderWidth: 1, borderColor: C.line, paddingHorizontal: 17 },
  row: { flexDirection: 'row', gap: 13, paddingVertical: 17 },
  n: { color: C.primary, fontSize: 11, fontWeight: '900', marginTop: 2 },
  rowTitle: { color: C.text, fontSize: 14, fontWeight: '850' },
  rowSub: { color: C.muted, fontSize: 11, lineHeight: 17, marginTop: 4 },
  sep: { height: 1, backgroundColor: C.line },
  note: { marginTop: 16, backgroundColor: C.blueSoft, borderRadius: R.lg, padding: 16 },
  noteTitle: { color: C.text, fontSize: 13, fontWeight: '850' },
  noteText: { color: C.muted, fontSize: 11, lineHeight: 17, marginTop: 5 },
  disclaimer: { color: C.muted, fontSize: 10, textAlign: 'center', marginTop: 11 },
});
