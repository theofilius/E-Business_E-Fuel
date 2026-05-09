import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Colors } from '../constants/theme';
import { useAuthStore } from '../store/useAuthStore';
import { View, Platform } from 'react-native';
import { Navbar } from '../components/ui/Navbar';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const loaded = true;

  const { token, restoreToken, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    restoreToken();
  }, []);

  useEffect(() => {
    if (loaded && !isLoading) {
      SplashScreen.hideAsync();
      
      const inAuthGroup = segments[0] === '(auth)';
      const inOnboardingGroup = segments[0] === '(onboarding)';

      if (!token) {
        // If not logged in and not in auth or onboarding, stay or go to login
        // For web, we can let users see the home page/landing
        if (!inAuthGroup && !inOnboardingGroup && Platform.OS !== 'web') {
          router.replace('/(onboarding)');
        }
      } else {
        // If logged in and in auth or onboarding, go to tabs
        if (inAuthGroup || inOnboardingGroup) {
          router.replace('/(tabs)');
        }
      }
    }
  }, [loaded, isLoading, token, segments]);

  if (!loaded || isLoading) {
    return <View style={{ flex: 1, backgroundColor: Colors.background }} />;
  }

  const showNavbar = segments[0] !== '(auth)';

  return (
    <ThemeProvider value={DefaultTheme}>
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        {showNavbar && <Navbar />}
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </View>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
