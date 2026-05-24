import { router } from 'expo-router';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';

const FOOTER_COLS = [
  { 
    title: 'E-FUEL', 
    links: [
      { label: 'Tentang E-FUEL', route: '/tentang' },
      { label: 'Cara Kerja', route: '/' },
      { label: 'Area Layanan', route: '/area-layanan' },
      { label: 'Jadi Mitra Driver', route: null },
    ] 
  },
  { 
    title: 'Fitur', 
    links: [
    //   { label: 'Pesan Bensin ›', route: '/order' },
      { label: 'Pesan Bensin ›', route: null },
      { label: 'Emergency Fuel', route: null },
      { label: 'Pengiriman Cepat', route: null },
      { label: 'Premium Membership', route: '/premium' },
    ] 
  },
  { 
    title: 'Informasi Layanan', 
    links: [
      { label: 'Syarat dan Ketentuan', route: '/syarat' },
    //   { label: 'Kebijakan Privasi', route: '/privasi' },
      { label: 'Kebijakan Privasi', route: null },
      { label: 'FAQs', route: '/faq' },
    ] 
  },
  { 
    title: 'Sosial Media', 
    links: [
      { label: '@efuel.id', route: null },
      { label: 'E-Fuel Indonesia', route: null },
      { label: '@efuel.id (TikTok)', route: null },
      { label: 'E-Fuel Indonesia (YT)', route: null },
    ] 
  },
];
const DIFFERENCES = [
  { title: 'Cepat & terukur', desc: 'Estimasi waktu tiba akurat berbasis lokasi real-time. Kamu tahu persis kapan driver sampai.' },
  { title: 'Driver terverifikasi', desc: 'Semua driver E-Fuel telah melalui seleksi ketat dan pelatihan keselamatan pengiriman bahan bakar.' },
  { title: 'Tersedia 24 jam', desc: 'Kehabisan bensin tidak mengenal waktu. Begitu juga layanan kami.' },
  { title: 'Harga transparan', desc: 'Tidak ada biaya tersembunyi. Harga yang kamu lihat adalah harga yang kamu bayar.' },
  { title: 'Jangkauan luas', desc: 'Tersedia di berbagai kota besar Indonesia dan terus berkembang ke daerah-daerah baru setiap bulannya.' },
];

export default function TentangScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;
  const contentWidth = Math.min(width - 48, 760);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.body, { maxWidth: contentWidth }]}>

        {/* ── Hero ── */}
        <View style={styles.section}>
          <Text style={styles.h1}>Bensin habis di jalan? Itu masalah masa lalu.</Text>
          <Text style={styles.body1}>
            E-Fuel hadir sebagai solusi pengisian bahan bakar yang datang langsung ke lokasi kamu — kapan pun, di mana pun, tanpa harus antre di SPBU.
          </Text>
        </View>

        <View style={styles.divider} />

        {/* ── Kenapa E-Fuel ada ── */}
        <View style={styles.section}>
          <Text style={styles.h2}>Kenapa E-Fuel ada?</Text>
          <Text style={styles.body1}>
            Kami lahir dari masalah yang dialami jutaan orang setiap harinya. Kehabisan bensin di tengah jalan, harus mendorong kendaraan ke SPBU terdekat, atau terpaksa meninggalkan kendaraan karena tidak ada waktu. Situasi yang seharusnya bisa dihindari — dan kami percaya teknologi bisa jadi jawabannya.
          </Text>
          <Text style={[styles.body1, { marginTop: 12 }]}>
            E-Fuel bukan sekadar layanan antar bensin. Kami membangun ekosistem pengisian bahan bakar yang lebih praktis, lebih aman, dan lebih efisien untuk kehidupan modern.
          </Text>
        </View>

        <View style={styles.divider} />

        {/* ── Cara Kerja ── */}
        <View style={styles.section}>
          <Text style={styles.h2}>Cara kerja E-Fuel</Text>
          <View style={styles.stepsList}>
            <Text style={styles.body1}>
              <Text style={styles.bold}>1. Pilih lokasi & jenis BBM,</Text>
              {' '}Tentukan titik pengiriman dan pilih jenis bahan bakar yang kamu butuhkan — dari Pertalite, Pertamax, hingga Solar.
            </Text>
            <Text style={styles.body1}>
              <Text style={styles.bold}>2. Bayar dalam hitungan detik,</Text>
              {' '}Selesaikan pembayaran langsung di platform kami. Aman, cepat, dan tersedia berbagai metode pembayaran.
            </Text>
            <Text style={styles.body1}>
              <Text style={styles.bold}>3. Driver datang ke kamu,</Text>
              {' '}Driver terverifikasi kami akan tiba dalam 5–15 menit membawa bahan bakar langsung ke kendaraanmu.
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* ── Apa yang membuat berbeda ── */}
        <View style={styles.section}>
          <Text style={styles.h2}>Apa yang membuat E-Fuel berbeda?</Text>
          <View style={styles.differencesList}>
            {DIFFERENCES.map((item, i) => (
              <Text key={i} style={styles.body1}>
                <Text style={styles.bold}>{item.title} </Text>
                {item.desc}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        {/* ── Untuk siapa ── */}
        <View style={styles.section}>
          <Text style={styles.h2}>Untuk siapa E-Fuel?</Text>
          <Text style={styles.body1}>
            E-Fuel dirancang untuk semua orang — pengemudi harian yang tidak mau buang waktu antre, pelaku usaha yang butuh kepastian operasional kendaraan armada, hingga pengendara motor yang kehabisan bensin di tengah perjalanan.
          </Text>
        </View>

        <View style={styles.divider} />

        {/* ── Bergabunglah ── */}
        <View style={styles.section}>
          <Text style={styles.h2}>Bergabunglah bersama ratusan ribu pengguna E-Fuel</Text>
          <Text style={styles.body1}>
            Sejak diluncurkan, E-Fuel telah melayani ratusan ribu pengiriman bahan bakar di seluruh Indonesia. Kami terus berinovasi untuk menghadirkan pengalaman terbaik buat kamu.
          </Text>
        </View>

        <View style={styles.divider} />

        {/* ── Visi & Misi ── */}
        <View style={styles.section}>
          <Text style={styles.h2}>Visi & Misi</Text>
          <Text style={styles.body1}>
            <Text style={styles.bold}>Visi </Text>
            Menjadi platform distribusi bahan bakar berbasis teknologi terdepan di Asia Tenggara.
          </Text>
          <Text style={[styles.body1, { marginTop: 16 }]}>
            <Text style={styles.bold}>Misi </Text>
            Memastikan setiap orang bisa mendapatkan bahan bakar dengan mudah, aman, dan efisien — tanpa harus meninggalkan tempat mereka berada.
          </Text>
        </View>

      </View>

      {/* ── Footer ── */}
      <View style={styles.footer}>
        <View style={[styles.footerGrid, isDesktop && styles.footerGridDesktop]}>
          <View style={styles.footerBrandCol}>
            <Text style={styles.footerBrand}>E-FUEL</Text>
          </View>
          {FOOTER_COLS.map(col => (
            <View key={col.title} style={styles.footerCol}>
              <Text style={styles.footerColTitle}>{col.title}</Text>
            {col.links.map((link, i) => (
            <TouchableOpacity 
                key={i} 
                onPress={() => link.route ? router.push(link.route as any) : <></>}
            >
                <Text style={styles.footerLink}>{link.label}</Text>
            </TouchableOpacity>
            ))}
            </View>
          ))}
          <View style={styles.footerCol}>
            <Text style={styles.footerColTitle}>Berbagai Metode Pembayaran</Text>
            <Text style={styles.footerPaymentNote}>Didukung oleh</Text>
            <View style={styles.paymentBadges}>
              {['QRIS', 'Dana', 'OVO', 'Mandiri', 'BCA', 'BNI'].map(p => (
                <View key={p} style={styles.paymentBadge}>
                  <Text style={styles.paymentBadgeText}>{p}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.midtransText}>midtrans</Text>
          </View>
        </View>
        <View style={styles.footerBottom}>
          <Text style={styles.copyText}>© 2026 PT E-Fuel Indonesia. All Rights Reserved.</Text>
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
  body: {
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 64,
  },
  section: {
    paddingVertical: 32,
    gap: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  h1: {
    fontSize: Platform.OS === 'web' ? 32 : 24,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: Platform.OS === 'web' ? 42 : 32,
    marginBottom: 4,
  },
  h2: {
    fontSize: Platform.OS === 'web' ? 26 : 20,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: Platform.OS === 'web' ? 34 : 28,
    marginBottom: 4,
  },
  body1: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 24,
  },
  bold: {
    fontWeight: '700',
    color: '#0F172A',
  },
  stepsList: {
    gap: 14,
  },
  differencesList: {
    gap: 10,
  },

  // Footer
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 48,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  footerGrid: {
    gap: 32,
    marginBottom: 40,
  },
  footerGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  footerBrandCol: {
    marginBottom: 8,
  },
  footerBrand: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1,
  },
  footerCol: {
    gap: 8,
    minWidth: 120,
  },
  footerColTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#14B8A6',
    marginBottom: 4,
  },
  footerLink: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  footerPaymentNote: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 4,
  },
  paymentBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  paymentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
  },
  midtransText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    fontStyle: 'italic',
    marginTop: 8,
  },
  footerBottom: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 20,
    alignItems: 'center',
  },
  copyText: {
    fontSize: 12,
    color: '#94A3B8',
  },
});