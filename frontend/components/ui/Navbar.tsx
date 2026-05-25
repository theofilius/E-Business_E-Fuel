import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '../../constants/theme';
import { useAuthStore } from '../../store/useAuthStore';
import { useRefundStore } from '../../store/useRefundStore';
import { Ionicons } from '@expo/vector-icons';

export const Navbar = () => {
  const router = useRouter();
  const segments = useSegments();
  const { user } = useAuthStore();
  const { refunds, fetchMyRefunds } = useRefundStore();
  const isDriver = user?.role === 'driver';
  const isAdmin = user?.role === 'admin';
  const [showNotif, setShowNotif] = useState(false);

  // Fetch refunds once when user is logged in (customer only)
  useEffect(() => {
    if (user && !isDriver && !isAdmin) {
      fetchMyRefunds();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  // Only show navbar on web for now, or adapt for mobile later
  if (Platform.OS !== 'web') return null;

  const isActive = (path: string) => {
    // Simple check for active segment
    return segments.join('/').includes(path);
  };

  // Only customers see refund notifications — drivers/admins have 0 badge
  const notifCount = (!isDriver && !isAdmin) ? refunds.length : 0;
  const formatShortDate = (iso: string) =>
    new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

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
            <TouchableOpacity style={styles.navLink} onPress={() => router.push('/(admin)' as any)}>
              <Text style={[styles.navLinkText, isActive('(admin)') && styles.activeText]}>
                Admin Dashboard
              </Text>
            </TouchableOpacity>
          ) : isDriver ? (
            <TouchableOpacity style={styles.navLink} onPress={() => router.push('/(driver)' as any)}>
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
              <TouchableOpacity style={styles.navLink} onPress={() => router.push('/tentang' as any)}>
                <Text style={styles.navLinkText}>Tentang E-FUEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navLink} onPress={() => router.push('/')}>
                <Text style={styles.navLinkText}>Cara Kerja</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navLink} onPress={() => router.push('/area-layanan' as any)}>
                <Text style={styles.navLinkText}>Area Layanan</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navLink} onPress={() => router.push('/premium' as any)}>
                <Text style={[styles.navLinkText, isActive('premium') && styles.activeText]}>
                  Premium
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.navLink} onPress={() => router.push('/faq' as any)}>
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

              {/* ── Notification Bell ── */}
              <View style={styles.bellWrapper}>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => setShowNotif((v) => !v)}
                >
                  <Ionicons
                    name={showNotif ? 'notifications' : 'notifications-outline'}
                    size={24}
                    color={notifCount > 0 ? Colors.primary : Colors.text}
                  />
                  {notifCount > 0 && (
                    <View style={styles.notifBadge}>
                      <Text style={styles.notifBadgeText}>
                        {notifCount > 9 ? '9+' : notifCount}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Dropdown panel */}
                {showNotif && (
                  <View style={styles.notifDropdown}>
                    <View style={styles.notifHeader}>
                      <Text style={styles.notifHeaderText}>Notifikasi</Text>
                      <TouchableOpacity onPress={() => setShowNotif(false)}>
                        <Ionicons name="close" size={18} color={Colors.textMuted} />
                      </TouchableOpacity>
                    </View>

                    {/* Driver: no refund notifications */}
                    {isDriver ? (
                      <View style={styles.notifEmpty}>
                        <Ionicons name="car-outline" size={28} color={Colors.textMuted} />
                        <Text style={styles.notifEmptyText}>Notifikasi pesanan tampil di dashboard driver</Text>
                      </View>
                    ) : isAdmin ? (
                      <View style={styles.notifEmpty}>
                        <Ionicons name="shield-checkmark-outline" size={28} color={Colors.textMuted} />
                        <Text style={styles.notifEmptyText}>Kelola notifikasi di Admin Dashboard</Text>
                      </View>
                    ) : refunds.length === 0 ? (
                      <View style={styles.notifEmpty}>
                        <Ionicons name="notifications-off-outline" size={28} color={Colors.textMuted} />
                        <Text style={styles.notifEmptyText}>Belum ada notifikasi</Text>
                      </View>
                    ) : (
                      refunds.slice(0, 5).map((r) => {
                        const orderId = typeof r.orderId === 'string' ? r.orderId : r.orderId._id;
                        const shortId = `#${orderId.slice(-6).toUpperCase()}`;
                        const statusColor =
                          r.status === 'approved' || r.status === 'processed'
                            ? Colors.success
                            : r.status === 'rejected'
                            ? Colors.error
                            : Colors.warning;
                        return (
                          <TouchableOpacity
                            key={r._id}
                            style={styles.notifItem}
                            onPress={() => {
                              setShowNotif(false);
                              router.push('/(tabs)/orders' as any);
                            }}
                          >
                            <View style={[styles.notifDot, { backgroundColor: statusColor }]} />
                            <View style={{ flex: 1 }}>
                              <Text style={styles.notifTitle}>
                                Refund {r.status === 'pending' ? 'Diproses' : r.status === 'approved' ? 'Disetujui' : r.status === 'rejected' ? 'Ditolak' : 'Selesai'}
                              </Text>
                              <Text style={styles.notifBody} numberOfLines={1}>
                                Pengajuan refund untuk transaksi {shortId}
                              </Text>
                              <Text style={styles.notifDate}>{formatShortDate(r.createdAt)}</Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })
                    )}

                    {!isDriver && !isAdmin && (
                      <TouchableOpacity
                        style={styles.notifFooter}
                        onPress={() => {
                          setShowNotif(false);
                          router.push('/(tabs)/orders' as any);
                        }}
                      >
                        <Text style={styles.notifFooterText}>Lihat Pesanan Saya →</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>

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
  },

  // ── Notification bell ──
  bellWrapper: {
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: Colors.error,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  notifBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  notifDropdown: {
    position: 'absolute',
    top: 40,
    right: 0,
    width: 320,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    zIndex: 999,
    ...Shadows.large,
    overflow: 'hidden',
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  notifHeaderText: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.text,
  },
  notifEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  notifEmptyText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  notifDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
    flexShrink: 0,
  },
  notifTitle: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  notifBody: {
    ...Typography.caption,
    color: Colors.textMuted,
    lineHeight: 16,
    marginBottom: 2,
  },
  notifDate: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 10,
  },
  notifFooter: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  notifFooterText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.primary,
  },
});
