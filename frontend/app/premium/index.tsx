import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { useAuthStore } from '../../store/useAuthStore';

// ===== Data Paket =====
const PLANS = [
  { id: '1_minggu', label: '1 Minggu', price: 14900, badge: null },
  { id: '1_bulan', label: '1 Bulan', price: 49900, badge: null },
  { id: '3_bulan', label: '3 Bulan', price: 129900, badge: 'Recommend' },
  { id: '6_bulan', label: '6 Bulan', price: 249900, badge: null },
  { id: '1_tahun', label: '1 Tahun', price: 449900, badge: 'NEW' },
] as const;

type PlanId = (typeof PLANS)[number]['id'];

const BENEFITS = [
  'Gratis Ongkir pembelian 10L+',
  'Hemat hingga Rp300/L setiap pembelian',
  'Prioritas pengiriman & driver lebih cepat',
  'Estimasi waktu pengiriman lebih akurat',
  'Promo & cashback eksklusif member',
];

const PAYMENT_LOGOS = ['QRIS', 'GoPay', 'BCA', 'DANA', '+5 More'];

const formatIDR = (n: number) =>
  'Rp. ' + n.toLocaleString('id-ID');

export default function PremiumPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { width } = useWindowDimensions();
  const plansRef = useRef<ScrollView>(null);

  const handleSelectPlan = (plan: (typeof PLANS)[number]) => {
    if (!user) {
      router.push('/(auth)/login');
      return;
    }
    router.push(`/premium/checkout?planId=${plan.id}&planLabel=${encodeURIComponent(plan.label)}&price=${plan.price}` as any);
  };

  const scrollToPlans = () => {
    plansRef.current?.scrollTo({ y: 0, animated: true });
  };

  const isDesktop = width > 900;

  return (
    <ScrollView
      ref={plansRef}
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {/* ===== Hero Section ===== */}
      <LinearGradient
        colors={['#334E52', '#4B7379']}
        style={styles.hero}
      >
        {/* Logo + label */}
        <View style={styles.heroBadge}>
          <View style={styles.heroLogoCircle}>
            <Text style={styles.heroLogoE}>E</Text>
          </View>
          <Text style={styles.heroPremiumLabel}>PREMIUM</Text>
        </View>

        <Text style={styles.heroTitle}>
          Bensin datang lebih cepat.{'\n'}Pengeluaran jadi lebih hemat.
        </Text>
        <Text style={styles.heroSubtitle}>
          Upgrade ke E-Fuel Premium dan nikmati gratis ongkir, diskon bensin, serta prioritas
          pengiriman mulai dari Rp14.900.
        </Text>

        <View style={[styles.heroActions, isDesktop && styles.heroActionsDesktop]}>
          <TouchableOpacity
            style={styles.heroBtnPrimary}
            onPress={() => handleSelectPlan(PLANS[1])}
          >
            <Text style={styles.heroBtnPrimaryText}>Coba 1 Bulan Sekarang</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.heroBtnOutline}
            onPress={scrollToPlans}
          >
            <Text style={styles.heroBtnOutlineText}>Lihat Semua Paket</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* ===== Divider ===== */}
      <View style={styles.divider} />

      {/* ===== Paket Section ===== */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pilih paket Premium favoritmu.</Text>
        <Text style={styles.sectionSubtitle}>
          Mulai dari bulanan hingga tahunan, pilih paket yang paling sesuai dengan
          kebutuhan perjalananmu.
        </Text>

        {/* Payment logos */}
        <View style={styles.paymentLogosRow}>
          {PAYMENT_LOGOS.map((logo) => (
            <View key={logo} style={styles.paymentLogoChip}>
              <Text style={styles.paymentLogoText}>{logo}</Text>
            </View>
          ))}
        </View>

        {/* Plan cards grid */}
        <View style={[styles.plansGrid, isDesktop && styles.plansGridDesktop]}>
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onSelect={() => handleSelectPlan(plan)}
            />
          ))}
        </View>
      </View>

      {/* ===== Divider ===== */}
      <View style={styles.divider} />

      {/* ===== Benefit Table ===== */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Keuntungan lebih banyak dengan E-Fuel Premium.
        </Text>
        <Text style={styles.sectionSubtitle}>
          Dapatkan benefit eksklusif yang bikin pengiriman bensin jadi lebih cepat, hemat, dan
          praktis.
        </Text>

        <View style={[styles.benefitTable, isDesktop && styles.benefitTableDesktop]}>
          {/* Header */}
          <View style={styles.benefitHeaderRow}>
            <Text style={[styles.benefitCell, styles.benefitHeaderLabel]}>Benefit</Text>
            <Text style={[styles.benefitCellCenter, styles.benefitHeaderLabel]}>
              E-Fuel Basic
            </Text>
            <View style={[styles.benefitCellCenter, styles.premiumHeaderCell]}>
              <View style={styles.premiumHeaderBadge}>
                <View style={styles.premiumHeaderLogoCircle}>
                  <Text style={styles.premiumHeaderLogoE}>E</Text>
                </View>
                <Text style={styles.premiumHeaderText}>PREMIUM</Text>
              </View>
            </View>
          </View>

          {/* Rows */}
          {BENEFITS.map((benefit, index) => (
            <View
              key={benefit}
              style={[
                styles.benefitRow,
                index % 2 === 0 && styles.benefitRowEven,
              ]}
            >
              <Text style={[styles.benefitCell, styles.benefitRowLabel]}>{benefit}</Text>
              <View style={styles.benefitCellCenter}>
                <Text style={styles.benefitMinus}>—</Text>
              </View>
              <View style={[styles.benefitCellCenter, styles.premiumBenefitCell]}>
                <Ionicons name="checkmark" size={18} color={Colors.primary} />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* bottom spacer */}
      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

// ===== PlanCard sub-component =====
function PlanCard({
  plan,
  onSelect,
}: {
  plan: (typeof PLANS)[number];
  onSelect: () => void;
}) {
  const isFirst = plan.id === '1_minggu';

  return (
    <View style={[styles.planCard, isFirst && styles.planCardFirst]}>
      {plan.badge && (
        <View
          style={[
            styles.planBadge,
            plan.badge === 'NEW' ? styles.planBadgeNew : styles.planBadgeRecommend,
          ]}
        >
          <Text style={styles.planBadgeText}>{plan.badge}</Text>
        </View>
      )}

      {/* Logo line */}
      <View style={styles.planLogoRow}>
        <View style={[styles.planLogoCircle, isFirst && styles.planLogoCircleFirst]}>
          <Text style={[styles.planLogoE, isFirst && styles.planLogoEFirst]}>E</Text>
        </View>
        <Text style={[styles.planLogoLabel, isFirst && styles.planLogoLabelFirst]}>
          PREMIUM
        </Text>
      </View>

      <Text style={[styles.planDuration, isFirst && styles.planDurationFirst]}>
        {plan.label}
      </Text>
      <Text style={[styles.planPrice, isFirst && styles.planPriceFirst]}>
        {formatIDR(plan.price)}
      </Text>

      <TouchableOpacity
        style={[styles.planBtn, isFirst && styles.planBtnFirst]}
        onPress={onSelect}
        activeOpacity={0.85}
      >
        <Text style={[styles.planBtnText, isFirst && styles.planBtnTextFirst]}>
          Beli Sekarang
        </Text>
      </TouchableOpacity>

      <Text style={[styles.planTerms, isFirst && styles.planTermsFirst]}>Terms Apply</Text>
    </View>
  );
}

// ===== Styles =====
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { flexGrow: 1 },

  // Hero
  hero: {
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxl + Spacing.lg,
    alignItems: 'center',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  heroLogoCircle: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroLogoE: { color: '#fff', fontWeight: '900', fontSize: 14 },
  heroPremiumLabel: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 2,
  },
  heroTitle: {
    ...Typography.h2,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '800',
    marginBottom: Spacing.md,
  },
  heroSubtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    maxWidth: 540,
    marginBottom: Spacing.xl,
    lineHeight: 24,
  },
  heroActions: {
    flexDirection: 'column',
    gap: Spacing.md,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
  },
  heroActionsDesktop: { flexDirection: 'row', maxWidth: 480 },
  heroBtnPrimary: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 2,
    borderColor: '#fff',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.pill,
    minWidth: 200,
    alignItems: 'center',
  },
  heroBtnPrimaryText: {
    ...Typography.bodySmall,
    color: '#fff',
    fontWeight: '700',
  },
  heroBtnOutline: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.pill,
    minWidth: 200,
    alignItems: 'center',
  },
  heroBtnOutlineText: {
    ...Typography.bodySmall,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '700',
  },

  // Divider
  divider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: 2 },

  // Sections
  section: {
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  sectionTitle: {
    ...Typography.h2,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    maxWidth: 520,
    marginBottom: Spacing.lg,
    lineHeight: 24,
  },

  // Payment logos row
  paymentLogosRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  paymentLogoChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  paymentLogoText: {
    ...Typography.caption,
    fontWeight: '700',
    color: Colors.textMuted,
  },

  // Plans grid
  plansGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg,
    justifyContent: 'center',
    width: '100%',
    maxWidth: 900,
  },
  plansGridDesktop: { gap: Spacing.xl },

  // Plan card
  planCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    width: Platform.OS === 'web' ? 220 : 300,
    alignItems: 'flex-start',
    position: 'relative',
    ...Shadows.medium,
  },
  planCardFirst: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  planBadge: {
    position: 'absolute',
    top: -1,
    right: -1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderTopRightRadius: BorderRadius.lg,
    borderBottomLeftRadius: BorderRadius.md,
  },
  planBadgeRecommend: { backgroundColor: '#EF4444' },
  planBadgeNew: { backgroundColor: '#EF4444' },
  planBadgeText: {
    ...Typography.caption,
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  planLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.md,
  },
  planLogoCircle: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planLogoCircleFirst: { backgroundColor: 'rgba(255,255,255,0.3)' },
  planLogoE: { color: '#fff', fontWeight: '900', fontSize: 10 },
  planLogoEFirst: { color: '#fff' },
  planLogoLabel: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '900',
    letterSpacing: 1,
  },
  planLogoLabelFirst: { color: 'rgba(255,255,255,0.85)' },
  planDuration: {
    ...Typography.bodySmall,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  planDurationFirst: { color: 'rgba(255,255,255,0.85)' },
  planPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  planPriceFirst: { color: '#fff' },
  planBtn: {
    width: '100%',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.pill,
    alignItems: 'center',
    backgroundColor: '#B2D8DB',
    marginBottom: Spacing.sm,
  },
  planBtnFirst: { backgroundColor: 'rgba(255,255,255,0.25)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
  planBtnText: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.primary,
  },
  planBtnTextFirst: { color: '#fff' },
  planTerms: {
    ...Typography.caption,
    color: Colors.textMuted,
    alignSelf: 'center',
  },
  planTermsFirst: { color: 'rgba(255,255,255,0.6)' },

  // Benefit table
  benefitTable: {
    width: '100%',
    maxWidth: 700,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  benefitTableDesktop: { maxWidth: 760 },
  benefitHeaderRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  benefitRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  benefitRowEven: { backgroundColor: Colors.background },
  benefitCell: { flex: 2, justifyContent: 'center' },
  benefitCellCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitHeaderLabel: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.text,
  },
  benefitRowLabel: {
    ...Typography.bodySmall,
    color: Colors.text,
    lineHeight: 20,
  },
  benefitMinus: {
    ...Typography.body,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  premiumHeaderCell: {
    backgroundColor: '#E8F4F5',
  },
  premiumHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  premiumHeaderLogoCircle: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumHeaderLogoE: { color: '#fff', fontWeight: '900', fontSize: 10 },
  premiumHeaderText: {
    ...Typography.caption,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: 1,
  },
  premiumBenefitCell: { backgroundColor: '#EDF7F8' },
});
