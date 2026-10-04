import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { C, R } from '../theme';

type Props = {
  title: string;
  onPress: () => void | Promise<void>;
  variant?: 'primary' | 'secondary' | 'ghost' | 'dark';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export function Button({ title, onPress, variant = 'primary', disabled, loading, style }: Props) {
  const handle = async () => {
    if (disabled || loading) return;
    Haptics.selectionAsync().catch(() => {});
    await onPress();
  };

  return (
    <Pressable
      onPress={handle}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'dark' ? '#fff' : C.primary} />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    borderRadius: R.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  primary: { backgroundColor: C.primary },
  secondary: { backgroundColor: C.primarySoft, borderWidth: 1, borderColor: '#DCE3FF' },
  ghost: { backgroundColor: 'transparent' },
  dark: { backgroundColor: C.dark },
  disabled: { opacity: 0.42 },
  pressed: { transform: [{ scale: 0.985 }], opacity: 0.96 },
  text: { fontSize: 16, fontWeight: '800' },
  primaryText: { color: '#fff' },
  secondaryText: { color: C.primary },
  ghostText: { color: C.muted },
  darkText: { color: '#fff' },
});
