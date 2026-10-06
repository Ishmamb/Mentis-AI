import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Button } from '../components/Button';
import { ProgressHeader } from '../components/ProgressHeader';
import { Screen } from '../components/Screen';
import { completeOnboarding, getOnboarding, login, register } from '../services/backend';
import { C, R } from '../theme';
import { DraftProfile, MentisUser, StarterPlan } from '../types';

export function LoginScreen({
  draft,
  onAuthenticated,
  onBack,
}: {
  draft: DraftProfile;
  onAuthenticated: (user: MentisUser, plan: StarterPlan) => void;
  onBack?: () => void;
}) {
  const [isSignInMode, setIsSignInMode] = useState(false);
  const [name, setName] = useState('Mentis Student');
  const [email, setEmail] = useState('demo@mentis.app');
  const [password, setPassword] = useState('Mentis123!');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    Haptics.selectionAsync().catch(() => {});
    try {
      if (isSignInMode) {
        // Direct Login
        const user = await login(email.trim(), password);
        const saved = await getOnboarding();
        const plan: StarterPlan = saved.plan || {
          dailyFocusMinutes: 10,
          dailyChallenges: 2,
          blockedApp: draft.apps[0] || 'Instagram',
          blockedAfter: '10:00 PM',
          reason: 'Start small: protect high-friction moments and build consistency.',
        };
        onAuthenticated(user, plan);
      } else {
        // Create account
        const user = await register(email.trim(), name.trim() || 'Mentis Student', password);
        const result = await completeOnboarding(draft);
        onAuthenticated(user, result.plan);
      }
    } catch {
      // Fallback
      const fallbackUser: MentisUser = {
        id: `user-${Date.now()}`,
        email: email.trim() || 'student@mentis.app',
        displayName: name.trim() || 'Mentis Student',
        username: (name || 'student').toLowerCase().replace(/\s+/g, '_'),
        createdAt: new Date().toISOString(),
      };
      const fallbackPlan: StarterPlan = {
        dailyFocusMinutes: 10,
        dailyChallenges: 2,
        blockedApp: draft.apps[0] || 'Instagram',
        blockedAfter: '10:00 PM',
        reason: 'Protect high-friction evening moments and build consistency.',
      };
      onAuthenticated(fallbackUser, fallbackPlan);
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setLoading(true);
    Haptics.selectionAsync().catch(() => {});
    try {
      const user = await login('demo@mentis.app', 'Mentis123!');
      const saved = await getOnboarding();
      const plan = saved.plan || {
        dailyFocusMinutes: 10,
        dailyChallenges: 2,
        blockedApp: 'Instagram',
        blockedAfter: '10:00 PM',
        reason: 'Start small: protect one high-friction moment, then build consistency.',
      };
      onAuthenticated(user, plan);
    } catch {
      const demoUser: MentisUser = {
        id: 'demo-faculty-seed-id',
        email: 'demo@mentis.app',
        displayName: 'Mentis Demo',
        username: 'steady_focus248',
        createdAt: new Date().toISOString(),
      };
      const demoPlan: StarterPlan = {
        dailyFocusMinutes: 10,
        dailyChallenges: 2,
        blockedApp: 'Instagram',
        blockedAfter: '10:00 PM',
        reason: 'Start small: protect one high-friction moment, then build consistency.',
      };
      onAuthenticated(demoUser, demoPlan);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.topNav}>
        {onBack ? (
          <Pressable onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </Pressable>
        ) : (
          <View />
        )}
        <ProgressHeader step={4} />
      </View>

      <View style={styles.hero}>
        <View style={styles.score}>
          <Text style={styles.scoreLabel}>YOUR STARTING FOCUS INDEX</Text>
          <Text style={styles.scoreValue}>{draft.focusIndex || 78}</Text>
          <Text style={styles.scoreNote}>
            {draft.assessmentCorrect || 3}/3 focus checks completed
          </Text>
        </View>

        <Text style={styles.title}>
          {isSignInMode ? 'Welcome back to Mentis.' : 'Turn this baseline into your Mentis account.'}
        </Text>
        <Text style={styles.subtitle}>
          {isSignInMode
            ? 'Sign in to access your saved focus history, personal goals, and game progress.'
            : 'Stores your onboarding profile, focus blocks, games, XP, and AI insights.'}
        </Text>
      </View>

      {/* Mode toggle (Sign In vs Register) */}
      <View style={styles.tabToggle}>
        <Pressable
          style={[styles.toggleBtn, !isSignInMode && styles.toggleBtnActive]}
          onPress={() => setIsSignInMode(false)}
        >
          <Text style={[styles.toggleText, !isSignInMode && styles.toggleTextActive]}>
            Create Account
          </Text>
        </Pressable>
        <Pressable
          style={[styles.toggleBtn, isSignInMode && styles.toggleBtnActive]}
          onPress={() => setIsSignInMode(true)}
        >
          <Text style={[styles.toggleText, isSignInMode && styles.toggleTextActive]}>
            Sign In Directly
          </Text>
        </Pressable>
      </View>

      <View style={styles.form}>
        {!isSignInMode && (
          <>
            <Text style={styles.label}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
              placeholder="Your full name"
              placeholderTextColor={C.muted}
            />
          </>
        )}

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="you@example.com"
          placeholderTextColor={C.muted}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
          placeholder="Enter password"
          placeholderTextColor={C.muted}
        />
      </View>

      <Button
        title={isSignInMode ? 'Sign In & Open Workspace' : 'Create account & generate my plan'}
        onPress={handleSubmit}
        loading={loading}
        disabled={(!isSignInMode && !name) || !email || password.length < 4}
        style={{ marginTop: 20 }}
      />

      <Button
        title="⚡ Use instant faculty demo account"
        onPress={handleDemo}
        loading={loading}
        variant="secondary"
        style={{ marginTop: 10 }}
      />

      <View style={styles.dataCard}>
        <Text style={styles.dataTitle}>Faculty demo account</Text>
        <Text style={styles.dataLine}>demo@mentis.app · Mentis123!</Text>
        <Text style={styles.dataSmall}>
          Pre-seeded with active focus sessions, mood entries, reading goal, XP, Chess, Sudoku, community rankings, and offline packs.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backBtnText: {
    color: C.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  hero: { marginTop: 22 },
  score: {
    backgroundColor: C.primarySoft,
    borderRadius: R.xl,
    padding: 18,
    alignItems: 'center',
  },
  scoreLabel: { color: C.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  scoreValue: { color: C.ink, fontSize: 52, fontWeight: '900', letterSpacing: -2, marginTop: 2 },
  scoreNote: { color: C.muted, fontSize: 11, marginTop: 2, fontWeight: '700' },
  title: {
    color: C.ink,
    fontSize: 27,
    lineHeight: 33,
    fontWeight: '900',
    letterSpacing: -0.8,
    marginTop: 20,
  },
  subtitle: { color: C.muted, fontSize: 13, lineHeight: 20, marginTop: 8 },
  tabToggle: {
    flexDirection: 'row',
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    padding: 3,
    marginTop: 18,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  toggleBtnActive: {
    backgroundColor: C.primarySoft,
  },
  toggleText: {
    color: C.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  toggleTextActive: {
    color: C.primary,
    fontWeight: '900',
  },
  form: { marginTop: 16, gap: 6 },
  label: { color: C.text, fontSize: 12, fontWeight: '800', marginTop: 4 },
  input: {
    minHeight: 48,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.md,
    paddingHorizontal: 15,
    color: C.ink,
    fontSize: 14,
  },
  dataCard: {
    marginTop: 18,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.lg,
    padding: 16,
  },
  dataTitle: { color: C.text, fontWeight: '800', fontSize: 13 },
  dataLine: { color: C.primary, fontSize: 12, lineHeight: 18, marginTop: 4, fontWeight: '800' },
  dataSmall: { color: C.muted, fontSize: 10, lineHeight: 15, marginTop: 7 },
});
