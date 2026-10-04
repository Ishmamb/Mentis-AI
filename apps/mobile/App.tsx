import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
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
import { emptyDraft, loadDraft, resetMentis, saveDraft } from './src/storage';
import { getOnboarding, logout, me } from './src/services/backend';
import { hasSession } from './src/services/api';
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
      setDraftState(await loadDraft());
      if (await hasSession()) {
        try {
          const [savedUser, onboarding] = await Promise.all([me(), getOnboarding()]);
          setUserState(savedUser);
          setPlanState(onboarding.plan);
        } catch {
          await logout();
        }
      }
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

  const onAuthenticated = async (nextUser: MentisUser, nextPlan: StarterPlan) => {
    setUserState(nextUser);
    setPlanState(nextPlan);
    go('generating');
    setTimeout(() => go('plan'), 1000);
  };

  const reset = async () => {
    await Promise.all([logout(), resetMentis()]);
    setDraftState(emptyDraft);
    setUserState(null);
    setPlanState(null);
    go('intro');
  };

  if (!hydrated) return <View style={{ flex: 1, backgroundColor: C.bg }} />;

  let content: React.ReactNode;
  if (screen === 'splash') content = <SplashScreen onDone={() => go(user && plan ? 'main' : 'intro')} />;
  else if (screen === 'intro') content = <IntroScreen onNext={() => go('goals')} />;
  else if (screen === 'goals') content = <GoalsScreen draft={draft} setDraft={setDraft} onNext={() => go('habits')} />;
  else if (screen === 'habits') content = <HabitsScreen draft={draft} setDraft={setDraft} onNext={() => go('assessment')} />;
  else if (screen === 'assessment') content = <AssessmentScreen draft={draft} finish={async next => { await setDraft(next); go('login'); }} />;
  else if (screen === 'login') content = <LoginScreen draft={draft} onAuthenticated={onAuthenticated} />;
  else if (screen === 'generating') content = <GeneratingScreen />;
  else if (screen === 'plan' && user && plan) content = <PlanScreen user={user} draft={draft} plan={plan} onStart={() => go('main')} />;
  else if (screen === 'main' && user && plan) content = <MainAppScreen user={user} plan={plan} onReset={reset} />;
  else content = <IntroScreen onNext={() => go('goals')} />;

  return <View style={{ flex: 1, backgroundColor: C.bg }}><StatusBar style="dark" /><Animated.View style={{ flex: 1, opacity: fade }}>{content}</Animated.View></View>;
}
