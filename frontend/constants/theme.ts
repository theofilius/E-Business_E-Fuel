export const Colors = {
  // Core backgrounds
  background: '#F8FAFC', // Slate 50
  surface: '#FFFFFF',
  card: '#FFFFFF',
  cardHover: '#F1F5F9',

  // Brand colors
  primary: '#334E52', // Figma Teal
  primaryDark: '#24383B',
  primaryLight: '#4B7379',
  secondary: '#E6F4F1',
  accent: '#00D4AA',
  
  gradient: {
    start: '#334E52',
    end: '#4B7379'
  },

  // Text
  text: '#1E293B', // Slate 800
  textMuted: '#64748B', // Slate 500
  textInverse: '#FFFFFF',

  // Status
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Borders
  border: '#E2E8F0', // Slate 200
  borderLight: '#F1F5F9', // Slate 100
  
  // Navigation
  tabIconDefault: '#94A3B8',
  tabIconSelected: '#334E52',
};

export const Typography = {
  h1: { fontSize: 36, fontWeight: '800' as const, letterSpacing: -0.5 },
  h2: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.4 },
  h3: { fontSize: 22, fontWeight: '600' as const },
  bodyLarge: { fontSize: 18, fontWeight: '400' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  bodySmall: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '500' as const },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  huge: 64,
};

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  pill: 9999,
};

export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#334E52',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  large: {
    shadowColor: '#334E52',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },
  glow: {
    shadowColor: '#334E52',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  }
};
