import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { refundService } from '../../services/refundService';
import { RefundRequest, RefundStatus } from '../../types';

const formatIDR = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');
const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

type TabFilter = 'Semua' | 'Pending' | 'Disetujui' | 'Ditolak';

const TAB_STATUS: Record<TabFilter, RefundStatus | null> = {
  Semua: null,
  Pending: 'pending',
  Disetujui: 'approved',
  Ditolak: 'rejected',
};

const STATUS_STYLE: Record<string, { bg: string; border: string; text: string; label: string }> = {
  pending:  { bg: '#FEF3C7', border: '#FDE68A', text: Colors.warning,  label: 'Pending' },
  approved: { bg: '#D1FAE5', border: '#6EE7B7', text: Colors.success,  label: 'Disetujui' },
  rejected: { bg: '#FEE2E2', border: '#FCA5A5', text: Colors.error,    label: 'Ditolak' },
  processed:{ bg: '#D1FAE5', border: '#6EE7B7', text: Colors.success,  label: 'Selesai' },
};

export default function AdminRefunds() {
  const [refunds, setRefunds]       = useState<RefundRequest[]>([]);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState<TabFilter>('Semua');

  // Approve modal
  const [approveTarget, setApproveTarget] = useState<RefundRequest | null>(null);

  // Reject modal
  const [rejectTarget, setRejectTarget]   = useState<RefundRequest | null>(null);
  const [adminNote, setAdminNote]         = useState('');

  // Processing spinner
  const [processing, setProcessing] = useState(false);

  // ── fetch ──────────────────────────────────────────────────────────────────
  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const data = await refundService.getAllRefunds();
      setRefunds(data);
    } catch (err) {
      console.error('fetchRefunds error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRefunds(); }, []);

  // ── filter ─────────────────────────────────────────────────────────────────
  const filtered = activeTab === 'Semua'
    ? refunds
    : refunds.filter(r => r.status === TAB_STATUS[activeTab]);

  const countByStatus = (s: RefundStatus | 'processed') =>
    refunds.filter(r => r.status === s).length;

  const totalPending  = countByStatus('pending');
  const totalApproved = countByStatus('approved');
  const totalRejected = countByStatus('rejected');
  const totalNominal  = refunds
    .filter(r => r.status === 'approved')
    .reduce((acc, r) => acc + (r.amount || 0), 0);

  // ── approve ────────────────────────────────────────────────────────────────
  const handleApprove = async () => {
    if (!approveTarget) return;
    try {
      setProcessing(true);
      const updated = await refundService.processRefund(approveTarget._id, { status: 'approved' });
      setRefunds(prev => prev.map(r => r._id === updated._id ? updated : r));
      setApproveTarget(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Gagal approve refund');
    } finally {
      setProcessing(false);
    }
  };

  // ── reject ─────────────────────────────────────────────────────────────────
  const handleReject = async () => {
    if (!rejectTarget) return;
    try {
      setProcessing(true);
      const updated = await refundService.processRefund(rejectTarget._id, {
        status: 'rejected',
        adminNote: adminNote.trim() || undefined,
      });
      setRefunds(prev => prev.map(r => r._id === updated._id ? updated : r));
      setRejectTarget(null);
      setAdminNote('');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Gagal reject refund');
    } finally {
      setProcessing(false);
    }
  };

  // ── helpers ────────────────────────────────────────────────────────────────
  const getUserName = (r: RefundRequest) => {
    if (r.userId && typeof r.userId === 'object') return (r.userId as any).name || '-';
    return String(r.userId).slice(-6);
  };
  const getOrderId = (r: RefundRequest) => {
    if (r.orderId && typeof r.orderId === 'object') return (r.orderId as any)._id || '';
    return String(r.orderId);
  };

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Kelola Refund</Text>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { borderLeftColor: Colors.warning }]}>
          <Text style={styles.summaryNum}>{totalPending}</Text>
          <Text style={styles.summaryLabel}>Pending</Text>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: Colors.success }]}>
          <Text style={styles.summaryNum}>{totalApproved}</Text>
          <Text style={styles.summaryLabel}>Disetujui</Text>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: Colors.error }]}>
          <Text style={styles.summaryNum}>{totalRejected}</Text>
          <Text style={styles.summaryLabel}>Ditolak</Text>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: Colors.primary }]}>
          <Text style={styles.summaryNum}>{formatIDR(totalNominal)}</Text>
          <Text style={styles.summaryLabel}>Total Disetujui</Text>
        </View>
      </View>

      {/* Filter tabs */}
      <View style={styles.tabsRow}>
        {(Object.keys(TAB_STATUS) as TabFilter[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
              {tab !== 'Semua' && ` (${filtered.length})`}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchRefunds}>
          <Ionicons name="refresh" size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.muted}>Memuat refund…</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="refresh-circle-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyText}>Tidak ada refund request</Text>
        </View>
      ) : (
        <View style={styles.tableWrap}>
          {/* Table header */}
          <View style={styles.tableHeader}>
            {['Refund ID', 'Order', 'User', 'BBM & Liter', 'Alasan', 'Total', 'Status', 'Tanggal', 'Aksi'].map(h => (
              <Text key={h} style={[styles.th, h === 'Aksi' && styles.thAksi]}>{h}</Text>
            ))}
          </View>

          {/* Rows */}
          {filtered.map(r => {
            const st = STATUS_STYLE[r.status] ?? STATUS_STYLE.pending;
            const orderId = getOrderId(r);
            const isPending = r.status === 'pending';

            return (
              <View key={r._id} style={styles.tableRow}>
                <Text style={styles.td} numberOfLines={1}>
                  #{r._id.slice(-6).toUpperCase()}
                </Text>
                <Text style={styles.td} numberOfLines={1}>
                  #{orderId.slice(-6).toUpperCase()}
                </Text>
                <Text style={styles.td} numberOfLines={1}>{getUserName(r)}</Text>
                <Text style={styles.td} numberOfLines={1}>
                  {r.fuelType || '-'} · {r.liters ?? '-'}L
                </Text>
                <Text style={[styles.td, styles.tdReason]} numberOfLines={2}>
                  {r.reason}
                </Text>
                <Text style={styles.td}>{formatIDR(r.amount || 0)}</Text>

                {/* Status badge */}
                <View style={styles.tdStatus}>
                  <View style={[styles.statusPill, { backgroundColor: st.bg, borderColor: st.border }]}>
                    <Text style={[styles.statusText, { color: st.text }]}>{st.label}</Text>
                  </View>
                  {r.adminNote ? (
                    <Text style={styles.adminNote} numberOfLines={1}>
                      Catatan: {r.adminNote}
                    </Text>
                  ) : null}
                </View>

                <Text style={styles.td}>{formatDate(r.createdAt)}</Text>

                {/* Actions */}
                <View style={styles.tdActions}>
                  {isPending ? (
                    <>
                      <TouchableOpacity
                        style={styles.approveBtn}
                        onPress={() => setApproveTarget(r)}
                      >
                        <Ionicons name="checkmark" size={14} color="#fff" />
                        <Text style={styles.approveBtnText}>Setujui</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.rejectBtn}
                        onPress={() => { setRejectTarget(r); setAdminNote(''); }}
                      >
                        <Ionicons name="close" size={14} color={Colors.error} />
                        <Text style={styles.rejectBtnText}>Tolak</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <Text style={styles.processedLabel}>Sudah diproses</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* ── Approve Confirm Modal ── */}
      <Modal visible={!!approveTarget} transparent animationType="fade" onRequestClose={() => setApproveTarget(null)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconCircle}>
              <Ionicons name="checkmark-circle" size={36} color={Colors.success} />
            </View>
            <Text style={styles.modalTitle}>Setujui Refund?</Text>
            <Text style={styles.modalBody}>
              Refund untuk order #{getOrderId(approveTarget || {} as any).slice(-6).toUpperCase()} akan
              disetujui. Tindakan ini tidak dapat dibatalkan.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setApproveTarget(null)}>
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmGreenBtn} onPress={handleApprove} disabled={processing}>
                {processing
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.modalConfirmText}>Setujui</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Reject Modal ── */}
      <Modal visible={!!rejectTarget} transparent animationType="fade" onRequestClose={() => setRejectTarget(null)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={[styles.modalIconCircle, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="close-circle" size={36} color={Colors.error} />
            </View>
            <Text style={styles.modalTitle}>Tolak Refund?</Text>
            <Text style={styles.modalBody}>
              Refund untuk order #{getOrderId(rejectTarget || {} as any).slice(-6).toUpperCase()} akan
              ditolak. Tambahkan catatan untuk customer (opsional):
            </Text>
            <TextInput
              style={styles.noteInput}
              placeholder="Catatan penolakan (opsional)…"
              placeholderTextColor={Colors.textMuted}
              value={adminNote}
              onChangeText={setAdminNote}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setRejectTarget(null)}>
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmRedBtn} onPress={handleReject} disabled={processing}>
                {processing
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.modalConfirmText}>Tolak</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.xl, backgroundColor: Colors.background },
  pageTitle: { ...Typography.h2, color: Colors.text, marginBottom: Spacing.lg },

  // Summary
  summaryRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg, flexWrap: 'wrap' },
  summaryCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderLeftWidth: 4,
    ...Shadows.small,
  },
  summaryNum: { ...Typography.h3, color: Colors.text, marginBottom: 2 },
  summaryLabel: { ...Typography.caption, color: Colors.textMuted, fontWeight: '600' },

  // Tabs
  tabsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg, alignItems: 'center', flexWrap: 'wrap' },
  tab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { ...Typography.bodySmall, color: Colors.textMuted, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  refreshBtn: {
    marginLeft: 'auto',
    padding: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },

  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xxl, gap: Spacing.md },
  muted: { ...Typography.bodySmall, color: Colors.textMuted },
  emptyText: { ...Typography.h3, color: Colors.textMuted },

  // Table
  tableWrap: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadows.small,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  th: {
    flex: 1,
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  thAksi: { flex: 1.2 },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  td: { flex: 1, ...Typography.bodySmall, color: Colors.text },
  tdReason: { flex: 1.5 },
  tdStatus: { flex: 1, gap: 4 },
  tdActions: { flex: 1.2, flexDirection: 'row', gap: 6, flexWrap: 'wrap' },

  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
  },
  statusText: { ...Typography.caption, fontWeight: '700' },
  adminNote: { ...Typography.caption, color: Colors.textMuted, fontStyle: 'italic' },

  approveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.success,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
  },
  approveBtnText: { ...Typography.caption, color: '#fff', fontWeight: '700' },
  rejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  rejectBtnText: { ...Typography.caption, color: Colors.error, fontWeight: '700' },
  processedLabel: { ...Typography.caption, color: Colors.textMuted, fontStyle: 'italic' },

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
    maxWidth: 420,
    alignItems: 'center',
    ...Shadows.large,
  },
  modalIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.sm, textAlign: 'center' },
  modalBody: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  noteInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Typography.bodySmall,
    color: Colors.text,
    backgroundColor: Colors.background,
    minHeight: 80,
    marginBottom: Spacing.lg,
  },
  modalActions: { flexDirection: 'row', gap: Spacing.md, width: '100%' },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  modalCancelText: { ...Typography.bodySmall, fontWeight: '700', color: Colors.textMuted },
  modalConfirmGreenBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmRedBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmText: { ...Typography.bodySmall, fontWeight: '700', color: '#fff' },
});
