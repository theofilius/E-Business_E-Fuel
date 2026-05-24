/**
 * /premium/payment — Halaman Simulasi Pembayaran Premium
 *
 * Hanya di halaman INI tombol "Saya Sudah Bayar" memanggil updatePremium().
 * Checkout (/premium/checkout) hanya pilih metode, tidak langsung aktivasi.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { useAuthStore } from '../../store/useAuthStore';
import { authService } from '../../services/authService';

type PaymentMethod = 'qris' | 'gopay' | 'dana' | 'va';
type BankKey = 'bca' | 'bni' | 'mandiri';

const formatIDR = (n: number) => 'IDR ' + n.toLocaleString('id-ID');

/** Hitung tanggal premiumUntil berdasarkan label paket */
function calcPremiumUntil(planLabel: string): string {
  const now = new Date();
  if (planLabel.includes('Minggu')) now.setDate(now.getDate() + 7);
  else if (planLabel === '1 Bulan') now.setMonth(now.getMonth() + 1);
  else if (planLabel === '3 Bulan') now.setMonth(now.getMonth() + 3);
  else if (planLabel === '6 Bulan') now.setMonth(now.getMonth() + 6);
  else if (planLabel === '1 Tahun') now.setFullYear(now.getFullYear() + 1);
  return now.toISOString();
}

const DUMMY_VA: Record<BankKey, string> = {
  bca: '8808 0012 3456 7890',
  bni: '9887 7001 2345 6789',
  mandiri: '8883 3301 2345 6781',
};

const BANKS: { key: BankKey; label: string }[] = [
  { key: 'bca', label: 'BCA' },
  { key: 'bni', label: 'BNI' },
  { key: 'mandiri', label: 'Mandiri' },
];

export default function PremiumPayment() {
  const router = useRouter();
  const { user, updatePremium } = useAuthStore();
  const {
    method = 'qris',
    planLabel = '1 Bulan',
    price = '49900',
  } = useLocalSearchParams<{ method?: string; planLabel?: string; price?: string }>();

  const payMethod = (method as PaymentMethod) || 'qris';
  const priceNum = parseInt(price, 10) || 49900;

  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 menit untuk QRIS
  const [selectedBank, setSelectedBank] = useState<BankKey>('bca');
  const [copied, setCopied] = useState(false);

  // Guard: harus login
  if (!user) {
    router.replace('/(auth)/login');
    return null;
  }

  // Countdown hanya untuk QRIS
  useEffect(() => {
    if (payMethod !== 'qris') return;
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [payMethod, timeLeft]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopy = async () => {
    const vaNumber = DUMMY_VA[selectedBank];
    // Gunakan clipboard web jika tersedia (tanpa dependency baru)
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(vaNumber);
      } catch (_) { /* abaikan */ }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Tombol "Saya Sudah Bayar" — SATU-SATUNYA tempat yang memanggil updatePremium.
   * Checkout hanya navigasi ke sini; tidak ada aktivasi di sana.
   */
  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      const premiumUntil = calcPremiumUntil(planLabel);

      // 1. Update backend
      await authService.updatePremium({
        isPremium: true,
        premiumPlan: planLabel,
        premiumUntil,
      });

      // 2. Update local store + AsyncStorage
      await updatePremium(true, planLabel, premiumUntil);

      // 3. Alert sukses dengan pilihan navigasi
      Alert.alert(
        '🎉 Pembayaran Berhasil!',
        `Selamat! Akun Anda sekarang berstatus E-Fuel Premium (${planLabel}). Nikmati benefit eksklusif mulai sekarang.`,
        [
          {
            text: 'Mulai Pesan Bensin',
            onPress: () => router.replace('/order' as any),
          },
          {
            text: 'Kembali ke Home',
            onPress: () => router.replace('/(tabs)' as any),
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Pembayaran Gagal', err?.message || 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── UI per metode pembayaran ─────────────────────────────────────────────

  const renderQRIS = () => (
    <View style={styles.qrSection}>
      {/* QR placeholder */}
      <View style={styles.qrBox}>
        <Ionicons name="qr-code-outline" size={140} color={Colors.primary} />
        <View style={styles.qrScanLine} />
      </View>

      {/* Countdown */}
      <View style={styles.countdownRow}>
        <Ionicons
          name="time-outline"
          size={16}
          color={timeLeft < 60 ? Colors.error : Colors.textMuted}
        />
        <Text style={[styles.countdownText, timeLeft < 60 && { color: Colors.error }]}>
          Selesaikan dalam{' '}
          <Text style={styles.countdownValue}>{formatTime(timeLeft)}</Text>
        </Text>
      </View>

      <Text style={styles.instruction}>
        Scan QR code di atas menggunakan aplikasi pembayaran favorit Anda (GoPay, OVO, Dana,
        QRIS, dsb).
      </Text>
    </View>
  );

  const renderVA = () => (
    <View style={styles.vaSection}>
      {/* Pilih Bank */}
      <Text style={styles.sectionLabel}>Pilih Bank</Text>
      <View style={styles.bankRow}>
        {BANKS.map((b) => (
          <TouchableOpacity
            key={b.key}
            style={[styles.bankChip, selectedBank === b.key && styles.bankChipSelected]}
            onPress={() => setSelectedBank(b.key)}
          >
            <Text
              style={[
                styles.bankChipText,
                selectedBank === b.key && styles.bankChipTextSelected,
              ]}
            >
              {b.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Nomor VA */}
      <Text style={styles.sectionLabel}>Nomor Virtual Account</Text>
      <View style={styles.vaBox}>
        <Text style={styles.vaNumber}>{DUMMY_VA[selectedBank]}</Text>
        <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
          <Ionicons
            name={copied ? 'checkmark-circle' : 'copy-outline'}
            size={20}
            color={copied ? Colors.success : Colors.primary}
          />
          <Text style={[styles.copyText, copied && { color: Colors.success }]}>
            {copied ? 'Disalin!' : 'Salin'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.instruction}>
        Transfer tepat{' '}
        <Text style={{ fontWeight: '700', color: Colors.text }}>{formatIDR(priceNum)}</Text>{' '}
        ke nomor VA di atas melalui ATM, Mobile Banking, atau Internet Banking{' '}
        {selectedBank.toUpperCase()}.
      </Text>
    </View>
  );

  const renderEwallet = () => {
    const appName = payMethod === 'gopay' ? 'GoPay' : 'DANA';
    const steps = [
      `Buka aplikasi ${appName} di smartphone Anda`,
      'Pilih menu "Bayar" atau "Transfer"',
      `Masukkan nomor merchant: 0811-EFUEL-99`,
      `Masukkan nominal: ${formatIDR(priceNum)}`,
      'Masukkan PIN dan konfirmasi pembayaran',
    ];

    return (
      <View style={styles.ewalletSection}>
        {/* Icon */}
        <View style={styles.ewalletIconBox}>
          <Ionicons name="wallet-outline" size={56} color={Colors.primary} />
          <Text style={styles.ewalletName}>{appName}</Text>
        </View>

        {/* Langkah-langkah */}
        <Text style={styles.sectionLabel}>Langkah Pembayaran</Text>
        <View style={styles.stepList}>
          {steps.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // ── Render utama ─────────────────────────────────────────────────────────

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={Colors.text} />
      </TouchableOpacity>

      <View style={styles.cardWrapper}>
        <View style={styles.card}>
          {/* Logo */}
          <View style={styles.logoRow}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoE}>E</Text>
            </View>
            <Text style={styles.premiumLabel}>PREMIUM</Text>
          </View>

          {/* Ringkasan order */}
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryTitle}>E-Fuel Premium</Text>
              <Text style={styles.summaryPlan}>{planLabel}</Text>
            </View>
            <Text style={styles.summaryPrice}>{formatIDR(priceNum)}</Text>
          </View>

          <View style={styles.divider} />

          {/* Label metode */}
          <Text style={styles.methodLabel}>
            Metode:{' '}
            <Text style={{ fontWeight: '800', color: Colors.primary }}>
              {payMethod === 'va' ? 'Virtual Account' : payMethod.toUpperCase()}
            </Text>
          </Text>

          {/* UI spesifik metode */}
          {payMethod === 'qris' && renderQRIS()}
          {payMethod === 'va' && renderVA()}
          {(payMethod === 'gopay' || payMethod === 'dana') && renderEwallet()}

          <View style={styles.divider} />

          {/* Tombol konfirmasi — SATU-SATUNYA tombol yang mengaktifkan premium */}
          <TouchableOpacity
            style={[styles.confirmBtn, isProcessing && styles.confirmBtnLoading]}
            onPress={handleConfirm}
            disabled={isProcessing}
            activeOpacity={0.85}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={styles.confirmBtnInner}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                <Text style={styles.confirmBtnText}>Saya Sudah Bayar</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.note}>🔒 Simulasi demo — tidak ada transaksi nyata</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  backBtn: {
    position: 'absolute',
    top: Spacing.lg,
    left: Spacing.lg,
    zIndex: 10,
    padding: Spacing.sm,
  },

  // Card wrapper
  cardWrapper: { alignItems: 'center', paddingTop: Spacing.xxl },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 480,
    ...Shadows.large,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },

  // Logo
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    justifyContent: 'center',
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoE: { color: '#fff', fontWeight: '900', fontSize: 16 },
  premiumLabel: {
    ...Typography.body,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 2,
  },

  // Summary
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  summaryTitle: { ...Typography.body, fontWeight: '700', color: Colors.text },
  summaryPlan: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  summaryPrice: { ...Typography.h3, fontWeight: '800', color: Colors.primary },

  divider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: Spacing.md },

  methodLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },

  // ── QRIS ──────────────────────────────────────────────────────────────────
  qrSection: { alignItems: 'center', paddingVertical: Spacing.lg },
  qrBox: {
    width: 200,
    height: 200,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  qrScanLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: Colors.accent,
    top: '50%',
    opacity: 0.6,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  countdownText: { ...Typography.bodySmall, color: Colors.textMuted },
  countdownValue: { fontWeight: '800', color: Colors.warning },
  instruction: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: Spacing.sm,
    marginTop: Spacing.sm,
  },

  // ── Virtual Account ────────────────────────────────────────────────────────
  vaSection: { paddingVertical: Spacing.md },
  sectionLabel: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  bankRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  bankChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.pill,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  bankChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.secondary,
  },
  bankChipText: { ...Typography.caption, fontWeight: '600', color: Colors.textMuted },
  bankChipTextSelected: { color: Colors.primary, fontWeight: '800' },
  vaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    marginBottom: Spacing.md,
  },
  vaNumber: { ...Typography.body, fontWeight: '700', color: Colors.text, letterSpacing: 1.5 },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: Spacing.sm },
  copyText: { ...Typography.caption, fontWeight: '700', color: Colors.primary },

  // ── E-Wallet ──────────────────────────────────────────────────────────────
  ewalletSection: { paddingVertical: Spacing.md },
  ewalletIconBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  ewalletName: { ...Typography.body, fontWeight: '800', color: Colors.primary },
  stepList: { gap: Spacing.sm },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  stepNumText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  stepText: { ...Typography.bodySmall, color: Colors.text, flex: 1 },

  // ── Confirm button ─────────────────────────────────────────────────────────
  confirmBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md + 4,
    borderRadius: BorderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: Spacing.md,
    minHeight: 52,
  },
  confirmBtnLoading: { opacity: 0.7 },
  confirmBtnInner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  confirmBtnText: {
    ...Typography.bodySmall,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  note: { ...Typography.caption, color: Colors.textMuted, textAlign: 'center' },
});
