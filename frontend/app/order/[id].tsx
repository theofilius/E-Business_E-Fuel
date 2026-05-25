import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Alert,
  Linking,
  Image,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import TrackingMap, { LatLng } from '../../components/TrackingMap';
import { orderService } from '../../services/orderService';
import { getSocket } from '../../services/socket';
import { Order, OrderStatus } from '../../types';

type BadgeStatus = 'success' | 'warning' | 'error' | 'info' | 'default';

const STATUS_INFO: Record<OrderStatus, { label: string; badge: BadgeStatus }> = {
  pending: { label: 'Menunggu Driver', badge: 'warning' },
  accepted: { label: 'Diterima', badge: 'info' },
  on_the_way: { label: 'Dalam Perjalanan', badge: 'info' },
  arrived: { label: 'Driver Tiba', badge: 'info' },
  fueling: { label: 'Mengisi Bahan Bakar', badge: 'info' },
  delivered: { label: 'Selesai', badge: 'success' },
  cancelled: { label: 'Dibatalkan', badge: 'error' },
};

const STEPS: { key: OrderStatus; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'pending', label: 'Pesanan Dibuat', icon: 'receipt-outline' },
  { key: 'accepted', label: 'Diterima Driver', icon: 'checkmark-circle-outline' },
  { key: 'on_the_way', label: 'Driver Dalam Perjalanan', icon: 'car-outline' },
  { key: 'arrived', label: 'Driver Tiba di Lokasi', icon: 'pin-outline' },
  { key: 'fueling', label: 'Sedang Mengisi', icon: 'water-outline' },
  { key: 'delivered', label: 'Pesanan Selesai', icon: 'checkmark-done' },
];

const STATUS_ORDER: OrderStatus[] = [
  'pending',
  'accepted',
  'on_the_way',
  'arrived',
  'fueling',
  'delivered',
];

const isReached = (current: OrderStatus, step: OrderStatus) =>
  STATUS_ORDER.indexOf(current) >= STATUS_ORDER.indexOf(step);

const formatIDR = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width <= 480;
  const [order, setOrder] = useState<Order | null>(null);
  const [driverLoc, setDriverLoc] = useState<LatLng | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!id) return;

    let mounted = true;
    setLoading(true);
    orderService
      .getOrderById(id)
      .then((o) => {
        if (!mounted) return;
        setOrder(o);
        if (o.driverLocation?.lat != null && o.driverLocation?.lng != null) {
          setDriverLoc({ lat: o.driverLocation.lat, lng: o.driverLocation.lng });
        }
        setLoading(false);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e.message);
        setLoading(false);
      });

    const socket = getSocket();
    socket.emit('join_order', id);

    const onStatus = (payload: { orderId: string; order: Order }) => {
      if (payload.orderId !== id) return;
      setOrder(payload.order);
    };
    const onLoc = (payload: { orderId: string; lat: number; lng: number }) => {
      if (payload.orderId !== id) return;
      setDriverLoc({ lat: payload.lat, lng: payload.lng });
    };
    socket.on('order_status', onStatus);
    socket.on('driver_location', onLoc);

    return () => {
      mounted = false;
      socket.emit('leave_order', id);
      socket.off('order_status', onStatus);
      socket.off('driver_location', onLoc);
    };
  }, [id]);

  const confirmCancel = () => {
    const doCancel = async () => {
      if (!order) return;
      setCancelling(true);
      try {
        const updated = await orderService.cancelOrder(order._id);
        setOrder(updated);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setCancelling(false);
      }
    };
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Batalkan pesanan ini?')) {
        doCancel();
      }
    } else {
      Alert.alert('Batalkan Pesanan', 'Yakin ingin membatalkan pesanan ini?', [
        { text: 'Tidak', style: 'cancel' },
        { text: 'Ya, Batalkan', style: 'destructive', onPress: doCancel },
      ]);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.muted}>Memuat pesanan…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
          <Text style={styles.muted}>{error || 'Pesanan tidak ditemukan'}</Text>
          <Button title="Kembali" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const info = STATUS_INFO[order.status];
  const driver = typeof order.driverId === 'object' ? order.driverId : null;
  const isCancellable = order.status === 'pending' || order.status === 'accepted';
  const isFinished = order.status === 'delivered' || order.status === 'cancelled';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={[styles.scrollContent, isMobile && styles.scrollContentMobile]}>
        <View style={styles.inner}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={Colors.text} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Lacak Pesanan</Text>
              <Text style={styles.subtitle}>#{order._id.slice(-6).toUpperCase()}</Text>
            </View>
            <Badge label={info.label} status={info.badge} />
          </View>

          {/* Cancelled banner */}
          {order.status === 'cancelled' && (
            <Card style={[styles.banner, styles.bannerError]}>
              <Ionicons name="close-circle" size={24} color={Colors.error} />
              <Text style={styles.bannerText}>Pesanan ini telah dibatalkan.</Text>
            </Card>
          )}

          {/* Delivered banner */}
          {order.status === 'delivered' && (
            <Card style={[styles.banner, styles.bannerSuccess]}>
              <Ionicons name="checkmark-done-circle" size={24} color={Colors.success} />
              <Text style={styles.bannerText}>Pesanan telah selesai. Terima kasih! 🎉</Text>
            </Card>
          )}

          {/* Live map */}
          <TrackingMap
            destination={order.location.coordinates}
            driver={driverLoc}
            height={isMobile ? 220 : 320}
          />

          {/* Driver info (when assigned) */}
          {driver && (
            <Card style={styles.driverCard}>
              <View style={styles.driverHeader}>
                <View style={styles.driverAvatar}>
                  <Text style={styles.driverAvatarText}>
                    {driver.name?.charAt(0).toUpperCase() || 'D'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.driverName}>{driver.name}</Text>
                  <Text style={styles.driverMeta}>
                    {driver.vehicle || '-'} · {driver.plateNumber || '-'}
                  </Text>
                  <Text style={styles.driverRating}>⭐ {driver.rating ?? 5}</Text>
                </View>
                <View style={styles.driverActions}>
                  {driver.phone && (
                    <TouchableOpacity
                      style={styles.callBtn}
                      onPress={() => Linking.openURL(`tel:${driver.phone}`)}
                    >
                      <Ionicons name="call" size={18} color={Colors.textInverse} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.chatBtn}
                    onPress={() =>
                      router.push(
                        `/chat/${order._id}?driverName=${encodeURIComponent(driver.name)}` as any
                      )
                    }
                  >
                    <Ionicons name="chatbubble-ellipses" size={18} color={Colors.textInverse} />
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          )}

          {/* Timeline */}
          {order.status !== 'cancelled' && (
            <Card style={styles.timelineCard}>
              <Text style={styles.sectionHeader}>Status Pengiriman</Text>
              <View style={styles.timeline}>
                {STEPS.map((step, idx) => {
                  const reached = isReached(order.status, step.key);
                  const isCurrent = order.status === step.key;
                  return (
                    <View key={step.key} style={styles.timelineRow}>
                      <View style={styles.timelineCol}>
                        <View
                          style={[
                            styles.timelineDot,
                            reached && styles.timelineDotReached,
                            isCurrent && styles.timelineDotCurrent,
                          ]}
                        >
                          {reached ? (
                            <Ionicons name="checkmark" size={14} color="#fff" />
                          ) : (
                            <View style={styles.timelineDotInner} />
                          )}
                        </View>
                        {idx < STEPS.length - 1 && (
                          <View
                            style={[
                              styles.timelineLine,
                              reached && styles.timelineLineReached,
                            ]}
                          />
                        )}
                      </View>
                      <View style={styles.timelineContent}>
                        <Text
                          style={[
                            styles.timelineLabel,
                            (reached || isCurrent) && styles.timelineLabelActive,
                          ]}
                        >
                          {step.label}
                        </Text>
                        {isCurrent && (
                          <Text style={styles.timelineSubtle}>Sedang berlangsung…</Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </Card>
          )}

          {/* Order details */}
          <Card style={styles.detailsCard}>
            <Text style={styles.sectionHeader}>Detail Pesanan</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Bahan Bakar</Text>
              <Text style={styles.detailValue}>
                {order.fuelType} · {order.liters} L
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Harga / Liter</Text>
              <Text style={styles.detailValue}>{formatIDR(order.pricePerLiter)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Biaya Layanan</Text>
              <Text style={styles.detailValue}>{formatIDR(order.serviceFee)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Metode Bayar</Text>
              <Text style={styles.detailValue}>
                {order.paymentMethod.toUpperCase()} · {order.paymentStatus}
              </Text>
            </View>
            <View style={[styles.detailRow, styles.detailRowTotal]}>
              <Text style={styles.detailLabelTotal}>Total</Text>
              <Text style={styles.detailValueTotal}>{formatIDR(order.totalPrice)}</Text>
            </View>
            <View style={styles.addressRow}>
              <Ionicons name="location-outline" size={18} color={Colors.textMuted} />
              <Text style={styles.addressText}>{order.location.address}</Text>
            </View>
          </Card>

          {/* QR Code Verification for Paid Orders */}
          {order.paymentStatus === 'paid' && order.status !== 'cancelled' && (
            <Card style={styles.qrVerificationCard}>
              <View style={styles.qrVerificationHeader}>
                <Ionicons name="qr-code-outline" size={20} color={Colors.primary} />
                <Text style={styles.qrVerificationTitle}>QR Kode Verifikasi</Text>
              </View>
              <Text style={styles.qrVerificationDesc}>
                Tunjukkan QR kode ini ke petugas (driver) saat bensin selesai diisi untuk verifikasi pesanan Anda.
              </Text>
              <View style={styles.qrCodeWrapper}>
                <Image
                  source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(order._id)}` }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.qrRefText}>REF: {order.paymentRef || `EFUEL-${order._id.slice(-6).toUpperCase()}`}</Text>
            </Card>
          )}

          {/* Actions */}
          {isCancellable && (
            <Button
              title="Batalkan Pesanan"
              variant="outline"
              onPress={confirmCancel}
              isLoading={cancelling}
            />
          )}
          {isFinished && (
            <Button title="Kembali ke Pesanan Saya" onPress={() => router.replace('/(tabs)/orders')} />
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
  inner: { width: '100%', maxWidth: 900, alignSelf: 'center', gap: Spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.lg },
  muted: { ...Typography.bodySmall, color: Colors.textMuted, textAlign: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...Typography.h2, color: Colors.text },
  subtitle: { ...Typography.bodySmall, color: Colors.textMuted, marginTop: 2 },
  // Banners
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
  },
  bannerError: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
  bannerSuccess: { backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' },
  bannerText: { ...Typography.body, color: Colors.text, fontWeight: '600' },
  // Driver card
  driverCard: { padding: Spacing.lg },
  driverHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  driverAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverAvatarText: { ...Typography.h3, color: Colors.textInverse },
  driverName: { ...Typography.bodyLarge, fontWeight: '800', color: Colors.text },
  driverMeta: { ...Typography.bodySmall, color: Colors.textMuted, marginTop: 2 },
  driverRating: { ...Typography.caption, color: Colors.warning, fontWeight: '700', marginTop: 4 },
  driverActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  chatBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  // Timeline
  timelineCard: { padding: Spacing.lg },
  sectionHeader: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.md },
  timeline: { gap: 0 },
  timelineRow: { flexDirection: 'row', gap: Spacing.md, minHeight: 56 },
  timelineCol: { alignItems: 'center', width: 28 },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotReached: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  timelineDotCurrent: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  timelineDotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginTop: 2,
  },
  timelineLineReached: { backgroundColor: Colors.primary },
  timelineContent: { flex: 1, paddingBottom: Spacing.md },
  timelineLabel: { ...Typography.bodySmall, color: Colors.textMuted },
  timelineLabelActive: { color: Colors.text, fontWeight: '700' },
  timelineSubtle: { ...Typography.caption, color: Colors.primary, marginTop: 2, fontWeight: '600' },
  // Details
  detailsCard: { padding: Spacing.lg },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  detailRowTotal: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  detailLabel: { ...Typography.bodySmall, color: Colors.textMuted },
  detailValue: { ...Typography.bodySmall, color: Colors.text, fontWeight: '600' },
  detailLabelTotal: { ...Typography.bodyLarge, color: Colors.text, fontWeight: '800' },
  detailValueTotal: { ...Typography.h3, color: Colors.primary },
  addressRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  addressText: { ...Typography.bodySmall, color: Colors.text, flex: 1 },
  qrVerificationCard: {
    padding: Spacing.xl,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    ...Shadows.medium,
  },
  qrVerificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  qrVerificationTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  qrVerificationDesc: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.sm,
    lineHeight: 18,
  },
  qrCodeWrapper: {
    width: 170,
    height: 170,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...Shadows.small,
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },
  qrRefText: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontWeight: '700',
    marginTop: Spacing.md,
    letterSpacing: 1.5,
  },
});
