import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useOrderStore } from '../../store/useOrderStore';
import { useRefundStore } from '../../store/useRefundStore';
import { RefundReason } from '../../types';

const REASONS: RefundReason[] = [
  'Bensin Tidak Datang Lebih dari 15 Menit',
  'Volume Tidak Sesuai',
  'Jenis BBM Tidak Sesuai',
  'Lainnya',
];

const REASON_INFO: Record<RefundReason, string | null> = {
  'Bensin Tidak Datang Lebih dari 15 Menit':
    'Refund otomatis akan diproses jika driver tidak tiba dalam 15 menit sejak order diterima.',
  'Volume Tidak Sesuai':
    'Tim kami akan memverifikasi volume pengiriman dengan data driver sebelum refund diproses.',
  'Jenis BBM Tidak Sesuai':
    'Jika terbukti BBM yang dikirim tidak sesuai pesanan, refund penuh akan diberikan.',
  Lainnya: null,
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

export default function AjukanRefundScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const { orders, fetchOrders } = useOrderStore();
  const { submitRefund, getRefundByOrderId, fetchMyRefunds, isSubmitting } = useRefundStore();

  const [reason, setReason] = useState<RefundReason | ''>('');
  const [description, setDescription] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState('');

  const order = orders.find((o) => o._id === orderId);
  const existingRefund = orderId ? getRefundByOrderId(orderId) : undefined;

  useEffect(() => {
    if (orders.length === 0) fetchOrders();
    fetchMyRefunds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const driverName =
    order?.driverId && typeof order.driverId === 'object'
      ? (order.driverId as any).name
      : 'Belum ditugaskan';

  const handleSubmit = () => {
    if (!reason) return;
    setError('');
    setShowModal(true);
  };

  const handleConfirm = async () => {
    if (!orderId || !reason) return;
    try {
      await submitRefund({ orderId, reason, description });
      setShowModal(false);
      router.replace((`/refund/success?orderId=${orderId}`) as any);
    } catch (err: any) {
      setShowModal(false);
      setError(
        err?.response?.data?.message || err.message || 'Gagal mengajukan refund'
      );
    }
  };

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.muted}>Memuat data order…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajukan Refund</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.inner}>
          {/* ── Already submitted banner ── */}
          {existingRefund && (
            <View style={styles.alreadyBanner}>
              <Ionicons name="information-circle" size={18} color={Colors.info} />
              <Text style={styles.alreadyText}>
                Refund untuk order ini sudah diajukan (status:{' '}
                <Text style={{ fontWeight: '700' }}>{existingRefund.status}</Text>).
              </Text>
            </View>
          )}

          {/* ── Error banner ── */}
          {!!error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={Colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* ── Title card ── */}
          <Card style={styles.card}>
            <Text style={styles.title}>Ajukan Refund</Text>
            <Text style={styles.subtitle}>
              Order #{order._id.slice(-6).toUpperCase()} •{' '}
              {order.fuelType} • {order.liters} Liter
            </Text>

            {/* ── Order summary box ── */}
            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
                <Text style={styles.summaryLabel}>Tanggal</Text>
                <Text style={styles.summaryValue}>{formatDate(order.createdAt)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Ionicons name="cash-outline" size={16} color={Colors.primary} />
                <Text style={styles.summaryLabel}>Total Bayar</Text>
                <Text style={[styles.summaryValue, { fontWeight: '800', color: Colors.primary }]}>
                  {formatIDR(order.totalPrice)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Ionicons name="person-outline" size={16} color={Colors.primary} />
                <Text style={styles.summaryLabel}>Driver</Text>
                <Text style={styles.summaryValue}>{driverName}</Text>
              </View>
            </View>

            {/* ── Reason dropdown ── */}
            <Text style={styles.fieldLabel}>Alasan Refund</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowDropdown((v) => !v)}
              activeOpacity={0.8}
            >
              <Text style={reason ? styles.dropdownSelected : styles.dropdownPlaceholder}>
                {reason || 'Pilih alasan refund…'}
              </Text>
              <Ionicons
                name={showDropdown ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={Colors.textMuted}
              />
            </TouchableOpacity>

            {showDropdown && (
              <View style={styles.dropdownMenu}>
                {REASONS.map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.dropdownItem, reason === r && styles.dropdownItemActive]}
                    onPress={() => {
                      setReason(r);
                      setShowDropdown(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        reason === r && styles.dropdownItemTextActive,
                      ]}
                    >
                      {r}
                    </Text>
                    {reason === r && (
                      <Ionicons name="checkmark" size={16} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* ── Info box for selected reason ── */}
            {reason && REASON_INFO[reason] && (
              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={16} color={Colors.info} />
                <Text style={styles.infoText}>{REASON_INFO[reason]}</Text>
              </View>
            )}

            {/* ── Description textarea ── */}
            <Text style={styles.fieldLabel}>Jelaskan Masalahmu</Text>
            <TextInput
              style={styles.textarea}
              placeholder="Ceritakan masalah yang kamu alami secara detail…"
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{description.length}/500</Text>

            {/* ── Submit button ── */}
            <Button
              title="Kirim Pengajuan Refund"
              onPress={handleSubmit}
              disabled={!reason || isSubmitting || !!existingRefund}
              style={styles.submitBtn}
            />
          </Card>
        </View>
      </ScrollView>

      {/* ── Confirmation Modal ── */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconRow}>
              <View style={styles.modalIconCircle}>
                <Ionicons name="help-circle" size={32} color={Colors.primary} />
              </View>
            </View>
            <Text style={styles.modalTitle}>Kirim Pengajuan?</Text>
            <Text style={styles.modalBody}>
              Laporan refund Anda akan diterima oleh tim CS E-Fuel dan diproses dalam 1–3 hari
              kerja. Pastikan data yang kamu masukkan sudah benar.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmText}>Kirim</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  muted: { ...Typography.bodySmall, color: Colors.textMuted },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backBtn: { padding: 4 },
  headerTitle: { ...Typography.h3, color: Colors.text, fontSize: 18 },

  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  inner: { width: '100%', maxWidth: 680, alignSelf: 'center' },

  alreadyBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: '#EFF6FF',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  alreadyText: { ...Typography.bodySmall, color: Colors.info, flex: 1 },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: '#FEF2F2',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: { ...Typography.bodySmall, color: Colors.error, flex: 1 },

  card: { padding: Spacing.lg },
  title: { ...Typography.h2, color: Colors.text, fontSize: 22, marginBottom: 4 },
  subtitle: { ...Typography.bodySmall, color: Colors.textMuted, marginBottom: Spacing.lg },

  summaryBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  summaryLabel: { ...Typography.bodySmall, color: Colors.textMuted, flex: 1 },
  summaryValue: { ...Typography.bodySmall, color: Colors.text, fontWeight: '600' },

  fieldLabel: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },

  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
  },
  dropdownPlaceholder: { ...Typography.bodySmall, color: Colors.textMuted },
  dropdownSelected: { ...Typography.bodySmall, color: Colors.text, fontWeight: '600', flex: 1 },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    marginTop: 4,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
    ...Shadows.small,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  dropdownItemActive: { backgroundColor: Colors.secondary },
  dropdownItemText: { ...Typography.bodySmall, color: Colors.text, flex: 1 },
  dropdownItemTextActive: { color: Colors.primary, fontWeight: '700' },

  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: '#EFF6FF',
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoText: { ...Typography.caption, color: Colors.info, flex: 1, lineHeight: 18 },

  textarea: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    minHeight: 110,
    ...Typography.bodySmall,
    color: Colors.text,
    backgroundColor: Colors.surface,
  },
  charCount: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },

  submitBtn: { marginTop: Spacing.lg },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    ...Shadows.large,
  },
  modalIconRow: { marginBottom: Spacing.md },
  modalIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  modalBody: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  modalCancelText: { ...Typography.bodySmall, fontWeight: '700', color: Colors.textMuted },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmText: { ...Typography.bodySmall, fontWeight: '700', color: '#fff' },
});
