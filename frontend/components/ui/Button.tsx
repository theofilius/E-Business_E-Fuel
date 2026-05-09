import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, BorderRadius, Shadows } from '../../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}: ButtonProps) => {
  const getContainerStyle = () => {
    switch (size) {
      case 'small': return styles.containerSmall;
      case 'large': return styles.containerLarge;
      default: return styles.containerMedium;
    }
  };

  const getTextStyle = () => {
    switch (size) {
      case 'small': return Typography.bodySmall;
      case 'large': return Typography.bodyLarge;
      default: return Typography.body;
    }
  };

  const getBackgroundColor = () => {
    if (disabled || isLoading) return '#94A3B8';
    if (variant === 'primary') return Colors.primary;
    if (variant === 'secondary') return Colors.secondary;
    return 'transparent';
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      style={[
        styles.base,
        getContainerStyle(),
        { backgroundColor: getBackgroundColor() },
        variant === 'outline' && { borderWidth: 1, borderColor: Colors.primary },
        style,
      ]}
    >
      <View style={styles.content}>
        {isLoading ? (
          <ActivityIndicator size="small" color={variant === 'outline' || variant === 'text' ? Colors.primary : Colors.textInverse} />
        ) : (
          <>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text
              style={[
                getTextStyle(),
                { fontWeight: '700' },
                variant === 'outline' || variant === 'text' ? { color: Colors.primary } : { color: Colors.textInverse },
                disabled && { color: Colors.textInverse },
                textStyle,
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 8, // Matching Figma
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  containerSmall: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  containerMedium: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  containerLarge: {
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
});
