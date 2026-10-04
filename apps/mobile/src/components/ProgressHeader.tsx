import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { C, R } from '../theme';
import { Brand } from './Brand';

export function ProgressHeader({ step, total = 4 }: { step: number; total?: number }) {
  return (
    <View style={styles.wrap}>
      <Brand compact />
      <View style={styles.right}>
        <Text style={styles.step}>{step} of {total}</Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.round((step / total) * 100)}%` }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  right: { alignItems: 'flex-end' },
  step: { color: C.muted, fontSize: 11, fontWeight: '700', marginBottom: 6 },
  track: { width: 74, height: 5, backgroundColor: '#E5E8EE', borderRadius: R.pill, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: C.primary, borderRadius: R.pill },
});
