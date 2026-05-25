import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../../constants/theme';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import TrackingMap, { LatLng } from '../../../components/TrackingMap';
import { orderService } from '../../../services/orderService';
import { getSocket } from '../../../services/socket';
import { useDriverStore } from '../../../store/useDriverStore';
import { Order, OrderStatus } from '../../../types';

type BadgeStatus = 'success' | 'warning' | 'error' | 'info' | 'default';

const STATUS_INFO: Record<OrderStatus, { label: string; badge: BadgeStatus }> = {
  pending: { label: 'Menunggu Driver', badge: 'warning' },
  accepted: { label: 'Diterima', badge: 'info' },
  on_the_way: { label: 'Dalam Perjalanan', badge: 'info' },
  arrived: { label: 'Tiba di Lokasi', badge: 'info' },
  fueling: { label: 'Sedang Mengisi', badge: 'info' },
  delivered: { label: 'Selesai', badge: 'success' },
  cancelled: { label: 'Dibatalkan', badge: 'error' },
};

const NEXT_STATUS: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  accepted: { status: 'on_the_way', label: 'Mulai Berangkat' },
  on_the_way: { status: 'arrived', label: 'Tandai Tiba di Lokasi' },
  arrived: { status: 'fueling', label: 'Mulai Mengisi BBM' },
  fueling: { status: 'delivered', label: 'Selesai Antar' },
};

const SHAREABLE_STATUSES: OrderStatus[] = ['on_the_way', 'arrived', 'fueling'];

const formatIDR = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

export default function DriverTrackingScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width <= 480;
  const applyOrderUpdate = useDriverStore((state) => state.applyOrderUpdate);

  const [order, setOrder] = useState<Order | null>(null);
  const [driverLoc, setDriverLoc] = useState<LatLng | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locationHint, setLocationHint] = useState('Lokasi driver belum tersedia. Gunakan alamat tujuan sebagai panduan.');
  const [updating, setUpdating] = useState(false);
  const locationWatchCleanup = useRef<(() => void) | null>(null);

  const stopLocationWatch = useCallback(() => {
    try {
      locationWatchCleanup.current?.();
    } catch {
      // Web geolocation cleanup can vary between Expo versions; never block the page on cleanup.
    }
    locationWatchCleanup.current = null;
  }, []);

  useEffect(() => {
    if (!orderId) return;

    let mounted = true;
    setLoading(true);
    orderService
      .getOrderById(orderId)
      .then((data) => {
        if (!mounted) return;
        setOrder(data);
        if (data.driverLocation?.lat != null && data.driverLocation?.lng != null) {
          setDriverLoc({ lat: data.driverLocation.lat, lng: data.driverLocation.lng });
        }
        setLoading(false);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e.message || 'Gagal memuat pesanan');
        setLoading(false);
      });

    const socket = getSocket();
    socket.emit('join_order', orderId);

    const onStatus = (payload: { orderId: string; order: Order }) => {
      if (payload.orderId !== orderId) return;
      setOrder(payload.order);
      applyOrderUpdate(payload.order);
    };
    socket.on('order_status', onStatus);

    return () => {
      mounted = false;
      socket.off('order_status', onStatus);
      socket.emit('leave_order', orderId);
      stopLocationWatch();
    };
  }, [applyOrderUpdate, orderId, stopLocationWatch]);

  useEffect(() => {
    if (!order || !SHAREABLE_STATUSES.includes(order.status)) {
      stopLocationWatch();
      return;
    }

    let cancelled = false;
    const socket = getSocket();
    socket.emit('join_order', order._id);

    const emitLocation = (coords: LatLng) => {
      setDriverLoc(coords);
      socket.emit('driver_location', {
        orderId: order._id,
        lat: coords.lat,
        lng: coords.lng,
      });
    };

    const startLocationWatch = async () => {
      stopLocationWatch();
      try {
        if (Platform.OS === 'web') {
          if (typeof navigator === 'undefined' || !navigator.geolocation) {
            setLocationHint('Lokasi driver belum tersedia. Gunakan alamat tujuan sebagai panduan.');
            return;
          }

          const handlePosition = (position: { coords: { latitude: number; longitude: number } }) => {
            if (cancelled) return;
            emitLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            setLocationHint('Lokasi driver aktif dan dikirim ke pelanggan.');
          };

          const handlePositionError = () => {
            if (!cancelled) {
              setLocationHint('Lokasi driver belum tersedia. Gunakan alamat tujuan sebagai panduan.');
            }
          };

          const options = {
            enableHighAccuracy: false,
            maximumAge: 10000,
            timeout: 10000,
          };

          navigator.geolocation.getCurrentPosition(handlePosition, handlePositionError, options);
          const watchId = navigator.geolocation.watchPosition(handlePosition, handlePositionError, options);

          if (cancelled) {
            navigator.geolocation.clearWatch(watchId);
          } else {
            locationWatchCleanup.current = () => navigator.geolocation.clearWatch(watchId);
          }
          return;
        }

        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== 'granted') {
          setLocationHint('Lokasi driver belum tersedia. Gunakan alamat tujuan sebagai panduan.');
          return;
        }

        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (cancelled) return;

        emitLocation({
          lat: current.coords.latitude,
          lng: current.coords.longitude,
        });
        setLocationHint('Lokasi driver aktif dan dikirim ke pelanggan.');

        const watcher = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 20,
            timeInterval: 5000,
          },
          (pos) => {
            emitLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
          }
        );

        if (cancelled) watcher.remove();
        else locationWatchCleanup.current = () => watcher.remove();
      } catch {
        setLocationHint('Lokasi driver belum tersedia. Gunakan alamat tujuan sebagai panduan.');
      }
    };

    startLocationWatch();

    return () => {
      cancelled = true;
      stopLocationWatch();
    };
  }, [order, stopLocationWatch]);

  const updateStatus = async (nextStatus: OrderStatus) => {
    if (!order) return;
    setUpdating(true);
    setError('');
    try {
      const updated = await orderService.updateOrderStatus(order._id, nextStatus);
      setOrder(updated);
      applyOrderUpdate(updated);
      if (nextStatus === 'delivered') {
        stopLocationWatch();
        setLocationHint('Pesanan selesai. Lokasi driver tidak lagi dikirim.');
      }
    } catch (e: any) {
      setError(e.message || 'Gagal memperbarui status');
    } finally {
      setUpdating(false);
    }
  };

  const openMaps = () => {
    if (!order) return;
    const { lat, lng } = order.location.coordinates;
    const destination = encodeURIComponent(`${lat},${lng}`);
    const label = encodeURIComponent(order.location.address || 'Tujuan pengiriman');
    const url =
      Platform.OS === 'ios'
        ? `maps:0,0?q=${label}@${lat},${lng}`
        : `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.muted}>Memuat detail pengantaran...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
          <Text style={styles.muted}>{error || 'Pesanan tidak ditemukan'}</Text>
          <Button title="Kembali ke Dashboard" onPress={() => router.replace('/(driver)' as any)} />
        </View>
      </SafeAreaView>
    );
  }

  const customer = typeof order.userId === 'object' ? order.userId : null;
  const info = STATUS_INFO[order.status];
  const next = NEXT_STATUS[order.status];
  const mapHeight = isMobile ? 220 : 320;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={[styles.scrollContent, isMobile && styles.scrollContentMobile]}>
        <View style={styles.inner}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={Colors.text} />
            </TouchableOpacity>
            <View style={styles.headerCopy}>
              <Text style={[styles.title, isMobile && styles.titleMobile]}>Antar Pesanan</Text>
              <Text style={styles.subtitle}>#{order._id.slice(-6).toUpperCase()}</Text>
            </View>
            <Badge label={info.label} status={info.badge} />
          </View>

          {!!error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={18} color={Colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Card style={styles.mapCard}>
            <TrackingMap destination={order.location.coordinates} driver={driverLoc} height={mapHeight} />
            <View style={styles.locationHintRow}>
              <Ionicons
                name={driverLoc ? 'radio-outline' : 'navigate-outline'}
                size={18}
                color={driverLoc ? Colors.success : Colors.textMuted}
              />
              <Text style={styles.locationHint}>{locationHint}</Text>
            </View>
          </Card>

          <View style={[styles.contentGrid, !isMobile && styles.contentGridDesktop]}>
            <Card style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Tujuan Customer</Text>
              <View style={styles.detailRow}>
                <Ionicons name="person-circle-outline" size={20} color={Colors.primary} />
                <View style={styles.detailCopy}>
                  <Text style={styles.detailLabel}>Customer</Text>
                  <Text style={styles.detailValue}>{customer?.name || 'Pelanggan'}</Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="call-outline" size={20} color={Colors.primary} />
                <View style={styles.detailCopy}>
                  <Text style={styles.detailLabel}>Nomor Telepon</Text>
                  <Text style={styles.detailValue}>{customer?.phone || '-'}</Text>
                </View>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={20} color={Colors.primary} />
                <View style={styles.detailCopy}>
                  <Text style={styles.detailLabel}>Alamat Pengiriman</Text>
                  <Text style={styles.detailValue}>{order.location.address}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.mapsBtn} onPress={openMaps}>
                <Ionicons name="map-outline" size={18} color={Colors.primary} />
                <Text style={styles.mapsBtnText}>Buka di Maps</Text>
              </TouchableOpacity>
            </Card>

            <Card style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Detail Pesanan</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Jenis BBM</Text>
                <Text style={styles.summaryValue}>{order.fuelType}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Jumlah</Text>
                <Text style={styles.summaryValue}>{order.liters} Liter</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Pembayaran</Text>
                <Text style={styles.summaryValue}>{formatIDR(order.totalPrice)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Metode Bayar</Text>
                <Text style={styles.summaryValue}>{order.paymentMethod.toUpperCase()}</Text>
              </View>
              <View style={styles.notesBox}>
                <Text style={styles.detailLabel}>Catatan Customer</Text>
                <Text style={styles.notesText}>{order.notes || 'Tidak ada catatan.'}</Text>
              </View>
            </Card>
          </View>

          <Card style={styles.actionCard}>
            <View style={styles.actionHeader}>
              <Text style={styles.sectionTitle}>Aksi Driver</Text>
              <Badge label={info.label} status={info.badge} />
            </View>
            <View style={[styles.actions, isMobile && styles.actionsMobile]}>
              <Button
                title="Chat dengan Pelanggan"
                variant="outline"
                onPress={() => router.push(`/chat/${order._id}` as any)}
                style={styles.actionBtn}
                icon={<Ionicons name="chatbubble-ellipses-outline" size={18} color={Colors.primary} />}
              />
              {next ? (
                <Button
                  title={next.label}
                  onPress={() => updateStatus(next.status)}
                  isLoading={updating}
                  style={styles.actionBtn}
                />
              ) : (
                <Button
                  title="Kembali ke Dashboard"
                  onPress={() => router.replace('/(driver)' as any)}
                  style={styles.actionBtn}
                />
              )}
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  scrollContentMobile: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  inner: { width: '100%', maxWidth: 960, alignSelf: 'center', gap: Spacing.lg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.lg },
  muted: { ...Typography.bodySmall, color: Colors.textMuted, textAlign: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  headerCopy: { flex: 1, minWidth: 180 },
  title: { ...Typography.h2, color: Colors.text },
  titleMobile: { fontSize: 24 },
  subtitle: { ...Typography.bodySmall, color: Colors.textMuted, marginTop: 2 },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#FEF2F2',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: { ...Typography.bodySmall, color: Colors.error, flex: 1 },
  mapCard: { padding: Spacing.md, gap: Spacing.md },
  locationHintRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  locationHint: { ...Typography.bodySmall, color: Colors.textMuted, flex: 1 },
  contentGrid: { gap: Spacing.lg },
  contentGridDesktop: { flexDirection: 'row', alignItems: 'stretch' },
  infoCard: { flex: 1, padding: Spacing.lg, gap: Spacing.md },
  sectionTitle: { ...Typography.h3, color: Colors.text },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  detailCopy: { flex: 1 },
  detailLabel: { ...Typography.caption, color: Colors.textMuted, fontWeight: '700', marginBottom: 2 },
  detailValue: { ...Typography.bodySmall, color: Colors.text, fontWeight: '600', lineHeight: 20 },
  mapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.secondary,
    paddingVertical: 10,
    marginTop: Spacing.xs,
  },
  mapsBtnText: { ...Typography.bodySmall, color: Colors.primary, fontWeight: '800' },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  summaryLabel: { ...Typography.bodySmall, color: Colors.textMuted, flex: 1 },
  summaryValue: { ...Typography.bodySmall, color: Colors.text, fontWeight: '800', textAlign: 'right', flex: 1 },
  notesBox: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.xs,
  },
  notesText: { ...Typography.bodySmall, color: Colors.text, lineHeight: 20 },
  actionCard: { padding: Spacing.lg, ...Shadows.medium },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  actions: { flexDirection: 'row', gap: Spacing.md },
  actionsMobile: { flexDirection: 'column' },
  actionBtn: { flex: 1 },
});
