import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';

export default function SimpleButton({
  title,
  onPress,
  style,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      style={[styles.btn, style, disabled && styles.disabled]}
      disabled={disabled}
      activeOpacity={disabled ? 1 : 0.8}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { backgroundColor: '#6200ee', padding: 12, borderRadius: 8, alignItems: 'center' },
  disabled: { opacity: 0.6 },
  text: { color: 'white', fontWeight: '600' }
});
