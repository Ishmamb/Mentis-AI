import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { C } from '../theme';

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.row}>
      <Image source={require('../../assets/mentis-icon.png')} style={[styles.logo, compact && styles.logoSmall]} />
      <View>
        <View style={styles.nameRow}>
          <Text style={[styles.name, compact && styles.nameSmall]}>Mentis</Text>
          <Text style={[styles.ai, compact && styles.aiSmall]}>AI</Text>
        </View>
        {!compact && <Text style={styles.tag}>focus, without the noise</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 44, height: 44, borderRadius: 13 },
  logoSmall: { width: 34, height: 34, borderRadius: 10 },
  nameRow: { flexDirection: 'row', alignItems: 'flex-start' },
  name: { fontSize: 22, fontWeight: '900', color: C.ink, letterSpacing: -0.5 },
  nameSmall: { fontSize: 18 },
  ai: { fontSize: 11, color: C.primary, fontWeight: '900', marginLeft: 3, marginTop: 2 },
  aiSmall: { fontSize: 9 },
  tag: { color: C.muted, fontSize: 11, marginTop: 1 },
});
