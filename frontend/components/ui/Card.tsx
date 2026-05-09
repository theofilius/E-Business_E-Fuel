import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Shadows } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'outlined' | 'elevated';
}

export const Card = ({ children, style, variant = 'default' }: CardProps) => {
  return (
    <View
      style={[
        styles.card,
        variant === 'outlined' && styles.outlined,
        variant === 'elevated' && Shadows.medium,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: 16,
    ...Shadows.small,
  },
  outlined: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    shadowColor: 'transparent',
    elevation: 0,
  },
});
