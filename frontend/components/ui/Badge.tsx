import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Typography, BorderRadius } from '../../constants/theme';

interface BadgeProps {
  label: string;
  status?: 'success' | 'warning' | 'error' | 'info' | 'default';
  style?: ViewStyle;
}

export const Badge = ({ label, status = 'default', style }: BadgeProps) => {
  const getBackgroundColor = () => {
    switch (status) {
      case 'success': return 'rgba(16, 185, 129, 0.2)';
      case 'warning': return 'rgba(245, 158, 11, 0.2)';
      case 'error': return 'rgba(239, 68, 68, 0.2)';
      case 'info': return 'rgba(59, 130, 246, 0.2)';
      default: return Colors.border;
    }
  };

  const getTextColor = () => {
    switch (status) {
      case 'success': return Colors.success;
      case 'warning': return Colors.warning;
      case 'error': return Colors.error;
      case 'info': return Colors.info;
      default: return Colors.textMuted;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }, style]}>
      <Text style={[styles.text, { color: getTextColor() }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  text: {
    ...Typography.caption,
    fontWeight: '600',
  },
});
