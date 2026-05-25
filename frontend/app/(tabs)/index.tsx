import React, { useRef } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Platform, useWindowDimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../components/ui/Button';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/ui/Card';

const HERO_IMAGE = require('../../assets/images/hero_image.png');

export default function CustomerLandingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width > 1024;
  const isTablet = width <= 768;
  const isMobile = width <= 480;
  const stepIconSize = isMobile ? 32 : 48;
  const guideScrollY = isMobile ? 320 : isTablet ? 430 : 550;
  const scrollViewRef = useRef<ScrollView>(null);

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
    <ScrollView ref={scrollViewRef} style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Hero Section */}
      <View style={[styles.hero, isDesktop && styles.heroDesktop, isTablet && styles.heroTablet, isMobile && styles.heroMobile]}>
        <Image source={HERO_IMAGE} style={styles.heroImage} />
        <LinearGradient
          colors={['rgba(15, 23, 42, 0.4)', 'rgba(15, 23, 42, 0.7)']}
          style={[styles.heroOverlay, isTablet && styles.heroOverlayMobile, isMobile && styles.heroOverlayPhone]}
        >
          <View style={styles.heroContent}>
            <View style={[styles.heroMain, isMobile && styles.heroMainMobile]}>
              <Text style={[styles.heroTitle, isTablet && styles.heroTitleTablet, isMobile && styles.heroTitleMobile]}>
                E-FUEL{'\n'}OUT OF FUEL? WE&apos;VE GOT{'\n'}YOU COVERED.
              </Text>
              <View style={[styles.heroActions, isMobile && styles.heroActionsMobile]}>
                <Button 
                  title="Pesan Sekarang" 
                  onPress={() => router.push('/order')} 
                  style={isMobile ? StyleSheet.flatten([styles.heroBtn, styles.heroBtnMobile]) : styles.heroBtn}
                />
                <TouchableOpacity 
                  style={[styles.outlineBtn, isMobile && styles.heroBtnMobile]}
                  onPress={() => scrollViewRef.current?.scrollTo({ y: guideScrollY, animated: true })}
                >
                   <Text style={styles.outlineBtnText}>Lihat Cara Kerja</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={[styles.heroFooter, isMobile && styles.heroFooterMobile]}>
               <Text style={[styles.heroSubText, isMobile && styles.heroSubTextMobile]}>REFUEL ANYWHERE. ANYTIME.</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Guide Section */}
      <View style={[styles.guideSection, isTablet && styles.sectionMobile]}>
        <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>Beli Bensin dalam 3 Langkah Mudah</Text>
        <Text style={[styles.sectionSubtitle, isMobile && styles.sectionSubtitleMobile]}>Beli bensin online dan kami kirim langsung ke lokasimu dengan proses yang cepat dan praktis.</Text>
        <View style={[styles.stepsContainer, isDesktop && styles.stepsDesktop, isMobile && styles.stepsMobile]}>
          <View style={[styles.stepCard, isMobile && styles.stepCardMobile]}>
             <Ionicons name="cube" size={stepIconSize} color="#F97316" />
             <Text style={[styles.stepTitle, isMobile && styles.stepTitleMobile]}>Pilih Lokasi Pengiriman</Text>
          </View>
          <View style={[styles.stepCard, isMobile && styles.stepCardMobile]}>
             <Ionicons name="hand-right" size={stepIconSize} color="#3B82F6" />
             <Text style={[styles.stepTitle, isMobile && styles.stepTitleMobile]}>Pilih Jenis Bensin & Jumlah Liter</Text>
          </View>
          <View style={[styles.stepCard, isMobile && styles.stepCardMobile]}>
             <Ionicons name="car-sport" size={stepIconSize} color="#F59E0B" />
             <Text style={[styles.stepTitle, isMobile && styles.stepTitleMobile]}>Bayar & Bensin Dikirim</Text>
          </View>
        </View>
      </View>

      {/* Products Section */}
      <View style={[styles.productsSection, isTablet && styles.sectionMobile]}>
         <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>Pesan Bensin Sekarang</Text>
         <Text style={[styles.sectionSubtitle, isMobile && styles.sectionSubtitleMobile]}>Pilih jenis RON yang kamu butuhkan dan tentukan jumlah liter untuk pengiriman ke lokasimu.</Text>
         
         <View style={styles.recomHeader}>
            <Text style={styles.recomText}>Rekomendasi Untukmu</Text>
         </View>

         <View style={[styles.productsGrid, isDesktop && styles.productsDesktop, isMobile && styles.productsGridMobile]}>
            {products.map(p => (
               <View key={p.name} style={[styles.productCard, isMobile && styles.productCardMobile]}>
                  <View style={[styles.productImagePlaceholder, isMobile && styles.productImageMobile, { backgroundColor: p.color }]}>
                     <Text style={[styles.productBigRon, isMobile && styles.productBigRonMobile]}>{p.ron}</Text>
                     <Text style={[styles.productBrandText, isMobile && styles.productBrandTextMobile]}>E-FUEL{'\n'}{p.name.split(' ').pop()}</Text>
                  </View>
                  <View style={[styles.productInfo, isMobile && styles.productInfoMobile]}>
                     <Text style={styles.productName}>{p.name}</Text>
                     <Text style={styles.productPriceLabel}>Rp {p.price.toLocaleString('id-ID')} /Liter</Text>
                     <TouchableOpacity style={styles.productActionBtn} onPress={() => router.push('/order')}>
                        <Text style={styles.productActionBtnText}>Pesan Sekarang</Text>
                     </TouchableOpacity>
                  </View>
               </View>
            ))}
         </View>
      </View>

      {/* Testimonials */}
      <View style={[styles.testimonialSection, isTablet && styles.sectionMobile]}>
         <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>Kata Mereka</Text>
         <View style={[styles.testimonialGrid, isDesktop && styles.testimonialDesktop, isMobile && styles.testimonialGridMobile]}>
            {testimonials.map(t => (
               <Card key={t.name} style={[styles.testimonialCard, isMobile && styles.testimonialCardMobile]}>
                  <Text style={[styles.testimonialText, isMobile && styles.testimonialTextMobile]}>{t.text}</Text>
                  <View style={styles.testiUser}>
                     <Image 
                       source={{ uri: `https://ui-avatars.com/api/?name=${t.name.split(' ').join('+')}&background=CFE2E8&color=334E52&bold=true` }}
                       style={styles.avatarPlaceholder} 
                     />
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
      <View style={[styles.footer, isTablet && styles.footerMobile]}>
         <View style={[styles.footerTop, isTablet && styles.footerTopMobile]}>
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
  heroTablet: {
    width: '94%',
    height: 430,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  heroMobile: {
    height: 310,
    width: '92%',
    marginTop: Spacing.md,
    borderRadius: 18,
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
  heroOverlayMobile: {
    paddingHorizontal: Spacing.lg,
  },
  heroOverlayPhone: {
    paddingHorizontal: Spacing.md,
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
  heroMainMobile: {
    width: '100%',
    maxWidth: 300,
    alignSelf: 'center',
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
  heroTitleTablet: {
    fontSize: 38,
    lineHeight: 46,
  },
  heroTitleMobile: {
    fontSize: 22,
    lineHeight: 28,
    marginBottom: Spacing.lg,
  },
  heroActions: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  heroActionsMobile: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: Spacing.sm,
    width: '100%',
  },
  heroBtn: {
    minWidth: 180,
    height: 50,
    backgroundColor: '#CFFAFE',
    borderRadius: BorderRadius.xl,
  },
  heroBtnMobile: {
    width: '100%',
    maxWidth: 260,
    minWidth: 0,
    height: 44,
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
  heroFooterMobile: {
    bottom: 16,
  },
  heroSubText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 2,
    fontWeight: '700',
  },
  heroSubTextMobile: {
    fontSize: 10,
    letterSpacing: 1,
  },
  guideSection: {
    paddingVertical: 80,
    paddingHorizontal: Spacing.huge,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  sectionMobile: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000000',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  sectionTitleMobile: {
    fontSize: 22,
    lineHeight: 28,
  },
  sectionSubtitle: {
    ...Typography.body,
    color: Colors.textMuted,
    marginBottom: 40,
    textAlign: 'center',
    maxWidth: 600,
  },
  sectionSubtitleMobile: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  stepsContainer: {
    width: '100%',
    maxWidth: 1000,
    gap: 40,
  },
  stepsMobile: {
    gap: Spacing.lg,
  },
  stepsDesktop: {
    flexDirection: 'row',
  },
  stepCard: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.md,
  },
  stepCardMobile: {
    gap: Spacing.xs,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
  },
  stepTitleMobile: {
    fontSize: 13,
    lineHeight: 18,
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
  productsGridMobile: {
     gap: Spacing.md,
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
  productCardMobile: {
     width: '100%',
     flex: 0,
  },
  productImagePlaceholder: {
     height: 180,
     justifyContent: 'center',
     alignItems: 'center',
     position: 'relative',
  },
  productImageMobile: {
     height: 125,
  },
  productBigRon: {
    fontSize: 80,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.2)',
    position: 'absolute',
  },
  productBigRonMobile: {
    fontSize: 56,
  },
  productBrandText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22,
  },
  productBrandTextMobile: {
    fontSize: 14,
    lineHeight: 18,
  },
  productInfo: {
     padding: Spacing.lg,
  },
  productInfoMobile: {
     padding: Spacing.md,
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
  testimonialGridMobile: {
     gap: Spacing.md,
     marginTop: Spacing.lg,
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
  testimonialCardMobile: {
     padding: Spacing.lg,
     minHeight: 0,
  },
  testimonialText: {
     ...Typography.body,
     color: '#000000',
     lineHeight: 24,
     fontStyle: 'italic',
  },
  testimonialTextMobile: {
     fontSize: 13,
     lineHeight: 20,
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
  footerMobile: {
    padding: Spacing.lg,
  },
  footerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  footerTopMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: Spacing.md,
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
    flexWrap: 'wrap',
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
