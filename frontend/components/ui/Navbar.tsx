import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '../../constants/theme';
import { useAuthStore } from '../../store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';

export const Navbar = () => {
  const router = useRouter();
  const segments = useSegments();
  const { user } = useAuthStore();
  const isDriver = user?.role === 'driver';
  const isAdmin = user?.role === 'admin';

  // Only show navbar on web for now, or adapt for mobile later
  if (Platform.OS !== 'web') return null;

  const isActive = (path: string) => {
    // Simple check for active segment
    return segments.join('/').includes(path);
  };

  return (
    <View style={styles.navbar}>
      <View style={styles.container}>
        {/* Logo */}
        <TouchableOpacity onPress={() => router.push('/')} style={styles.logoContainer}>
          <View style={styles.logoCircle}>
             <Text style={styles.logoText}>E</Text>
          </View>
          <Text style={styles.brandName}>E-FUEL</Text>
        </TouchableOpacity>

        {/* Nav Links */}
        <View style={styles.navLinks}>
          {isAdmin ? (
            <TouchableOpacity
              style={styles.navLink}
              onPress={() => router.push('/(admin)' as any)}
            >
              <Text style={[styles.navLinkText, isActive('(admin)') && styles.activeText]}>
                Admin Dashboard
              </Text>
            </TouchableOpacity>
          ) : isDriver ? (
            <TouchableOpacity
              style={styles.navLink}
              onPress={() => router.push('/(driver)' as any)}
            >
              <Text style={[styles.navLinkText, isActive('(driver)') && styles.activeText]}>
                Dashboard Driver
              </Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={styles.navLink}
                onPress={() => router.push(user ? '/order' : '/(auth)/register')}
              >
                <Text style={[styles.navLinkText, isActive('order') && styles.activeText]}>
                  Pesan Bensin
                </Text>
              </TouchableOpacity>
              {user && (
                <TouchableOpacity
                  style={styles.navLink}
                  onPress={() => router.push('/(tabs)/orders' as any)}
                >
                  <Text style={[styles.navLinkText, isActive('orders') && styles.activeText]}>
                    Pesanan Saya
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.navLink} onPress={() => alert('Segera Hadir')}>
                <Text style={styles.navLinkText}>Tentang E-FUEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navLink} onPress={() => router.push('/')}>
                <Text style={styles.navLinkText}>Cara Kerja</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navLink} onPress={() => alert('Segera Hadir')}>
                <Text style={styles.navLinkText}>Area Layanan</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.navLink}
                onPress={() => router.push('/premium' as any)}
              >
                <Text style={[styles.navLinkText, isActive('premium') && styles.activeText]}>
                  Premium
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navLink} onPress={() => alert('Segera Hadir')}>
                <Text style={styles.navLinkText}>FAQs</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* User Actions */}
        <View style={styles.userActions}>
          {user ? (
            <View style={styles.loggedInRow}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => alert('Segera Hadir')}>
                 <Ionicons name="headset-outline" size={24} color={Colors.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}>
                 <Ionicons name="notifications-outline" size={24} color={Colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push((isAdmin ? '/(admin)' : isDriver ? '/(driver)' : '/(tabs)/profile') as any)}
                style={styles.profileBtn}
              >
                <Ionicons name="person-circle-outline" size={24} color={Colors.textMuted} />
                <Text style={styles.userName}>{user.name}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.loggedOutRow}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => alert('Segera Hadir')}>
                 <Ionicons name="headset-outline" size={24} color={Colors.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}>
                 <Ionicons name="notifications-outline" size={24} color={Colors.text} />
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.loginBtn}>
                <Ionicons name="log-in-outline" size={18} color={Colors.primary} />
                <Text style={styles.loginText}>Log In</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.registerBtn}>
                <Text style={styles.registerText}>Register</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    height: 80,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    justifyContent: 'center',
    zIndex: 100,
    ...Shadows.small,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.huge,
    maxWidth: 1440,
    width: '100%',
    alignSelf: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: Colors.textInverse,
    fontSize: 16,
    fontWeight: '900',
  },
  brandName: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: 1,
  },
  navLinks: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  navLink: {
    paddingVertical: Spacing.sm,
  },
  navLinkText: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.text,
  },
  activeText: {
    color: Colors.primary,
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loggedInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  loggedOutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconBtn: {
    position: 'relative',
    padding: 4,
  },
  badgeContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#334155',
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '700',
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingLeft: Spacing.md,
  },
  userName: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.text,
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
  },
  loginText: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.primary,
  },
  registerBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  registerText: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.textInverse,
  }
});
