import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useOrderStore } from '../../store/useOrderStore';
import { Order, OrderStatus } from '../../types';

type BadgeStatus = 'success' | 'warning' | 'error' | 'info' | 'default';

const STATUS_INFO: Record<OrderStatus, { label: string; badge: BadgeStatus }> = {
  pending: { label: 'Menunggu Driver', badge: 'warning' },
  accepted: { label: 'Diterima', badge: 'info' },
  on_the_way: { label: 'Dalam Perjalanan', badge: 'info' },
  arrived: { label: 'Driver Tiba', badge: 'info' },
  fueling: { label: 'Sedang Mengisi', badge: 'info' },
  delivered: { label: 'Selesai', badge: 'success' },
  cancelled: { label: 'Dibatalkan', badge: 'error' },
};

const formatIDR = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function OrdersScreen() {
  const router = useRouter();
  const { orders, fetchOrders, isLoadingOrders, cancelOrder, error } = useOrderStore();

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmCancel = (id: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Batalkan pesanan ini?')) {
        cancelOrder(id).catch(() => {});
      }
    } else {
      Alert.alert('Batalkan Pesanan', 'Yakin ingin membatalkan pesanan ini?', [
        { text: 'Tidak', style: 'cancel' },
        {
          text: 'Ya, Batalkan',
          style: 'destructive',
          onPress: () => cancelOrder(id).catch(() => {}),
        },
      ]);
    }
  };

  const renderOrder = (item: Order) => {
    const info = STATUS_INFO[item.status] ?? { label: item.status, badge: 'default' as const };
    const canCancel = item.status === 'pending' || item.status === 'accepted';
    const canTrack = !['delivered', 'cancelled'].includes(item.status);
    const hasActions = canCancel || canTrack;

    return (
      <Card key={item._id} style={styles.orderCard}>
        <View style={styles.orderTop}>
          <View style={styles.orderTitleRow}>
            <View style={styles.fuelDot}>
              <Ionicons name="water" size={18} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fuelType}>{item.fuelType}</Text>
              <Text style={styles.orderId}>
                #{item._id.slice(-6).toUpperCase()} · {formatDate(item.createdAt)}
              </Text>
            </View>
          </View>
          <Badge label={info.label} status={info.badge} />
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Jumlah</Text>
          <Text style={styles.detailValue}>{item.liters} Liter</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Alamat</Text>
          <Text style={[styles.detailValue, styles.detailAddress]} numberOfLines={2}>
            {item.location?.address || '-'}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total Bayar</Text>
          <Text style={styles.totalValue}>{formatIDR(item.totalPrice)}</Text>
        </View>

        {hasActions && (
          <View style={styles.actions}>
            {canCancel && (
              <Button
                title="Batalkan"
                variant="outline"
                size="small"
                onPress={() => confirmCancel(item._id)}
              />
            )}
            {canTrack && (
              <Button
                title="Lacak Pesanan"
                size="small"
                onPress={() => router.push(`/order/${item._id}` as any)}
              />
            )}
          </View>
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.inner}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Pesanan Saya</Text>
              <Text style={styles.subtitle}>Riwayat dan status pengiriman bensin Anda.</Text>
            </View>
            <TouchableOpacity style={styles.refreshBtn} onPress={() => fetchOrders()}>
              <Ionicons name="refresh" size={18} color={Colors.primary} />
              <Text style={styles.refreshText}>Muat Ulang</Text>
            </TouchableOpacity>
          </View>

          {isLoadingOrders && orders.length === 0 ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.muted}>Memuat pesanan…</Text>
            </View>
          ) : error && orders.length === 0 ? (
            <View style={styles.center}>
              <Ionicons name="cloud-offline-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.muted}>{error}</Text>
              <Button title="Coba Lagi" size="small" onPress={() => fetchOrders()} />
            </View>
          ) : orders.length === 0 ? (
            <View style={styles.center}>
              <Ionicons name="receipt-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>Belum ada pesanan</Text>
              <Text style={styles.muted}>Pesanan bensin Anda akan muncul di sini.</Text>
            </View>
          ) : (
            <View style={styles.list}>{orders.map(renderOrder)}</View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  inner: { width: '100%', maxWidth: 900, alignSelf: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
    flexWrap: 'wrap',
  },
  title: { ...Typography.h2, color: Colors.text },
  subtitle: { ...Typography.bodySmall, color: Colors.textMuted, marginTop: 2 },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  refreshText: { ...Typography.bodySmall, color: Colors.primary, fontWeight: '700' },
  list: { gap: Spacing.md },
  orderCard: { padding: Spacing.lg },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  orderTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  fuelDot: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fuelType: { ...Typography.bodyLarge, fontWeight: '800', color: Colors.text },
  orderId: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: Spacing.md },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    gap: Spacing.lg,
  },
  detailLabel: { ...Typography.bodySmall, color: Colors.textMuted },
  detailValue: { ...Typography.bodySmall, color: Colors.text, fontWeight: '600' },
  detailAddress: { flex: 1, textAlign: 'right' },
  totalValue: { ...Typography.body, color: Colors.primary, fontWeight: '800' },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.md,
  },
  emptyTitle: { ...Typography.h3, color: Colors.text },
  muted: { ...Typography.bodySmall, color: Colors.textMuted, textAlign: 'center' },
});
