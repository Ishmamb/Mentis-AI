import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SplashScreen } from './src/screens/SplashScreen';
import { IntroScreen } from './src/screens/IntroScreen';
import { GoalsScreen } from './src/screens/GoalsScreen';
import { HabitsScreen } from './src/screens/HabitsScreen';
import { AssessmentScreen } from './src/screens/AssessmentScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { GeneratingScreen } from './src/screens/GeneratingScreen';
import { PlanScreen } from './src/screens/PlanScreen';
import { MainAppScreen } from './src/screens/MainAppScreen';
import { AppScreen, DraftProfile, MentisUser, StarterPlan } from './src/types';
import { emptyDraft, loadDraft, loadPlan, loadUser, resetMentis, saveDraft, savePlan, saveUser } from './src/storage';
import { generateStarterPlan } from './src/services/planService';
import { C } from './src/theme';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('splash');
  const [draft, setDraftState] = useState<DraftProfile>(emptyDraft);
  const [user, setUserState] = useState<MentisUser | null>(null);
  const [plan, setPlanState] = useState<StarterPlan | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      const [d, u, p] = await Promise.all([loadDraft(), loadUser(), loadPlan()]);
      setDraftState(d);
      setUserState(u);
      setPlanState(p);
      if (u && p) setScreen('main');
      setHydrated(true);
    })();
  }, []);

  const go = useCallback((next: AppScreen) => {
    Animated.timing(fade, { toValue: 0, duration: 120, useNativeDriver: true }).start(() => {
      setScreen(next);
      Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    });
  }, [fade]);

  const setDraft = async (next: DraftProfile) => {
    setDraftState(next);
    await saveDraft(next);
  };

  const onUser = async (nextUser: MentisUser) => {
    setUserState(nextUser);
    await saveUser(nextUser);
    go('generating');

    const nextPlan = await generateStarterPlan(nextUser.draft);
    setPlanState(nextPlan);
    await savePlan(nextPlan);
    go('plan');
  };

  const reset = async () => {
    await resetMentis();
    setDraftState(emptyDraft);
    setUserState(null);
    setPlanState(null);
    go('intro');
  };

  if (!hydrated && screen !== 'splash') return <View style={{ flex: 1, backgroundColor: C.bg }} />;

  let content: React.ReactNode;

  if (screen === 'splash') {
    content = <SplashScreen onDone={() => go(user && plan ? 'main' : 'intro')} />;
  } else if (screen === 'intro') {
    content = <IntroScreen onNext={() => go('goals')} />;
  } else if (screen === 'goals') {
    content = <GoalsScreen draft={draft} setDraft={setDraft} onNext={() => go('habits')} />;
  } else if (screen === 'habits') {
    content = <HabitsScreen draft={draft} setDraft={setDraft} onNext={() => go('assessment')} />;
  } else if (screen === 'assessment') {
    content = <AssessmentScreen draft={draft} finish={async next => { await setDraft(next); go('login'); }} />;
  } else if (screen === 'login') {
    content = <LoginScreen draft={draft} onUser={onUser} />;
  } else if (screen === 'generating') {
    content = <GeneratingScreen />;
  } else if (screen === 'plan' && user && plan) {
    content = <PlanScreen user={user} draft={draft} plan={plan} onStart={() => go('main')} />;
  } else if (screen === 'main' && user && plan) {
    content = <MainAppScreen user={user} plan={plan} onReset={reset} />;
  } else {
    content = <IntroScreen onNext={() => go('goals')} />;
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <Animated.View style={[styles.root, { opacity: fade }]}>{content}</Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
});
