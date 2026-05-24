import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { useAuthStore } from '../../store/useAuthStore';

type PaymentMethod = 'qris' | 'gopay' | 'dana' | 'va';

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; sub?: string }[] = [
  { id: 'qris', label: 'QRIS' },
  { id: 'gopay', label: 'GoPay' },
  { id: 'dana', label: 'DANA' },
  { id: 'va', label: 'Virtual Account', sub: 'BCA · BNI · Mandiri' },
];

const formatIDR = (n: number) =>
  'IDR ' + n.toLocaleString('id-ID');

export default function PremiumCheckout() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { planLabel = '1 Bulan', price = '49900' } = useLocalSearchParams<{
    planLabel: string;
    price: string;
  }>();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('qris');

  // Guard: harus login
  if (!user) {
    router.replace('/(auth)/login');
    return null;
  }

  const priceNum = parseInt(price, 10) || 49900;

  /** Arahkan ke halaman simulasi pembayaran — premium BELUM aktif di sini */
  const handlePay = () => {
    router.push(
      `/premium/payment?method=${selectedMethod}&planLabel=${encodeURIComponent(planLabel)}&price=${price}` as any
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={Colors.text} />
      </TouchableOpacity>

      {/* Checkout Card */}
      <View style={styles.cardWrapper}>
        <View style={styles.card}>
          {/* Logo */}
          <View style={styles.logoRow}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoE}>E</Text>
            </View>
            <Text style={styles.premiumLabel}>PREMIUM</Text>
          </View>

          <Text style={styles.checkoutTitle}>Checkout</Text>

          {/* Plan & Price */}
          <View style={styles.planRow}>
            <Text style={styles.planLabel}>{planLabel}</Text>
            <View style={styles.priceCol}>
              <Text style={styles.priceText}>{formatIDR(priceNum)}</Text>
              <Text style={styles.pricePeriod}>
                {planLabel.includes('Minggu')
                  ? '/Week'
                  : planLabel.includes('Bulan')
                  ? `/${planLabel.replace(' Bulan', '')} Month${planLabel === '1 Bulan' ? '' : 's'}`
                  : '/Year'}
              </Text>
            </View>
          </View>

          {/* Payment Method */}
          <Text style={styles.paymentSectionTitle}>Metode Pembayaran</Text>

          <View style={styles.paymentList}>
            {PAYMENT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.paymentItem,
                  selectedMethod === opt.id && styles.paymentItemSelected,
                ]}
                onPress={() => setSelectedMethod(opt.id)}
                activeOpacity={0.8}
              >
                <View style={styles.paymentRadioOuter}>
                  {selectedMethod === opt.id && <View style={styles.paymentRadioInner} />}
                </View>
                <View style={styles.paymentItemContent}>
                  <Text style={styles.paymentItemLabel}>{opt.label}</Text>
                  {opt.sub && (
                    <Text style={styles.paymentItemSub}>{opt.sub}</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Pay Button */}
          <TouchableOpacity
            style={styles.payBtn}
            onPress={handlePay}
            activeOpacity={0.85}
          >
            <Text style={styles.payBtnText}>Bayar Sekarang</Text>
          </TouchableOpacity>

          <Text style={styles.note}>
            🔒 Pembayaran diproses aman. Demo — tidak ada transaksi nyata.
          </Text>
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
  },
  backBtn: {
    position: 'absolute',
    top: Spacing.lg,
    left: Spacing.lg,
    zIndex: 10,
    padding: Spacing.sm,
  },
  cardWrapper: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
  },
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
  checkoutTitle: {
    ...Typography.h2,
    color: Colors.text,
    fontWeight: '800',
    marginBottom: Spacing.lg,
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    marginBottom: Spacing.lg,
  },
  planLabel: {
    ...Typography.bodyLarge,
    fontWeight: '700',
    color: Colors.text,
  },
  priceCol: { alignItems: 'flex-end' },
  priceText: {
    ...Typography.h3,
    fontWeight: '800',
    color: Colors.text,
  },
  pricePeriod: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  paymentSectionTitle: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  paymentList: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  paymentItemSelected: { backgroundColor: '#F0FDFA' },
  paymentRadioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  paymentItemContent: { flex: 1 },
  paymentItemLabel: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.text,
  },
  paymentItemSub: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  payBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md + 4,
    borderRadius: BorderRadius.pill,
    alignItems: 'center',
    width: '100%',
    marginBottom: Spacing.md,
  },
  payBtnText: {
    ...Typography.bodySmall,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  note: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
