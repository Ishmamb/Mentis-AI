import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Button } from './Button';
import { C, R } from '../theme';

interface ZenBreathingProps {
  onClose: () => void;
  onComplete?: (durationMin: number) => Promise<void>;
}

type Technique = 'box' | 'relax';

export function ZenBreathing({ onClose, onComplete }: ZenBreathingProps) {
  const [technique, setTechnique] = useState<Technique>('box');
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [cycle, setCycle] = useState(1);
  const [isRunning, setIsRunning] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  const scale = useRef(new Animated.Value(0.4)).current;
  const opacity = useRef(new Animated.Value(0.5)).current;
  const isRunningRef = useRef(isRunning);
  isRunningRef.current = isRunning;

  // Box: 4s inhale, 4s hold, 4s exhale, 4s hold
  // Relax: 4s inhale, 7s hold, 8s exhale
  const runCycle = (tech: Technique, cCount: number) => {
    if (!isRunningRef.current) return;

    if (cCount > 4) {
      setIsFinished(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      return;
    }

    setCycle(cCount);

    // Phase 1: Inhale (4s)
    setPhase('Inhale');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 4000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0.9,
        duration: 4000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (!isRunningRef.current) return;

      // Phase 2: Hold (4s for box, 7s for relax)
      setPhase('Hold');
      const holdTime = tech === 'box' ? 4000 : 7000;
      setTimeout(() => {
        if (!isRunningRef.current) return;

        // Phase 3: Exhale (4s for box, 8s for relax)
        setPhase('Exhale');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        const exhaleTime = tech === 'box' ? 4000 : 8000;
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 0.4,
            duration: exhaleTime,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.5,
            duration: exhaleTime,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (!isRunningRef.current) return;

          if (tech === 'box') {
            // Phase 4: Hold (4s)
            setPhase('Rest');
            setTimeout(() => {
              if (isRunningRef.current) runCycle(tech, cCount + 1);
            }, 4000);
          } else {
            if (isRunningRef.current) runCycle(tech, cCount + 1);
          }
        });
      }, holdTime);
    });
  };

  useEffect(() => {
    setIsRunning(true);
    runCycle(technique, 1);
    return () => {
      setIsRunning(false);
      scale.stopAnimation();
      opacity.stopAnimation();
    };
  }, [technique]);

  const handleFinish = async () => {
    if (onComplete) {
      await onComplete(2);
    }
    onClose();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Zen Breathwork</Text>
          <Text style={styles.subtitle}>
            {technique === 'box' ? '4-4-4-4 Box Breathing for calm focus' : '4-7-8 Relaxation to silence impulse'}
          </Text>
        </View>
        <Pressable onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>
      </View>

      {/* Technique switch */}
      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tab, technique === 'box' && styles.tabActive]}
          onPress={() => setTechnique('box')}
        >
          <Text style={[styles.tabText, technique === 'box' && styles.tabTextActive]}>
            Box Breathing (4-4-4-4)
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, technique === 'relax' && styles.tabActive]}
          onPress={() => setTechnique('relax')}
        >
          <Text style={[styles.tabText, technique === 'relax' && styles.tabTextActive]}>
            Relaxation (4-7-8)
          </Text>
        </Pressable>
      </View>

      {/* Visual Breathing Orb */}
      <View style={styles.orbContainer}>
        <Animated.View
          style={[
            styles.outerHalo,
            {
              transform: [{ scale }],
              opacity,
            },
          ]}
        />
        <View style={styles.orbCenter}>
          <Text style={styles.phaseLabel}>{phase}</Text>
          <Text style={styles.cycleLabel}>Cycle {cycle} of 4</Text>
        </View>
      </View>

      <Text style={styles.cueText}>
        {phase === 'Inhale'
          ? 'Breathe gently through your nose'
          : phase === 'Hold'
          ? 'Suspend breath with a relaxed jaw'
          : phase === 'Exhale'
          ? 'Slow, quiet release through mouth'
          : 'Wait in stillness before the next wave'}
      </Text>

      <Modal visible={isFinished} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalKicker}>RESET COMPLETE</Text>
            <Text style={styles.modalTitle}>Centered & Calm</Text>
            <Text style={styles.modalBody}>
              Your nervous system is regulated. You bypassed the scrolling urge with conscious presence.
            </Text>
            <Button title="Save Mindful Reset" onPress={handleFinish} variant="dark" style={{ marginTop: 20 }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: C.card,
    borderRadius: R.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: C.line,
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: C.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  subtitle: {
    color: C.muted,
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: C.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: C.bg,
    borderRadius: 12,
    padding: 3,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: C.card,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  tabText: {
    color: C.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  tabTextActive: {
    color: C.primary,
    fontWeight: '900',
  },
  orbContainer: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  outerHalo: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: '#818CF8',
  },
  orbCenter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: C.dark,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    shadowColor: '#3157E8',
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  phaseLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cycleLabel: {
    color: '#93C5FD',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  cueText: {
    textAlign: 'center',
    color: C.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 10,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(14, 23, 38, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: C.card,
    borderRadius: R.xl,
    padding: 24,
    alignItems: 'center',
  },
  modalKicker: {
    color: C.green,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  modalTitle: {
    color: C.ink,
    fontSize: 26,
    fontWeight: '900',
    marginTop: 6,
  },
  modalBody: {
    color: C.muted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 8,
  },
});
