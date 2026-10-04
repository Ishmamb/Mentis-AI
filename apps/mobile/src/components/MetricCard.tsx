import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { C, R } from '../theme';

export function MetricCard({ value, label, hint }: { value: string; label: string; hint?: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {!!hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, backgroundColor: C.card, borderRadius: R.lg, padding: 17, borderWidth: 1, borderColor: C.line },
  value: { color: C.ink, fontSize: 25, fontWeight: '900', letterSpacing: -0.7 },
  label: { color: C.muted, fontSize: 12, marginTop: 5, fontWeight: '700' },
  hint: { color: C.primary, fontSize: 11, marginTop: 10, fontWeight: '700' },
});
