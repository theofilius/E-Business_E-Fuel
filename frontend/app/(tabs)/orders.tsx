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
  Modal,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useOrderStore } from '../../store/useOrderStore';
import { useRefundStore } from '../../store/useRefundStore';
import { Order, OrderStatus } from '../../types';
import api from '../../services/api';

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
  const { width } = useWindowDimensions();
  const isMobile = width <= 480;
  const { orders, fetchOrders, isLoadingOrders, cancelOrder, error } = useOrderStore();
  const { fetchMyRefunds, getRefundByOrderId } = useRefundStore();

  // ── Rating modal state ────────────────────────────────────────────────────
  const [ratingTarget, setRatingTarget] = useState<Order | null>(null);
  const [ratingStars, setRatingStars]   = useState(5);
  const [ratingText, setRatingText]     = useState('');
  const [ratingBusy, setRatingBusy]     = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchMyRefunds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openRatingModal = (order: Order) => {
    setRatingTarget(order);
    setRatingStars(5);
    setRatingText('');
  };

  const submitRating = async () => {
    if (!ratingTarget || ratingBusy) return;
    setRatingBusy(true);
    try {
      await api.post(`/orders/${ratingTarget._id}/rating`, {
        rating: ratingStars,
        comment: ratingText.trim() || undefined,
      });
      setRatingTarget(null);
      // Refresh orders so the button disappears
      fetchOrders();
    } catch (e: any) {
      const msg = e.message || 'Gagal mengirim rating';
      if (Platform.OS === 'web') {
        window.alert(msg);
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setRatingBusy(false);
    }
  };

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
    // Refund: untuk order delivered atau cancelled (demo: tanpa cek paymentStatus)
    const canRefund = item.status === 'delivered' || item.status === 'cancelled';
    const existingRefund = getRefundByOrderId(item._id);
    // Allow re-submit jika sebelumnya rejected (backend hapus record lama)
    const showRefundBtn = canRefund && (!existingRefund || existingRefund.status === 'rejected');
    // Rating: only delivered orders, only once
    const canRate = item.status === 'delivered' && !item.rating;
    const hasActions = canCancel || canTrack || canRefund || canRate;

    return (
      <Card key={item._id} style={[styles.orderCard, isMobile && styles.orderCardMobile]}>
        <View style={[styles.orderTop, isMobile && styles.orderTopMobile]}>
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

        <View style={[styles.detailRow, isMobile && styles.detailRowMobile]}>
          <Text style={styles.detailLabel}>Jumlah</Text>
          <Text style={styles.detailValue}>{item.liters} Liter</Text>
        </View>
        <View style={[styles.detailRow, isMobile && styles.detailRowMobile]}>
          <Text style={styles.detailLabel}>Alamat</Text>
          <Text style={[styles.detailValue, styles.detailAddress, isMobile && styles.detailAddressMobile]} numberOfLines={isMobile ? 3 : 2}>
            {item.location?.address || '-'}
          </Text>
        </View>
        <View style={[styles.detailRow, isMobile && styles.detailRowMobile]}>
          <Text style={styles.detailLabel}>Total Bayar</Text>
          <Text style={styles.totalValue}>{formatIDR(item.totalPrice)}</Text>
        </View>

        {hasActions && (
          <View style={[styles.actions, isMobile && styles.actionsMobile]}>
            {canCancel && (
              <Button
                title="Batalkan"
                variant="outline"
                size="small"
                onPress={() => confirmCancel(item._id)}
                style={isMobile ? styles.mobileActionBtn : undefined}
              />
            )}
            {canTrack && (
              <Button
                title="Lacak Pesanan"
                size="small"
                onPress={() => router.push(`/order/${item._id}` as any)}
                style={isMobile ? styles.mobileActionBtn : undefined}
              />
            )}
            {/* Refund status / button */}
            {canRefund && existingRefund && existingRefund.status === 'pending' && (
              <View style={styles.refundBadge}>
                <Ionicons name="time-outline" size={14} color={Colors.warning} />
                <Text style={styles.refundBadgeText}>Refund Diproses</Text>
              </View>
            )}
            {canRefund && existingRefund && existingRefund.status === 'approved' && (
              <View style={styles.refundBadgeApproved}>
                <Ionicons name="checkmark-circle-outline" size={14} color={Colors.success} />
                <Text style={[styles.refundBadgeText, { color: Colors.success }]}>
                  Refund Disetujui
                </Text>
              </View>
            )}
            {canRefund && existingRefund && existingRefund.status === 'rejected' && (
              <View style={{ gap: 6 }}>
                <View style={styles.refundBadgeRejected}>
                  <Ionicons name="close-circle-outline" size={14} color={Colors.error} />
                  <Text style={[styles.refundBadgeText, { color: Colors.error }]}>
                    Refund Ditolak
                  </Text>
                </View>
                {existingRefund.adminNote ? (
                  <Text style={styles.refundNote}>
                    Catatan: {existingRefund.adminNote}
                  </Text>
                ) : null}
              </View>
            )}
            {showRefundBtn && (
              <Button
                title={existingRefund?.status === 'rejected' ? 'Ajukan Ulang' : 'Ajukan Refund'}
                variant="outline"
                size="small"
                onPress={() => router.push(`/refund/${item._id}` as any)}
                style={isMobile ? styles.mobileActionBtn : undefined}
              />
            )}
            {/* Rating */}
            {item.status === 'delivered' && item.rating && (
              <View style={styles.ratingDone}>
                {'⭐'.repeat(item.rating)}
                <Text style={styles.ratingDoneText}>  Rating Anda</Text>
              </View>
            )}
            {canRate && (
              <Button
                title="⭐ Beri Rating Driver"
                variant="outline"
                size="small"
                onPress={() => openRatingModal(item)}
                style={isMobile ? styles.mobileActionBtn : undefined}
              />
            )}
          </View>
        )}
      </Card>
    );
  };

  // ── Star selector row ────────────────────────────────────────────────────
  const StarRow = ({ value, onChange }: { value: number; onChange: (n: number) => void }) => (
    <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center', marginVertical: 12 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity key={n} onPress={() => onChange(n)}>
          <Text style={{ fontSize: 36 }}>{n <= value ? '⭐' : '☆'}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* ── Rating modal ── */}
      <Modal
        visible={!!ratingTarget}
        transparent
        animationType="fade"
        onRequestClose={() => setRatingTarget(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Beri Rating Driver</Text>
            {ratingTarget && (
              <Text style={styles.modalSub}>
                {typeof ratingTarget.driverId === 'object'
                  ? (ratingTarget.driverId as any)?.name
                  : 'Driver'}{' '}
                · #{ratingTarget._id.slice(-6).toUpperCase()}
              </Text>
            )}
            <StarRow value={ratingStars} onChange={setRatingStars} />
            <TextInput
              style={styles.ratingInput}
              value={ratingText}
              onChangeText={setRatingText}
              placeholder="Komentar (opsional)…"
              placeholderTextColor={Colors.textMuted}
              multiline
              maxLength={200}
            />
            <View style={styles.modalActions}>
              <Button
                title="Batal"
                variant="outline"
                onPress={() => setRatingTarget(null)}
                style={{ flex: 1 }}
              />
              <Button
                title={ratingBusy ? 'Mengirim…' : 'Kirim Rating'}
                onPress={submitRating}
                disabled={ratingBusy}
                isLoading={ratingBusy}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={[styles.scrollContent, isMobile && styles.scrollContentMobile]}>
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
  scrollContentMobile: { padding: Spacing.md, paddingBottom: Spacing.xxl },
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
  orderCardMobile: { padding: Spacing.md },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  orderTopMobile: { flexDirection: 'column' },
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
  detailRowMobile: { gap: Spacing.xs, flexWrap: 'wrap' },
  detailLabel: { ...Typography.bodySmall, color: Colors.textMuted },
  detailValue: { ...Typography.bodySmall, color: Colors.text, fontWeight: '600' },
  detailAddress: { flex: 1, textAlign: 'right' },
  detailAddressMobile: { flexBasis: '100%', textAlign: 'left' },
  totalValue: { ...Typography.body, color: Colors.primary, fontWeight: '800' },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  actionsMobile: {
    justifyContent: 'flex-start',
  },
  mobileActionBtn: {
    flexGrow: 1,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.md,
  },
  emptyTitle: { ...Typography.h3, color: Colors.text },
  muted: { ...Typography.bodySmall, color: Colors.textMuted, textAlign: 'center' },
  refundBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  refundBadgeApproved: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
  refundBadgeRejected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  refundBadgeText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.warning,
  },
  refundNote: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontStyle: 'italic',
    paddingHorizontal: 4,
  },
  // ── Rating ──
  ratingDone: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
    backgroundColor: '#FEF9C3',
    borderWidth: 1,
    borderColor: '#FDE047',
  },
  ratingDoneText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.warning,
  },
  // ── Rating modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalBox: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 420,
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  modalSub: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  ratingInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    ...Typography.body,
    color: Colors.text,
    backgroundColor: Colors.background,
    minHeight: 72,
    textAlignVertical: 'top',
    marginBottom: Spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});
