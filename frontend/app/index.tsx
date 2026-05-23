import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';

export default function Index() {
  const { user, token, isLoading } = useAuthStore();

  // Wait for the saved session to be restored before deciding where to go
  if (isLoading) return null;

  if (!token) return <Redirect href="/(onboarding)" />;
  if (user?.role === 'admin') return <Redirect href={'/(admin)' as any} />;
  if (user?.role === 'driver') return <Redirect href={'/(driver)' as any} />;
  return <Redirect href="/(tabs)" />;
}
