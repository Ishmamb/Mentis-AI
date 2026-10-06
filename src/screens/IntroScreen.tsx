import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Brand } from '../components/Brand';
import { Button } from '../components/Button';
import { Screen } from '../components/Screen';
import { C, R } from '../theme';

export function IntroScreen({ onNext }: { onNext: () => void }) {
  const y = useRef(new Animated.Value(18)).current;
  const a = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(a, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.timing(y, { toValue: 0, duration: 420, useNativeDriver: true }),
    ]).start();
  }, [a, y]);

  return (
    <Screen scroll={false}>
      <Brand />
      <Animated.View style={[styles.hero, { opacity: a, transform: [{ translateY: y }] }]}>
        <Text style={styles.eyebrow}>A DIFFERENT KIND OF DIGITAL DETOX</Text>
        <Text style={styles.title}>Don't just block the distraction.</Text>
        <Text style={styles.titleAccent}>Replace it with something better.</Text>
        <Text style={styles.body}>
          Mentis combines focused app limits, short cognitive challenges and a plan that adapts to your habits.
        </Text>

        <View style={styles.preview}>
          <View style={styles.previewTop}>
            <Text style={styles.previewLabel}>TODAY</Text>
            <View style={styles.livePill}><View style={styles.liveDot} /><Text style={styles.liveText}>ready</Text></View>
          </View>
          <Text style={styles.previewTitle}>Your first reset can take 10 minutes.</Text>
          <View style={styles.row}>
            <View style={styles.mini}><Text style={styles.miniBig}>2</Text><Text style={styles.miniText}>brain challenges</Text></View>
            <View style={styles.mini}><Text style={styles.miniBig}>1</Text><Text style={styles.miniText}>focus block</Text></View>
          </View>
        </View>
      </Animated.View>

      <View style={{ flex: 1 }} />
      <Button title="Build my plan" onPress={onNext} />
      <Text style={styles.note}>About 60 seconds. No account needed yet.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { marginTop: 54 },
  eyebrow: { color: C.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: C.ink, fontSize: 38, lineHeight: 44, fontWeight: '900', letterSpacing: -1.3, marginTop: 14 },
  titleAccent: { color: C.primary, fontSize: 38, lineHeight: 44, fontWeight: '900', letterSpacing: -1.3 },
  body: { color: C.muted, fontSize: 16, lineHeight: 24, marginTop: 18 },
  preview: { marginTop: 34, backgroundColor: C.card, borderRadius: R.xl, borderWidth: 1, borderColor: C.line, padding: 20 },
  previewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  previewLabel: { fontSize: 11, fontWeight: '900', color: C.muted, letterSpacing: 1 },
  livePill: { flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: C.greenSoft, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 99 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.green },
  liveText: { fontSize: 11, fontWeight: '800', color: C.green },
  previewTitle: { color: C.ink, fontSize: 20, fontWeight: '800', lineHeight: 26, marginTop: 18 },
  row: { flexDirection: 'row', gap: 10, marginTop: 18 },
  mini: { flex: 1, backgroundColor: C.bg, borderRadius: R.md, padding: 14 },
  miniBig: { color: C.ink, fontSize: 22, fontWeight: '900' },
  miniText: { color: C.muted, fontSize: 11, fontWeight: '700', marginTop: 4 },
  note: { textAlign: 'center', color: C.muted, fontSize: 12, marginTop: 13 },
});
