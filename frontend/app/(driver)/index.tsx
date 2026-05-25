import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/useAuthStore';
import { useDriverStore } from '../../store/useDriverStore';
import { getSocket } from '../../services/socket';
import { Order, OrderStatus } from '../../types';

type BadgeStatus = 'success' | 'warning' | 'error' | 'info' | 'default';

const STATUS_INFO: Record<OrderStatus, { label: string; badge: BadgeStatus }> = {
  pending: { label: 'Menunggu', badge: 'warning' },
  accepted: { label: 'Diterima', badge: 'info' },
  on_the_way: { label: 'Dalam Perjalanan', badge: 'info' },
  arrived: { label: 'Tiba di Lokasi', badge: 'info' },
  fueling: { label: 'Sedang Mengisi', badge: 'info' },
  delivered: { label: 'Selesai', badge: 'success' },
  cancelled: { label: 'Dibatalkan', badge: 'error' },
};

// Next status in the driver's workflow
const NEXT_STATUS: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  accepted: { status: 'on_the_way', label: 'Mulai Berangkat' },
  on_the_way: { status: 'arrived', label: 'Sudah Tiba di Lokasi' },
  arrived: { status: 'fueling', label: 'Mulai Mengisi' },
  fueling: { status: 'delivered', label: 'Selesaikan Pesanan' },
};

const formatIDR = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');
const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

export default function DriverDashboard() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width <= 480;
  const { user, signOut } = useAuthStore();
  const {
    availableOrders,
    myOrders,
    isOnline,
    isLoading,
    isSubmitting,
    error,
    fetchAvailable,
    fetchMyOrders,
    acceptOrder,
    updateStatus,
    setOnline,
    applyOrderUpdate,
    prependNewOrder,
    dismissAvailable,
    reset,
  } = useDriverStore();

  // Simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const simRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeOrder = useMemo<Order | null>(
    () => myOrders.find((o) => !['delivered', 'cancelled'].includes(o.status)) ?? null,
    [myOrders]
  );

  const history = useMemo(
    () => myOrders.filter((o) => ['delivered', 'cancelled'].includes(o.status)).slice(0, 5),
    [myOrders]
  );

  // ===== Initial fetch + socket subscription =====
  useEffect(() => {
    fetchAvailable();
    fetchMyOrders();

    const socket = getSocket();
    socket.emit('join_drivers');

    const onNewOrder = (order: Order) => prependNewOrder(order);
    const onOrderStatus = ({ order }: { order: Order }) => applyOrderUpdate(order);

    socket.on('new_order', onNewOrder);
    socket.on('order_status', onOrderStatus);

    return () => {
      socket.off('new_order', onNewOrder);
      socket.off('order_status', onOrderStatus);
      socket.emit('leave_drivers');
      stopSimulation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stop simulating when the order ends
  useEffect(() => {
    if (activeOrder && ['delivered', 'cancelled'].includes(activeOrder.status)) {
      stopSimulation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOrder?.status]);

  // ===== Simulation: driver moves toward customer, emitting live location =====
  const stopSimulation = () => {
    if (simRef.current) {
      clearInterval(simRef.current);
      simRef.current = null;
    }
    setIsSimulating(false);
  };

  const startSimulation = async () => {
    if (!activeOrder || isSimulating) return;
    const dest = activeOrder.location.coordinates;

    // Try real GPS as the starting point; fall back to a point ~1 km away
    let start = { lat: dest.lat - 0.008, lng: dest.lng + 0.008 };
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status === 'granted') {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        start = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      }
    } catch {
      /* keep fallback */
    }

    const socket = getSocket();
    socket.emit('join_order', activeOrder._id);

    setIsSimulating(true);
    setSimProgress(0);

    const TOTAL_STEPS = 20; // 20 × 2s = 40s journey
    let step = 0;
    simRef.current = setInterval(() => {
      step++;
      const t = Math.min(step / TOTAL_STEPS, 1);
      const lat = start.lat + (dest.lat - start.lat) * t;
      const lng = start.lng + (dest.lng - start.lng) * t;
      socket.emit('driver_location', { orderId: activeOrder._id, lat, lng });
      setSimProgress(Math.round(t * 100));
      if (t >= 1) stopSimulation();
    }, 2000);
  };

  // ===== Status actions =====
  const handleAccept = async (id: string) => {
    try {
      await acceptOrder(id);
    } catch {
      /* error in store */
    }
  };

  const handleAdvance = async (status: OrderStatus) => {
    if (!activeOrder) return;
    try {
      const updated = await updateStatus(activeOrder._id, status);
      if (status === 'on_the_way') {
        router.push(`/driver/tracking/${updated._id}` as any);
      }
    } catch {
      /* error in store */
    }
  };

  const handleSignOut = async () => {
    stopSimulation();
    reset();
    await signOut();
  };

  // ===== Render =====
  const renderActiveOrder = () => {
    if (!activeOrder) return null;
    const info = STATUS_INFO[activeOrder.status];
    const next = NEXT_STATUS[activeOrder.status];
    const customer = typeof activeOrder.userId === 'object' ? activeOrder.userId : null;

    return (
      <Card style={[styles.activeCard, isMobile && styles.cardMobile]}>
        <View style={styles.activeTop}>
          <View>
            <Text style={styles.activeTitle}>Pesanan Aktif</Text>
            <Text style={styles.activeMeta}>
              #{activeOrder._id.slice(-6).toUpperCase()} · {formatTime(activeOrder.createdAt)}
            </Text>
          </View>
          <Badge label={info.label} status={info.badge} />
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Ionicons name="person-circle-outline" size={20} color={Colors.textMuted} />
          <Text style={styles.detailValue}>
            {customer?.name || 'Pelanggan'} · {customer?.phone || '-'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="water" size={20} color={Colors.primary} />
          <Text style={styles.detailValue}>
            {activeOrder.fuelType} · {activeOrder.liters} Liter ·{' '}
            <Text style={styles.priceText}>{formatIDR(activeOrder.totalPrice)}</Text>
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={20} color={Colors.textMuted} />
          <Text style={styles.detailValue}>{activeOrder.location.address}</Text>
        </View>
        {activeOrder.notes ? (
          <View style={styles.detailRow}>
            <Ionicons name="chatbubble-outline" size={20} color={Colors.textMuted} />
            <Text style={styles.detailValue}>{activeOrder.notes}</Text>
          </View>
        ) : null}

        {next && (
          <Button
            title={next.label}
            onPress={() => handleAdvance(next.status)}
            isLoading={isSubmitting}
            style={styles.advanceBtn}
          />
        )}

        <TouchableOpacity
          style={styles.navigationBtn}
          onPress={() => router.push(`/driver/tracking/${activeOrder._id}` as any)}
        >
          <Ionicons name="navigate-circle-outline" size={18} color={Colors.textInverse} />
          <Text style={styles.navigationBtnText}>Lihat Rute & Detail Antar</Text>
        </TouchableOpacity>

        {/* Chat with customer */}
        <TouchableOpacity
          style={styles.chatWithCustomerBtn}
          onPress={() => router.push(`/chat/${activeOrder._id}` as any)}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={18} color={Colors.primary} />
          <Text style={styles.chatWithCustomerText}>Chat dengan Pelanggan</Text>
        </TouchableOpacity>

        {/* Live location sharing */}
        {(activeOrder.status === 'on_the_way' || activeOrder.status === 'arrived') && (
          <View style={styles.simBox}>
            <View style={styles.simHeader}>
              <Ionicons
                name={isSimulating ? 'radio' : 'paper-plane-outline'}
                size={18}
                color={isSimulating ? Colors.success : Colors.primary}
              />
              <Text style={styles.simHeaderText}>
                {isSimulating
                  ? `Mengirim lokasi… ${simProgress}%`
                  : 'Bagikan lokasi ke pelanggan'}
              </Text>
            </View>
            {isSimulating ? (
              <>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${simProgress}%` }]} />
                </View>
                <TouchableOpacity onPress={stopSimulation} style={styles.simStopBtn}>
                  <Text style={styles.simStopText}>Hentikan</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Button
                title="Mulai Bagikan Lokasi (Simulasi)"
                variant="outline"
                size="small"
                onPress={startSimulation}
              />
            )}
          </View>
        )}
      </Card>
    );
  };

  const renderAvailable = (item: Order) => {
    const customer = typeof item.userId === 'object' ? item.userId : null;
    return (
      <Card key={item._id} style={[styles.availCard, isMobile && styles.cardMobile]}>
        <View style={styles.availTop}>
          <Text style={styles.availFuel}>
            {item.fuelType} · {item.liters} L
          </Text>
          <Text style={styles.availPrice}>{formatIDR(item.totalPrice)}</Text>
        </View>
        <Text style={styles.availAddress} numberOfLines={2}>
          📍 {item.location.address}
        </Text>
        <Text style={styles.availMeta}>
          {customer?.name || 'Pelanggan'} · {formatTime(item.createdAt)}
        </Text>
        <View style={[styles.availActions, isMobile && styles.availActionsMobile]}>
          <Button
            title="Tolak"
            variant="outline"
            size="small"
            onPress={() => dismissAvailable(item._id)}
            style={styles.rejectBtn}
          />
          <Button
            title="Terima Pesanan"
            size="small"
            onPress={() => handleAccept(item._id)}
            isLoading={isSubmitting}
            style={styles.acceptBtn}
          />
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={[styles.scrollContent, isMobile && styles.scrollContentMobile]}>
        <View style={[styles.inner, isMobile && styles.innerMobile]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.greeting, isMobile && styles.greetingMobile]}>Halo, {user?.name?.split(' ')[0] || 'Driver'} 👋</Text>
              <Text style={styles.subtitle}>
                {user?.vehicle || '-'} · {user?.plateNumber || '-'} · ⭐ {(user?.rating ?? 5).toFixed(1)} {user?.ratingCount ? `(${user.ratingCount})` : ''}
              </Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={[styles.onlinePill, isOnline ? styles.onlinePillOn : styles.onlinePillOff]}
                onPress={() => setOnline(!isOnline)}
              >
                <View style={[styles.dot, isOnline ? styles.dotOn : styles.dotOff]} />
                <Text style={styles.onlineText}>{isOnline ? 'Online' : 'Offline'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
                <Ionicons name="log-out-outline" size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Active order */}
          {renderActiveOrder()}

          {/* Available orders — hidden while a delivery is in progress */}
          {!activeOrder && (
            <View style={{ gap: Spacing.md }}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Pesanan Tersedia</Text>
                <TouchableOpacity onPress={fetchAvailable} style={styles.refreshBtn}>
                  <Ionicons name="refresh" size={16} color={Colors.primary} />
                  <Text style={styles.refreshText}>Muat Ulang</Text>
                </TouchableOpacity>
              </View>

              {isLoading && availableOrders.length === 0 ? (
                <View style={styles.center}>
                  <ActivityIndicator color={Colors.primary} />
                </View>
              ) : availableOrders.length === 0 ? (
                <View style={styles.center}>
                  <Ionicons name="time-outline" size={42} color={Colors.textMuted} />
                  <Text style={styles.muted}>
                    {isOnline
                      ? 'Belum ada pesanan baru. Pesanan akan muncul otomatis…'
                      : 'Anda sedang offline.'}
                  </Text>
                </View>
              ) : (
                availableOrders.map(renderAvailable)
              )}
            </View>
          )}

          {/* History */}
          {history.length > 0 && (
            <View style={{ gap: Spacing.md }}>
              <Text style={styles.sectionTitle}>Riwayat Terakhir</Text>
              {history.map((o) => {
                const info = STATUS_INFO[o.status];
                return (
                  <Card key={o._id} style={[styles.historyCard, isMobile && styles.cardMobile]}>
                    <View style={styles.historyTop}>
                      <Text style={styles.historyFuel}>
                        {o.fuelType} · {o.liters} L
                      </Text>
                      <Badge label={info.label} status={info.badge} />
                    </View>
                    <Text style={styles.historyMeta}>
                      {formatIDR(o.totalPrice)} ·{' '}
                      {new Date(o.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </Text>
                  </Card>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  scrollContentMobile: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  inner: { width: '100%', maxWidth: 900, alignSelf: 'center', gap: Spacing.xl },
  innerMobile: { gap: Spacing.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  greeting: { ...Typography.h2, color: Colors.text },
  greetingMobile: { fontSize: 24, lineHeight: 30 },
  subtitle: { ...Typography.bodySmall, color: Colors.textMuted, marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
  },
  onlinePillOn: { borderColor: Colors.success, backgroundColor: 'rgba(16,185,129,0.08)' },
  onlinePillOff: { borderColor: Colors.border, backgroundColor: Colors.surface },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotOn: { backgroundColor: Colors.success },
  dotOff: { backgroundColor: Colors.textMuted },
  onlineText: { ...Typography.caption, fontWeight: '700', color: Colors.text },
  signOutBtn: {
    padding: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  errorText: { color: Colors.error, ...Typography.bodySmall, fontWeight: '600' },
  // Active order
  activeCard: { padding: Spacing.xl, ...Shadows.medium, borderWidth: 2, borderColor: Colors.primary },
  cardMobile: { padding: Spacing.md },
  activeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  activeTitle: { ...Typography.h3, color: Colors.text },
  activeMeta: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: Spacing.md },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  detailValue: { ...Typography.body, color: Colors.text, flex: 1 },
  priceText: { color: Colors.primary, fontWeight: '800' },
  advanceBtn: { marginTop: Spacing.lg, paddingVertical: Spacing.md },
  navigationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    paddingVertical: 11,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
  },
  navigationBtnText: {
    ...Typography.bodySmall,
    color: Colors.textInverse,
    fontWeight: '800',
  },
  // Simulation
  simBox: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  simHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  simHeaderText: { ...Typography.bodySmall, color: Colors.text, fontWeight: '700' },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: Colors.success },
  simStopBtn: { alignSelf: 'flex-start' },
  chatWithCustomerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.secondary,
  },
  chatWithCustomerText: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.primary,
  },
  simStopText: { ...Typography.bodySmall, color: Colors.error, fontWeight: '700' },
  // Section
  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { ...Typography.h3, color: Colors.text },
  refreshBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 6 },
  refreshText: { ...Typography.caption, color: Colors.primary, fontWeight: '700' },
  // Available cards
  availCard: { padding: Spacing.lg },
  availTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  availFuel: { ...Typography.bodyLarge, fontWeight: '800', color: Colors.text },
  availPrice: { ...Typography.bodyLarge, color: Colors.primary, fontWeight: '800' },
  availAddress: { ...Typography.bodySmall, color: Colors.textMuted, marginTop: Spacing.sm },
  availMeta: { ...Typography.caption, color: Colors.textMuted, marginTop: 4 },
  availActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  availActionsMobile: { justifyContent: 'flex-start' },
  rejectBtn: { minWidth: 80 },
  acceptBtn: { minWidth: 140 },
  // Empty
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  muted: { ...Typography.bodySmall, color: Colors.textMuted, textAlign: 'center' },
  // History
  historyCard: { padding: Spacing.md, backgroundColor: Colors.surface },
  historyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  historyFuel: { ...Typography.body, fontWeight: '700', color: Colors.text },
  historyMeta: { ...Typography.caption, color: Colors.textMuted, marginTop: 4 },
});
