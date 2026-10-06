import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { Chip } from '../components/Chip';
import { ProgressHeader } from '../components/ProgressHeader';
import { Screen } from '../components/Screen';
import { C } from '../theme';
import { DraftProfile, Goal } from '../types';

const options: { title: Goal; sub: string }[] = [
  { title: 'Reduce scrolling', sub: 'Stop opening apps without thinking.' },
  { title: 'Improve focus', sub: 'Stay with one task for longer.' },
  { title: 'Study better', sub: 'Protect study blocks from interruptions.' },
  { title: 'Sleep better', sub: 'Create calmer evenings and fewer late-night checks.' },
];

export function GoalsScreen({
  draft,
  setDraft,
  onNext,
}: {
  draft: DraftProfile;
  setDraft: (draft: DraftProfile) => void;
  onNext: () => void;
}) {
  const toggle = (goal: Goal) => {
    const goals = draft.goals.includes(goal) ? draft.goals.filter(g => g !== goal) : [...draft.goals, goal];
    setDraft({ ...draft, goals });
  };

  return (
    <Screen>
      <ProgressHeader step={1} />
      <Text style={styles.title}>What do you want back?</Text>
      <Text style={styles.subtitle}>Choose everything that feels true. We'll keep the plan small anyway.</Text>

      <View style={styles.cards}>
        {options.map(o => {
          const selected = draft.goals.includes(o.title);
          return (
            <View key={o.title} style={[styles.goalCard, selected && styles.goalCardSelected]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.goalTitle, selected && styles.goalTitleSelected]}>{o.title}</Text>
                <Text style={styles.goalSub}>{o.sub}</Text>
              </View>
              <Chip label={selected ? 'Selected' : 'Choose'} selected={selected} onPress={() => toggle(o.title)} />
            </View>
          );
        })}
      </View>

      <View style={{ flex: 1, minHeight: 28 }} />
      <Button title="Continue" onPress={onNext} disabled={draft.goals.length === 0} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: C.ink, fontSize: 31, fontWeight: '900', letterSpacing: -0.8, marginTop: 42 },
  subtitle: { color: C.muted, fontSize: 15, lineHeight: 22, marginTop: 10 },
  cards: { gap: 11, marginTop: 26 },
  goalCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 20, padding: 16 },
  goalCardSelected: { borderColor: '#C8D3FF', backgroundColor: '#FBFCFF' },
  goalTitle: { color: C.text, fontSize: 16, fontWeight: '800' },
  goalTitleSelected: { color: C.primary },
  goalSub: { color: C.muted, fontSize: 12, lineHeight: 18, marginTop: 4, paddingRight: 6 },
});
