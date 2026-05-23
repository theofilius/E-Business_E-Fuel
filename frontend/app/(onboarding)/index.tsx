import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Platform, useWindowDimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../components/ui/Button';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/ui/Card';

const HERO_IMAGE = require('../../assets/images/hero_image.png');

export default function OnboardingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width > 1024;

  const products = [
    { name: 'RON 92 IGNITE', ron: '92', color: '#14B8A6', price: 12500 },
    { name: 'RON 95 BLAZE', ron: '95', color: '#F43F5E', price: 13500 },
    { name: 'RON 98 QUANTUM', ron: '98', color: '#8B5CF6', price: 15000 },
    { name: 'CN 51 DIESEL', ron: '51', color: '#854D0E', price: 14000 },
  ];

  const testimonials = [
    { 
      name: 'Leon Juni', 
      role: 'Driver Gojek', 
      text: '"Sebelum ada EFuel saya sering harus keluar jalur cuma buat cari SPBU, kadang antre juga. Sekarang tinggal pesan dari HP, bensin bisa langsung dikirim ke lokasi saya lagi nunggu order."' 
    },
    { 
      name: 'Daptek Arden', 
      role: 'Kurir Ekspedisi', 
      text: '"Sebelumnya kalau bensin hampir habis di tengah pengantaran paket, saya harus muter cari SPBU dulu. Dengan EFuel jadi lebih praktis, bisa pesan bensin langsung ke lokasi tanpa buang waktu."' 
    },
    { 
      name: 'Sonny Ferdinand', 
      role: 'Mahasiswa', 
      text: '"Dulu kalau bensin motor habis pas malem, jauh. Sekarang tinggal pesan, bensin langsung dikirim ke kosan."' 
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Hero Section */}
      <View style={[styles.hero, isDesktop && styles.heroDesktop]}>
        <Image source={HERO_IMAGE} style={styles.heroImage} />
        <LinearGradient
          colors={['rgba(15, 23, 42, 0.4)', 'rgba(15, 23, 42, 0.7)']}
          style={styles.heroOverlay}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroMain}>
              <Text style={styles.heroTitle}>E-FUEL{'\n'}OUT OF FUEL? WE'VE GOT{'\n'}YOU COVERED.</Text>
              <View style={styles.heroActions}>
                <Button 
                  title="Pesan Sekarang" 
                  onPress={() => router.push('/(auth)/register')} 
                  style={styles.heroBtn}
                />
                <TouchableOpacity style={styles.outlineBtn}>
                   <Text style={styles.outlineBtnText}>Lihat Cara Kerja</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.heroFooter}>
               <Text style={styles.heroSubText}>REFUEL ANYWHERE. ANYTIME.</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Guide Section */}
      <View style={styles.guideSection}>
        <Text style={styles.sectionTitle}>Beli Bensin dalam 3 Langkah Mudah</Text>
        <Text style={styles.sectionSubtitle}>Beli bensin online dan kami kirim langsung ke lokasimu dengan proses yang cepat dan praktis.</Text>
        <View style={[styles.stepsContainer, isDesktop && styles.stepsDesktop]}>
          <View style={styles.stepCard}>
             <Ionicons name="cube" size={48} color="#F97316" />
             <Text style={styles.stepTitle}>Pilih Lokasi Pengiriman</Text>
          </View>
          <View style={styles.stepCard}>
             <Ionicons name="hand-right" size={48} color="#3B82F6" />
             <Text style={styles.stepTitle}>Pilih Jenis Bensin & Jumlah Liter</Text>
          </View>
          <View style={styles.stepCard}>
             <Ionicons name="car-sport" size={48} color="#F59E0B" />
             <Text style={styles.stepTitle}>Bayar & Bensin Dikirim</Text>
          </View>
        </View>
      </View>

      {/* Products Section */}
      <View style={styles.productsSection}>
         <Text style={styles.sectionTitle}>Pesan Bensin Sekarang</Text>
         <Text style={styles.sectionSubtitle}>Pilih jenis RON yang kamu butuhkan dan tentukan jumlah liter untuk pengiriman ke lokasimu.</Text>
         
         <View style={styles.recomHeader}>
            <Text style={styles.recomText}>Rekomendasi Untukmu</Text>
         </View>

         <View style={[styles.productsGrid, isDesktop && styles.productsDesktop]}>
            {products.map(p => (
               <View key={p.name} style={styles.productCard}>
                  <View style={[styles.productImagePlaceholder, { backgroundColor: p.color }]}>
                     <Text style={styles.productBigRon}>{p.ron}</Text>
                     <Text style={styles.productBrandText}>E-FUEL{'\n'}{p.name.split(' ').pop()}</Text>
                  </View>
                  <View style={styles.productInfo}>
                     <Text style={styles.productName}>{p.name}</Text>
                     <Text style={styles.productPriceLabel}>Rp {p.price.toLocaleString('id-ID')} /Liter</Text>
                     <TouchableOpacity style={styles.productActionBtn}>
                        <Text style={styles.productActionBtnText}>Pesan Sekarang</Text>
                     </TouchableOpacity>
                  </View>
               </View>
            ))}
         </View>
      </View>

      {/* Testimonials */}
      <View style={styles.testimonialSection}>
         <Text style={styles.sectionTitle}>Kata Mereka</Text>
         <View style={[styles.testimonialGrid, isDesktop && styles.testimonialDesktop]}>
            {testimonials.map(t => (
               <Card key={t.name} style={styles.testimonialCard}>
                  <Text style={styles.testimonialText}>{t.text}</Text>
                  <View style={styles.testiUser}>
                     <View style={styles.avatarPlaceholder}>
                        <Ionicons name="person" size={24} color={Colors.textMuted} />
                     </View>
                     <View>
                        <Text style={styles.testiName}>{t.name}</Text>
                        <Text style={styles.testiRole}>{t.role}</Text>
                     </View>
                  </View>
               </Card>
            ))}
         </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
         <View style={styles.footerTop}>
            <Text style={styles.footerBrand}>E-FUEL</Text>
            <View style={styles.footerLinks}>
               <Text style={styles.footerLink}>Tentang Kami</Text>
               <Text style={styles.footerLink}>Layanan</Text>
               <Text style={styles.footerLink}>FAQs</Text>
               <Text style={styles.footerLink}>Kontak</Text>
            </View>
         </View>
         <View style={styles.footerBottom}>
            <Text style={styles.copyText}>© 2026 E-FUEL Delivery. Refuel Anywhere. Anytime.</Text>
         </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  hero: {
    height: 500,
    width: '90%',
    alignSelf: 'center',
    marginTop: 40,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  heroDesktop: {
    height: 500,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    paddingHorizontal: Spacing.huge,
  },
  heroContent: {
    flex: 1,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroMain: {
    alignItems: 'center',
  },
  heroTitle: {
    ...Typography.h1,
    color: '#FFFFFF',
    fontSize: Platform.OS === 'web' ? 56 : 32,
    lineHeight: Platform.OS === 'web' ? 64 : 40,
    marginBottom: Spacing.xl,
    textAlign: 'center',
    fontWeight: '900',
  },
  heroActions: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  heroBtn: {
    minWidth: 180,
    height: 50,
    backgroundColor: '#CFFAFE',
    borderRadius: BorderRadius.xl,
  },
  outlineBtn: {
    minWidth: 180,
    height: 50,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlineBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  heroFooter: {
    position: 'absolute',
    bottom: 40,
    left: 0,
  },
  heroSubText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 2,
    fontWeight: '700',
  },
  guideSection: {
    paddingVertical: 80,
    paddingHorizontal: Spacing.huge,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000000',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  sectionSubtitle: {
    ...Typography.body,
    color: Colors.textMuted,
    marginBottom: 40,
    textAlign: 'center',
    maxWidth: 600,
  },
  stepsContainer: {
    width: '100%',
    maxWidth: 1000,
    gap: 40,
  },
  stepsDesktop: {
    flexDirection: 'row',
  },
  stepCard: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.md,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
  },
  productsSection: {
     paddingVertical: 80,
     paddingHorizontal: Spacing.huge,
     backgroundColor: '#F8FAFC',
     alignItems: 'center',
  },
  recomHeader: {
    alignSelf: 'flex-start',
    maxWidth: 1200,
    width: '100%',
    marginBottom: Spacing.lg,
  },
  recomText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000000',
  },
  productsGrid: {
     width: '100%',
     maxWidth: 1200,
     gap: Spacing.lg,
  },
  productsDesktop: {
     flexDirection: 'row',
  },
  productCard: {
     flex: 1,
     backgroundColor: '#FFFFFF',
     borderRadius: BorderRadius.lg,
     overflow: 'hidden',
     ...Shadows.small,
  },
  productImagePlaceholder: {
     height: 180,
     justifyContent: 'center',
     alignItems: 'center',
     position: 'relative',
  },
  productBigRon: {
    fontSize: 80,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.2)',
    position: 'absolute',
  },
  productBrandText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22,
  },
  productInfo: {
     padding: Spacing.lg,
  },
  productName: {
     fontSize: 14,
     fontWeight: '800',
     color: '#000000',
     marginBottom: 4,
  },
  productPriceLabel: {
     fontSize: 12,
     color: Colors.textMuted,
     marginBottom: Spacing.lg,
  },
  productActionBtn: {
    borderWidth: 1,
    borderColor: '#F1F5F9',
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  productActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  testimonialSection: {
    paddingVertical: 80,
    paddingHorizontal: Spacing.huge,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  testimonialGrid: {
     width: '100%',
     maxWidth: 1200,
     gap: Spacing.xl,
     marginTop: 40,
  },
  testimonialDesktop: {
     flexDirection: 'row',
  },
  testimonialCard: {
     flex: 1,
     padding: Spacing.xl,
     justifyContent: 'space-between',
     minHeight: 250,
     backgroundColor: '#FFFFFF',
     borderWidth: 1,
     borderColor: '#F1F5F9',
  },
  testimonialText: {
     ...Typography.body,
     color: '#000000',
     lineHeight: 24,
     fontStyle: 'italic',
  },
  testiUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  testiName: {
     fontSize: 14,
     fontWeight: '800',
     color: '#000000',
  },
  testiRole: {
     fontSize: 12,
     color: Colors.textMuted,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: Spacing.huge,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  footerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  footerBrand: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1,
  },
  footerLinks: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  footerLink: {
    color: Colors.text,
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  footerBottom: {
    alignItems: 'center',
  },
  copyText: {
    color: Colors.textMuted,
    fontSize: 12,
  }
});
