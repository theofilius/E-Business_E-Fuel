import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { user, signOut } = useAuthStore();
  const { width } = useWindowDimensions();
  const isMobile = width <= 768;
  const [pendingCount, setPendingCount] = React.useState(0);
  const [pendingRefunds, setPendingRefunds] = React.useState(0);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, refundsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/refunds'),
        ]);
        if (statsRes.data.success && statsRes.data.data.pendingOrders) {
          setPendingCount(statsRes.data.data.pendingOrders);
        }
        if (refundsRes.data.success) {
          const pending = (refundsRes.data.data as any[]).filter(
            (r: any) => r.status === 'pending'
          ).length;
          setPendingRefunds(pending);
        }
      } catch {
        // ignore
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  const currentRoute = segments[segments.length - 1];

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  const navItems = [
    { label: 'Dashboard', route: 'index', icon: 'grid-outline' },
    { label: 'Kelola Order', route: 'orders', icon: 'receipt-outline', badge: pendingCount > 0 ? pendingCount : null },
    { label: 'Kelola Driver', route: 'drivers', icon: 'bicycle-outline' },
    { label: 'Kelola Refund', route: 'refunds', icon: 'refresh-circle-outline', badge: pendingRefunds > 0 ? pendingRefunds : null },
    { label: 'Laporan & Analitik', route: 'analytics', icon: 'bar-chart-outline' },
    { label: 'Pengaturan Cabang', route: 'settings', icon: 'settings-outline' },
  ];

  return (
    <SafeAreaView style={[styles.container, isMobile && styles.containerMobile]} edges={['bottom', 'top']}>
      {/* Sidebar */}
      <View style={[styles.sidebar, isMobile && styles.sidebarMobile]}>
        <View style={[styles.logoContainer, isMobile && styles.logoContainerMobile]}>
          <Text style={styles.logoText}>
            <Text style={{ color: Colors.info }}>E</Text>
            <Text style={{ color: Colors.primary }}>FUEL</Text>
            <Text style={styles.adminBadge}> ADMIN</Text>
          </Text>
        </View>

        {isMobile ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mobileNavScroll}>
            {navItems.map((item) => {
              const isActive = currentRoute === item.route || (currentRoute === '(admin)' && item.route === 'index');
              return (
                <TouchableOpacity
                  key={item.route}
                  style={[styles.mobileNavItem, isActive && styles.navItemActive]}
                  onPress={() => router.push(`/(admin)/${item.route === 'index' ? '' : item.route}`)}
                >
                  <Ionicons name={item.icon as any} size={18} color={isActive ? 'white' : Colors.textMuted} />
                  <Text style={[styles.mobileNavLabel, isActive && styles.navLabelActive]}>{item.label}</Text>
                  {item.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : (
          <>
            <View style={styles.navSection}>
              <Text style={styles.navSectionTitle}>Utama</Text>
              {navItems.slice(0, 4).map((item) => {
                const isActive = currentRoute === item.route || (currentRoute === '(admin)' && item.route === 'index');
                return (
                  <TouchableOpacity
                    key={item.route}
                    style={[styles.navItem, isActive && styles.navItemActive]}
                    onPress={() => router.push(`/(admin)/${item.route === 'index' ? '' : item.route}`)}
                  >
                    <Ionicons name={item.icon as any} size={20} color={isActive ? 'white' : Colors.textMuted} />
                    <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.label}</Text>
                    {item.badge && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.navSection}>
              <Text style={styles.navSectionTitle}>Laporan</Text>
              {navItems.slice(4).map((item) => {
                const isActive = currentRoute === item.route;
                return (
                  <TouchableOpacity
                    key={item.route}
                    style={[styles.navItem, isActive && styles.navItemActive]}
                    onPress={() => router.push(`/(admin)/${item.route}`)}
                  >
                    <Ionicons name={item.icon as any} size={20} color={isActive ? 'white' : Colors.textMuted} />
                    <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
      </View>

      {/* Main Content Area */}
      <View style={styles.main}>
        {/* Header */}
        <View style={[styles.header, isMobile && styles.headerMobile]}>
          <View style={styles.headerLeft}>
             {/* Title can be dynamic if we want, but for now empty or simple text */}
          </View>
          <View style={[styles.headerRight, isMobile && styles.headerRightMobile]}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={24} color={Colors.text} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
            <View style={[styles.profileBox, isMobile && styles.profileBoxMobile]}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'A'}</Text>
              </View>
              <View>
                <Text style={styles.profileName}>{user?.name || 'Admin'}</Text>
                <Text style={styles.profileRole}>Admin Cabang</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.iconBtn} onPress={handleSignOut}>
              <Ionicons name="log-out-outline" size={24} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Route */}
        <ScrollView contentContainerStyle={styles.contentScroll} showsVerticalScrollIndicator={false}>
          <Slot />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.background,
  },
  containerMobile: {
    flexDirection: 'column',
  },
  sidebar: {
    width: 260,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  sidebarMobile: {
    width: '100%',
    paddingVertical: Spacing.md,
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  logoContainer: {
    marginBottom: Spacing.xxl,
    paddingHorizontal: Spacing.sm,
  },
  logoContainerMobile: {
    marginBottom: Spacing.md,
  },
  mobileNavScroll: {
    paddingHorizontal: Spacing.sm,
    gap: Spacing.sm,
  },
  mobileNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  mobileNavLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  logoText: {
    ...Typography.h2,
    fontStyle: 'italic',
  },
  adminBadge: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.textMuted,
    fontStyle: 'normal',
  },
  navSection: {
    marginBottom: Spacing.xl,
  },
  navSectionTitle: {
    ...Typography.caption,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    fontWeight: '700',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: 4,
  },
  navItemActive: {
    backgroundColor: Colors.primaryLight,
  },
  navLabel: {
    ...Typography.body,
    color: Colors.textMuted,
    marginLeft: Spacing.md,
    flex: 1,
    fontWeight: '500',
  },
  navLabelActive: {
    color: 'white',
    fontWeight: '700',
  },
  badge: {
    backgroundColor: Colors.error,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  main: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    height: 70,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  headerMobile: {
    height: 'auto',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  headerLeft: {},
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  headerRightMobile: {
    gap: Spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  iconBtn: {
    position: 'relative',
    padding: Spacing.xs,
  },
  notifDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
  },
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
    paddingLeft: Spacing.lg,
  },
  profileBoxMobile: {
    paddingLeft: Spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  profileName: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.text,
  },
  profileRole: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  contentScroll: {
    flexGrow: 1,
  },
});
