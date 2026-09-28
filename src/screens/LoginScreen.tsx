import React, { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/Button';
import { ProgressHeader } from '../components/ProgressHeader';
import { Screen } from '../components/Screen';
import { C, R } from '../theme';
import { DraftProfile, MentisUser } from '../types';
import { signInWithGoogleDemo } from '../services/authService';

export function LoginScreen({
  draft,
  onUser,
}: {
  draft: DraftProfile;
  onUser: (user: MentisUser) => void;
}) {
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);
    try {
      const user = await signInWithGoogleDemo(draft);
      onUser(user);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ProgressHeader step={4} />
      <View style={styles.hero}>
        <View style={styles.score}>
          <Text style={styles.scoreLabel}>YOUR STARTING FOCUS INDEX</Text>
          <Text style={styles.scoreValue}>{draft.focusIndex}</Text>
          <Text style={styles.scoreNote}>{draft.assessmentCorrect}/3 focus checks completed</Text>
        </View>

        <Text style={styles.title}>Save this baseline to your account.</Text>
        <Text style={styles.subtitle}>
          Your answers are already stored locally. Sign in and Mentis will attach them to your account, generate a username, and build your plan.
        </Text>
      </View>

      <View style={styles.googleWrap}>
        <Button title="Continue with Google" onPress={login} loading={loading} variant="dark" />
        <Text style={styles.demo}>Classroom demo mode — no Google Cloud setup required yet.</Text>
      </View>

      <View style={styles.dataCard}>
        <Text style={styles.dataTitle}>What will be saved</Text>
        <Text style={styles.dataLine}>Goals · app habits · screen-time range · focus baseline</Text>
        <Text style={styles.dataSmall}>No passwords or private app content are collected in this prototype.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { marginTop: 38 },
  score: { backgroundColor: C.primarySoft, borderRadius: R.xl, padding: 22, alignItems: 'center' },
  scoreLabel: { color: C.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  scoreValue: { color: C.ink, fontSize: 58, fontWeight: '900', letterSpacing: -2, marginTop: 3 },
  scoreNote: { color: C.muted, fontSize: 12, marginTop: 2, fontWeight: '700' },
  title: { color: C.ink, fontSize: 29, lineHeight: 35, fontWeight: '900', letterSpacing: -0.8, marginTop: 28 },
  subtitle: { color: C.muted, fontSize: 15, lineHeight: 23, marginTop: 10 },
  googleWrap: { marginTop: 30 },
  demo: { color: C.muted, textAlign: 'center', fontSize: 11, marginTop: 11 },
  dataCard: { marginTop: 24, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: R.lg, padding: 17 },
  dataTitle: { color: C.text, fontWeight: '850', fontSize: 13 },
  dataLine: { color: C.muted, fontSize: 12, lineHeight: 18, marginTop: 6 },
  dataSmall: { color: C.muted, fontSize: 10, lineHeight: 15, marginTop: 9 },
});
