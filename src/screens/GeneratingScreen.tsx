import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { C, R } from '../theme';

export function GeneratingScreen() {
  const pulse = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.04, duration: 650, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.94, duration: 650, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Screen scroll={false} contentStyle={styles.root}>
      <Animated.View style={[styles.logoWrap, { transform: [{ scale: pulse }] }]}>
        <Image source={require('../../assets/mentis-icon.png')} style={styles.logo} />
      </Animated.View>
      <Text style={styles.title}>Building your starter plan</Text>
      <Text style={styles.subtitle}>Balancing your goals, screen-time habits and focus baseline.</Text>
      <View style={styles.steps}>
        <View style={styles.step}><View style={styles.dot} /><Text style={styles.stepText}>Finding your highest-friction window</Text></View>
        <View style={styles.step}><View style={styles.dot} /><Text style={styles.stepText}>Choosing a realistic first restriction</Text></View>
        <View style={styles.step}><View style={styles.dotMuted} /><Text style={styles.stepMuted}>Preparing your daily focus loop</Text></View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center' },
  logoWrap: { width: 84, height: 84, borderRadius: 26, shadowColor: '#3157E8', shadowOpacity: 0.12, shadowRadius: 20, shadowOffset: { width: 0, height: 8 } },
  logo: { width: 84, height: 84, borderRadius: 26 },
  title: { color: C.ink, fontSize: 27, fontWeight: '900', marginTop: 28, textAlign: 'center', letterSpacing: -0.7 },
  subtitle: { color: C.muted, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 9, maxWidth: 320 },
  steps: { marginTop: 32, width: '100%', backgroundColor: C.card, borderRadius: R.lg, borderWidth: 1, borderColor: C.line, padding: 17, gap: 14 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.green },
  dotMuted: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#CDD3DD' },
  stepText: { color: C.text, fontSize: 12, fontWeight: '700' },
  stepMuted: { color: C.muted, fontSize: 12, fontWeight: '700' },
});
