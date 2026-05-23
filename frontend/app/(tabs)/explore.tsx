import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { useOrderStore } from '../../store/useOrderStore';

const formatIDR = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

const FUEL_ICONS: Record<string, { color: string; icon: keyof typeof Ionicons.glyphMap }> = {
  IGNITE: { color: '#14B8A6', icon: 'flame' },
  BLAZE: { color: '#F43F5E', icon: 'flash' },
  QUANTUM: { color: '#8B5CF6', icon: 'sparkles' },
  DIESEL: { color: '#854D0E', icon: 'cog' },
};

const TIPS = [
  {
    title: 'Hemat Bahan Bakar',
    desc: 'Matikan mesin saat berhenti lama. Ini bisa menghemat hingga 10% konsumsi BBM Anda.',
    icon: 'leaf-outline' as keyof typeof Ionicons.glyphMap,
    color: '#10B981',
  },
  {
    title: 'Perawatan Rutin',
    desc: 'Rutin servis kendaraan dan cek tekanan ban untuk efisiensi bahan bakar optimal.',
    icon: 'build-outline' as keyof typeof Ionicons.glyphMap,
    color: '#3B82F6',
  },
  {
    title: 'Berkendara Halus',
    desc: 'Hindari akselerasi dan pengereman mendadak. Berkendara halus hemat BBM hingga 33%.',
    icon: 'speedometer-outline' as keyof typeof Ionicons.glyphMap,
    color: '#F59E0B',
  },
  {
    title: 'Pilih BBM yang Tepat',
    desc: 'Gunakan RON sesuai rekomendasi pabrik kendaraan Anda untuk performa terbaik.',
    icon: 'flask-outline' as keyof typeof Ionicons.glyphMap,
    color: '#8B5CF6',
  },
];

const FEATURES = [
  {
    title: 'Pesan dari Rumah',
    desc: 'Pesan BBM tanpa keluar rumah, kami antar sampai ke lokasi Anda.',
    icon: 'home-outline' as keyof typeof Ionicons.glyphMap,
  },
  {
    title: 'Lacak Realtime',
    desc: 'Pantau perjalanan driver secara langsung dengan peta interaktif.',
    icon: 'navigate-outline' as keyof typeof Ionicons.glyphMap,
  },
  {
    title: 'Pembayaran Mudah',
    desc: 'Bayar via E-Wallet, Transfer Bank, QRIS, atau Cash on Delivery.',
    icon: 'card-outline' as keyof typeof Ionicons.glyphMap,
  },
  {
    title: 'Harga Transparan',
    desc: 'Harga BBM resmi tanpa markup. Biaya layanan Rp 5.000 per order.',
    icon: 'pricetag-outline' as keyof typeof Ionicons.glyphMap,
  },
];

export default function ExploreScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { fuelProducts, fetchFuelPrices, isLoadingPrices } = useOrderStore();
  const isDesktop = width > 768;

  // Animations
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  useEffect(() => {
    fetchFuelPrices();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View
          style={[
            styles.inner,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Hero Banner */}
          <View style={styles.heroBanner}>
            <View style={styles.heroGradient}>
              <Ionicons name="water" size={48} color="rgba(255,255,255,0.3)" style={styles.heroIconBg} />
              <Text style={styles.heroTitle}>Jelajahi E-FUEL ⛽</Text>
              <Text style={styles.heroSubtitle}>
                Info harga BBM terkini, tips hemat bahan bakar, dan keunggulan layanan kami.
              </Text>
              <TouchableOpacity
                style={styles.heroCta}
                onPress={() => router.push('/(tabs)/')}
              >
                <Text style={styles.heroCtaText}>Pesan Sekarang</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Live Fuel Prices */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Harga BBM Hari Ini</Text>
              <Text style={styles.sectionSubtitle}>Update otomatis dari server</Text>
            </View>
            <View style={[styles.priceGrid, isDesktop && styles.priceGridDesktop]}>
              {isLoadingPrices ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} style={styles.priceCardSkeleton}>
                    <View style={styles.skeletonLine} />
                    <View style={[styles.skeletonLine, { width: '60%' }]} />
                    <View style={[styles.skeletonLine, { width: '40%', marginTop: 8 }]} />
                  </Card>
                ))
              ) : fuelProducts.length === 0 ? (
                <Card style={styles.emptyCard}>
                  <Ionicons name="cloud-offline-outline" size={32} color={Colors.textMuted} />
                  <Text style={styles.emptyText}>Tidak dapat memuat harga BBM</Text>
                </Card>
              ) : (
                fuelProducts.map((fuel) => {
                  const fuelInfo = FUEL_ICONS[fuel.fuelType] || { color: Colors.primary, icon: 'water' as keyof typeof Ionicons.glyphMap };
                  return (
                    <Card key={fuel.fuelType} style={styles.priceCard}>
                      <View style={[styles.priceIconBox, { backgroundColor: fuelInfo.color + '18' }]}>
                        <Ionicons name={fuelInfo.icon} size={28} color={fuelInfo.color} />
                      </View>
                      <Text style={styles.priceFuelName}>{fuel.name}</Text>
                      <Text style={styles.priceFuelRon}>{fuel.ron}</Text>
                      <View style={styles.priceValueRow}>
                        <Text style={[styles.priceValue, { color: fuelInfo.color }]}>
                          {formatIDR(fuel.pricePerLiter)}
                        </Text>
                        <Text style={styles.priceUnit}>/Liter</Text>
                      </View>
                    </Card>
                  );
                })
              )}
            </View>
          </View>

          {/* Features */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Kenapa E-FUEL?</Text>
              <Text style={styles.sectionSubtitle}>Keunggulan layanan kami</Text>
            </View>
            <View style={[styles.featureGrid, isDesktop && styles.featureGridDesktop]}>
              {FEATURES.map((item, idx) => (
                <Card key={idx} style={styles.featureCard}>
                  <View style={styles.featureIconBox}>
                    <Ionicons name={item.icon} size={24} color={Colors.primary} />
                  </View>
                  <Text style={styles.featureTitle}>{item.title}</Text>
                  <Text style={styles.featureDesc}>{item.desc}</Text>
                </Card>
              ))}
            </View>
          </View>

          {/* Tips */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tips Hemat BBM</Text>
              <Text style={styles.sectionSubtitle}>Panduan berkendara efisien</Text>
            </View>
            <View style={styles.tipsList}>
              {TIPS.map((tip, idx) => (
                <Card key={idx} style={styles.tipCard}>
                  <View style={[styles.tipIcon, { backgroundColor: tip.color + '15' }]}>
                    <Ionicons name={tip.icon} size={22} color={tip.color} />
                  </View>
                  <View style={styles.tipContent}>
                    <Text style={styles.tipTitle}>{tip.title}</Text>
                    <Text style={styles.tipDesc}>{tip.desc}</Text>
                  </View>
                </Card>
              ))}
            </View>
          </View>

          {/* CTA */}
          <Card style={styles.ctaCard}>
            <Text style={styles.ctaTitle}>Siap Pesan BBM?</Text>
            <Text style={styles.ctaDesc}>
              Pesan sekarang dan nikmati kemudahan pengiriman BBM ke lokasi Anda.
            </Text>
            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={() => router.push('/(tabs)/')}
            >
              <Text style={styles.ctaBtnText}>Mulai Pesan</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </Card>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: Spacing.xxl },
  inner: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    padding: Spacing.lg,
    gap: Spacing.xxl,
  },
  // Hero
  heroBanner: { borderRadius: BorderRadius.xl, overflow: 'hidden' },
  heroGradient: {
    backgroundColor: Colors.primary,
    padding: Spacing.xxl,
    paddingVertical: Spacing.huge,
    position: 'relative',
    overflow: 'hidden',
  },
  heroIconBg: {
    position: 'absolute',
    right: -10,
    top: -10,
    opacity: 0.15,
    transform: [{ scale: 3 }],
  },
  heroTitle: {
    ...Typography.h1,
    color: '#FFFFFF',
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    ...Typography.bodyLarge,
    color: 'rgba(255,255,255,0.8)',
    maxWidth: 500,
    marginBottom: Spacing.lg,
    lineHeight: 26,
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  heroCtaText: {
    ...Typography.body,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Section
  section: { gap: Spacing.lg },
  sectionHeader: { gap: 4 },
  sectionTitle: { ...Typography.h2, color: Colors.text },
  sectionSubtitle: { ...Typography.bodySmall, color: Colors.textMuted },
  // Price Grid
  priceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  priceGridDesktop: {},
  priceCard: {
    flex: 1,
    minWidth: 200,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.small,
  },
  priceCardSkeleton: {
    flex: 1,
    minWidth: 200,
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  skeletonLine: {
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.borderLight,
    width: '80%',
  },
  emptyCard: {
    flex: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  emptyText: { ...Typography.bodySmall, color: Colors.textMuted },
  priceIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  priceFuelName: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  priceFuelRon: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  priceValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceValue: {
    ...Typography.h3,
    fontWeight: '800',
  },
  priceUnit: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  // Features
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  featureGridDesktop: {},
  featureCard: {
    flex: 1,
    minWidth: 220,
    padding: Spacing.lg,
  },
  featureIconBox: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  featureTitle: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  featureDesc: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  // Tips
  tipsList: { gap: Spacing.md },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  tipIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipContent: { flex: 1 },
  tipTitle: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  tipDesc: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  // CTA
  ctaCard: {
    padding: Spacing.xxl,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    ...Shadows.large,
  },
  ctaTitle: {
    ...Typography.h2,
    color: '#FFFFFF',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  ctaDesc: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    maxWidth: 400,
    marginBottom: Spacing.xl,
    lineHeight: 24,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  ctaBtnText: {
    ...Typography.body,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
