import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Button } from '../components/Button';
import { ProgressHeader } from '../components/ProgressHeader';
import { Screen } from '../components/Screen';
import { C, R } from '../theme';
import { DraftProfile } from '../types';

type Q = { prompt: string; visual: string[]; answers: string[]; correct: string; hint: string };

const questions: Q[] = [
  {
    prompt: 'What comes next?',
    visual: ['●', '▲', '■', '●', '▲', '■', '●', '▲'],
    answers: ['■', '●', '▲'],
    correct: '■',
    hint: 'Pattern recognition',
  },
  {
    prompt: 'Which number breaks the pattern?',
    visual: ['2', '4', '6', '9', '10', '12'],
    answers: ['6', '9', '10'],
    correct: '9',
    hint: 'Selective attention',
  },
  {
    prompt: 'Pick the odd symbol.',
    visual: ['◆', '◆', '◆', '◇', '◆', '◆'],
    answers: ['◆', '◇', '○'],
    correct: '◇',
    hint: 'Visual scanning',
  },
];

export function AssessmentScreen({
  draft,
  finish,
}: {
  draft: DraftProfile;
  finish: (draft: DraftProfile) => void;
}) {
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const q = questions[index];

  const pick = (answer: string) => {
    const isCorrect = answer === q.correct;
    Haptics.notificationAsync(isCorrect ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Warning).catch(() => {});
    const totalCorrect = correct + (isCorrect ? 1 : 0);

    if (index < questions.length - 1) {
      setCorrect(totalCorrect);
      setTimeout(() => setIndex(i => i + 1), 170);
      return;
    }

    const usagePenalty = draft.screenTime === '6h+' ? 10 : draft.screenTime === '4–6h' ? 6 : 2;
    const focusIndex = Math.max(48, Math.min(91, 58 + totalCorrect * 11 - usagePenalty));
    const cognitiveAge = Math.max(18, 25 - totalCorrect - (focusIndex > 75 ? 2 : 0));

    finish({
      ...draft,
      assessmentCorrect: totalCorrect,
      focusIndex,
      cognitiveAge,
    });
  };

  return (
    <Screen>
      <ProgressHeader step={3} />
      <View style={styles.topRow}>
        <View>
          <Text style={styles.kicker}>FOCUS CHECK</Text>
          <Text style={styles.counter}>{index + 1} / {questions.length}</Text>
        </View>
        <Text style={styles.hint}>{q.hint}</Text>
      </View>

      <Text style={styles.title}>{q.prompt}</Text>
      <View style={styles.challenge}>
        <View style={styles.visual}>
          {q.visual.map((v, i) => <View key={`${v}-${i}`} style={styles.cell}><Text style={styles.symbol}>{v}</Text></View>)}
          {index === 0 && <View style={[styles.cell, styles.questionCell]}><Text style={styles.question}>?</Text></View>}
        </View>
      </View>

      <Text style={styles.choose}>Choose quickly. First instinct is fine.</Text>
      <View style={styles.answers}>
        {q.answers.map(a => (
          <Pressable key={a} style={({ pressed }) => [styles.answer, pressed && styles.answerPressed]} onPress={() => pick(a)}>
            <Text style={styles.answerText}>{a}</Text>
          </Pressable>
        ))}
      </View>

      <View style={{ flex: 1, minHeight: 40 }} />
      <Text style={styles.disclaimer}>This is a gamified baseline, not a medical or psychological assessment.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { marginTop: 38, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  kicker: { color: C.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  counter: { color: C.muted, fontSize: 12, fontWeight: '800', marginTop: 5 },
  hint: { color: C.muted, fontSize: 12, fontWeight: '700' },
  title: { color: C.ink, fontSize: 31, fontWeight: '900', letterSpacing: -0.8, marginTop: 18 },
  challenge: { marginTop: 25, backgroundColor: C.dark, borderRadius: R.xl, padding: 22, minHeight: 220, justifyContent: 'center' },
  visual: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, justifyContent: 'center' },
  cell: { width: 58, height: 58, borderRadius: 17, backgroundColor: C.dark2, alignItems: 'center', justifyContent: 'center' },
  questionCell: { backgroundColor: '#25345B' },
  symbol: { color: '#F3F6FF', fontSize: 25, fontWeight: '900' },
  question: { color: '#8EA6FF', fontSize: 24, fontWeight: '900' },
  choose: { color: C.muted, fontSize: 12, marginTop: 22 },
  answers: { flexDirection: 'row', gap: 10, marginTop: 10 },
  answer: { flex: 1, minHeight: 66, backgroundColor: C.card, borderRadius: R.md, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  answerPressed: { backgroundColor: C.primarySoft, borderColor: '#BEC9FA' },
  answerText: { color: C.ink, fontSize: 23, fontWeight: '900' },
  disclaimer: { color: C.muted, textAlign: 'center', fontSize: 11, lineHeight: 16 },
});
