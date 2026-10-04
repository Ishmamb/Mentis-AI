import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '../components/Button';
import { ProgressHeader } from '../components/ProgressHeader';
import { Screen } from '../components/Screen';
import { completeOnboarding, getOnboarding, login, register } from '../services/backend';
import { C, R } from '../theme';
import { DraftProfile, MentisUser, StarterPlan } from '../types';

export function LoginScreen({
  draft,
  onAuthenticated,
}: {
  draft: DraftProfile;
  onAuthenticated: (user: MentisUser, plan: StarterPlan) => void;
}) {
  const [name, setName] = useState('Mentis Student');
  const [email, setEmail] = useState('student@mentis.app');
  const [password, setPassword] = useState('Mentis123!');
  const [loading, setLoading] = useState(false);

  const create = async () => {
    setLoading(true);
    try {
      const user = await register(email, name, password);
      const result = await completeOnboarding(draft);
      onAuthenticated(user, result.plan);
    } catch (e: any) {
      Alert.alert('Could not create account', e?.message || 'Please check the API connection.');
    } finally {
      setLoading(false);
    }
  };

  const demo = async () => {
    setLoading(true);
    try {
      const user = await login('demo@mentis.app', 'Mentis123!');
      const saved = await getOnboarding();
      if (!saved.plan) throw new Error('Seeded demo plan was not found. Run npm run db:seed.');
      onAuthenticated(user, saved.plan);
    } catch (e: any) {
      Alert.alert('Demo login failed', e?.message || 'Please check the API and database.');
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
        <Text style={styles.title}>Turn this baseline into your Mentis account.</Text>
        <Text style={styles.subtitle}>This final build stores your onboarding, focus sessions, goals, mood, games, XP and AI insights in the NestJS/PostgreSQL backend.</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Name</Text>
        <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Your name" placeholderTextColor={C.muted} />
        <Text style={styles.label}>Email</Text>
        <TextInput value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" placeholderTextColor={C.muted} />
        <Text style={styles.label}>Password</Text>
        <TextInput value={password} onChangeText={setPassword} style={styles.input} secureTextEntry placeholder="Minimum 6 characters" placeholderTextColor={C.muted} />
      </View>

      <Button title="Create account & generate my plan" onPress={create} loading={loading} disabled={!name || !email || password.length < 6} style={{ marginTop: 20 }} />
      <Button title="Use seeded faculty demo account" onPress={demo} loading={loading} variant="secondary" style={{ marginTop: 10 }} />

      <View style={styles.dataCard}>
        <Text style={styles.dataTitle}>Faculty demo account</Text>
        <Text style={styles.dataLine}>demo@mentis.app · Mentis123!</Text>
        <Text style={styles.dataSmall}>It contains seeded focus history, mood entries, a goal, XP, games, community ranking and downloadable offline packs.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { marginTop: 34 },
  score: { backgroundColor: C.primarySoft, borderRadius: R.xl, padding: 22, alignItems: 'center' },
  scoreLabel: { color: C.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  scoreValue: { color: C.ink, fontSize: 58, fontWeight: '900', letterSpacing: -2, marginTop: 3 },
  scoreNote: { color: C.muted, fontSize: 12, marginTop: 2, fontWeight: '700' },
  title: { color: C.ink, fontSize: 28, lineHeight: 34, fontWeight: '900', letterSpacing: -0.8, marginTop: 24 },
  subtitle: { color: C.muted, fontSize: 14, lineHeight: 22, marginTop: 9 },
  form: { marginTop: 24, gap: 8 },
  label: { color: C.text, fontSize: 12, fontWeight: '800', marginTop: 5 },
  input: { minHeight: 50, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: R.md, paddingHorizontal: 15, color: C.ink, fontSize: 14 },
  dataCard: { marginTop: 20, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: R.lg, padding: 17 },
  dataTitle: { color: C.text, fontWeight: '850', fontSize: 13 },
  dataLine: { color: C.primary, fontSize: 12, lineHeight: 18, marginTop: 6, fontWeight: '800' },
  dataSmall: { color: C.muted, fontSize: 10, lineHeight: 15, marginTop: 9 },
});
