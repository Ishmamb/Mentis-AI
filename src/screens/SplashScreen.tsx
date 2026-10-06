import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { C } from '../theme';

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 7 }),
    ]).start();

    const t = setTimeout(onDone, 900);
    return () => clearTimeout(t);
  }, [onDone, opacity, scale]);

  return (
    <View style={styles.root}>
      <Animated.View style={{ alignItems: 'center', opacity, transform: [{ scale }] }}>
        <Image source={require('../../assets/mentis-icon.png')} style={styles.logo} />
        <View style={styles.nameRow}>
          <Text style={styles.name}>Mentis</Text><Text style={styles.ai}>AI</Text>
        </View>
        <Text style={styles.tag}>Take your attention back.</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 88, height: 88, borderRadius: 24 },
  nameRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 18 },
  name: { fontSize: 34, fontWeight: '900', color: C.ink, letterSpacing: -1.1 },
  ai: { fontSize: 13, color: C.primary, fontWeight: '900', marginTop: 4, marginLeft: 4 },
  tag: { color: C.muted, marginTop: 6, fontSize: 14 },
});
