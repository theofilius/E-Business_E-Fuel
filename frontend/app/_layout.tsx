import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { Colors } from '../constants/theme';
import { useAuthStore } from '../store/useAuthStore';
import { Navbar } from '../components/ui/Navbar';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { user, token, restoreToken, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    restoreToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Role-aware navigation guard
  useEffect(() => {
    if (isLoading) return;
    SplashScreen.hideAsync();

    const group = segments[0] as string | undefined;
    const inAuthGroup = group === '(auth)';
    const inOnboardingGroup = group === '(onboarding)';
    const inTabsGroup = group === '(tabs)';
    const inDriverGroup = group === '(driver)';
    const inAdminGroup = group === '(admin)';
    const inOrderRoute = group === 'order';
    const inProtected = inTabsGroup || inDriverGroup || inAdminGroup || inOrderRoute;

    if (!token) {
      if (inProtected) router.replace('/(onboarding)');
      return;
    }

    // Logged in — route by role
    const isDriver = user?.role === 'driver';
    const isAdmin = user?.role === 'admin';
    const home = isAdmin ? '/(admin)' : isDriver ? '/(driver)' : '/(tabs)';

    if (inAuthGroup || inOnboardingGroup) {
      router.replace(home as any);
    } else if (isAdmin && !inAdminGroup) {
      router.replace('/(admin)' as any);
    } else if (isDriver && !inDriverGroup) {
      router.replace('/(driver)' as any);
    } else if (!isAdmin && !isDriver && (inAdminGroup || inDriverGroup)) {
      router.replace('/(tabs)');
    }
  }, [isLoading, token, user?.role, segments, router]);

  if (isLoading) {
    return <View style={{ flex: 1, backgroundColor: Colors.background }} />;
  }

  const showNavbar = segments[0] !== '(auth)' && segments[0] !== '(admin)';

  return (
    <ThemeProvider value={DefaultTheme}>
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        {showNavbar && <Navbar />}
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background },
          }}
        >
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(driver)" />
          <Stack.Screen name="(admin)" />
          <Stack.Screen name="order/[id]" />
          <Stack.Screen name="premium" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </View>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
