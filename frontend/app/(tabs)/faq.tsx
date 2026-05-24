import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { router } from 'expo-router';

// ─── Data ─────────────────────────────────────────────────────────────────────

type FAQ = { q: string; a: string };
type Category = { id: string; label: string; faqs: FAQ[] };

const CATEGORIES: Category[] = [
  {
    id: 'umum',
    label: 'Umum',
    faqs: [
      {
        q: 'Apa itu E-Fuel?',
        a: 'E-Fuel adalah layanan pengisian bahan bakar berbasis aplikasi yang mengantarkan bensin langsung ke lokasi kamu. Kamu tidak perlu pergi ke SPBU — cukup pesan melalui website, bayar, dan driver kami akan datang ke tempatmu.',
      },
      {
        q: 'Apakah E-Fuel legal dan aman?',
        a: 'Ya. E-Fuel beroperasi sesuai regulasi distribusi bahan bakar yang berlaku di Indonesia. Semua driver kami telah bersertifikat dalam penanganan dan pengiriman BBM yang aman, dan setiap kendaraan pengiriman dilengkapi dengan wadah khusus berstandar keamanan.',
      },
      {
        q: 'Di kota mana saja E-Fuel tersedia?',
        a: 'Saat ini E-Fuel tersedia di 18 kota besar di Indonesia, termasuk Jakarta, Bandung, Surabaya, Medan, Makassar, Bali, dan lainnya. Kamu bisa cek ketersediaan lengkap di halaman Area Layanan.',
      },
      {
        q: 'Berapa lama estimasi pengiriman?',
        a: 'Rata-rata 5–15 menit setelah pembayaran dikonfirmasi, tergantung jarak dan ketersediaan driver di area kamu. Estimasi waktu tiba yang akurat akan ditampilkan sebelum kamu melakukan pembayaran.',
      },
      {
        q: 'Apakah E-Fuel beroperasi 24 jam?',
        a: 'Di beberapa kota besar seperti Jakarta, Surabaya, dan Bali, layanan tersedia 24 jam. Untuk kota lainnya, jam operasional adalah 06.00–22.00 WIB. Kamu bisa cek jam operasional spesifik per kota di halaman Area Layanan.',
      },
    ],
  },
  {
    id: 'pemesanan',
    label: 'Pemesanan',
    faqs: [
      {
        q: 'Jenis BBM apa saja yang tersedia?',
        a: 'Saat ini E-Fuel menyediakan Pertalite, Pertamax, BLAZE 95, dan Solar. Ketersediaan jenis BBM dapat berbeda tergantung kota dan cabang terdekat.',
      },
      {
        q: 'Berapa minimum dan maksimum pembelian?',
        a: 'Minimum pembelian adalah 1 liter. Maksimum pembelian per transaksi adalah 25 liter atau Full Tank sesuai kapasitas kendaraanmu.',
      },
      {
        q: 'Apakah saya harus ada di lokasi saat bensin diantar?',
        a: 'Ya, kamu atau orang yang kamu percaya perlu berada di lokasi pengiriman untuk menerima dan memastikan bensin langsung diisikan ke kendaraan.',
      },
      {
        q: 'Bisakah saya memesan untuk kendaraan orang lain atau lokasi berbeda?',
        a: 'Bisa. Kamu bisa mengubah alamat pengiriman di halaman pemesanan. Pastikan ada seseorang di lokasi tersebut untuk menerima pengiriman.',
      },
      {
        q: 'Bagaimana cara membatalkan pesanan?',
        a: 'Pembatalan dapat dilakukan selama driver belum berangkat. Masuk ke halaman Lacak Pesanan dan pilih "Batalkan Pesanan." Jika driver sudah dalam perjalanan, pembatalan tidak dapat dilakukan dan biaya tetap dikenakan.',
      },
      {
        q: 'Apakah bisa pesan lebih dari satu kendaraan sekaligus?',
        a: 'Saat ini setiap akun hanya bisa memproses satu pesanan aktif dalam satu waktu. Untuk kebutuhan armada atau multiple kendaraan, hubungi tim kami untuk solusi korporat.',
      },
    ],
  },
  {
    id: 'pembayaran',
    label: 'Pembayaran',
    faqs: [
      {
        q: 'Metode pembayaran apa saja yang diterima?',
        a: 'E-Fuel menerima berbagai metode pembayaran, termasuk transfer bank, kartu kredit/debit, GoPay, OVO, Dana, ShopeePay, dan QRIS.',
      },
      {
        q: 'Apakah ada biaya tambahan selain harga BBM?',
        a: 'Ada biaya pengiriman mulai dari Rp 5.000 tergantung jarak. Untuk pengguna Premium, biaya pengiriman gratis untuk pembelian di atas 10 liter. Semua biaya ditampilkan secara transparan sebelum kamu konfirmasi pembayaran.',
      },
      {
        q: 'Apakah pembayaran aman?',
        a: 'Ya. Semua transaksi diproses melalui payment gateway berlisensi Bank Indonesia. Data kartu dan rekening kamu tidak pernah disimpan langsung di server kami.',
      },
      {
        q: 'Bagaimana jika pembayaran saya gagal tapi saldo sudah terpotong?',
        a: 'Dana akan otomatis dikembalikan ke metode pembayaran asal dalam 1–3 hari kerja. Jika lebih dari itu belum kembali, hubungi tim support kami dengan menyertakan bukti transaksi.',
      },
      {
        q: 'Apakah ada refund jika saya tidak puas?',
        a: 'Jika terjadi kesalahan dari pihak kami misalnya jumlah BBM yang diterima tidak sesuai pesanan — kami akan melakukan refund penuh atau pengiriman ulang. Hubungi support kami dalam 1×24 jam setelah transaksi.',
      },
    ],
  },
  {
    id: 'pengiriman',
    label: 'Pengiriman & Driver',
    faqs: [
      {
        q: 'Siapa driver E-Fuel?',
        a: 'Driver E-Fuel adalah mitra terverifikasi yang telah melalui seleksi ketat meliputi pengecekan latar belakang, pelatihan keselamatan penanganan BBM, dan uji kelayakan kendaraan. Setiap driver dilengkapi dengan identitas resmi yang bisa kamu verifikasi di aplikasi.',
      },
      {
        q: 'Kendaraan apa yang digunakan driver untuk mengantarkan BBM?',
        a: 'Driver menggunakan motor dengan jeriken khusus berstandar keamanan yang tersertifikasi untuk pengangkutan bahan bakar. Kapasitas maksimum per pengiriman adalah 25 liter.',
      },
      {
        q: 'Bagaimana jika driver tidak kunjung tiba melebihi estimasi?',
        a: 'Kamu bisa menghubungi driver langsung melalui halaman Lacak Pesanan. Jika tidak ada respons dalam 10 menit, hubungi support kami dan kami akan segera mencarikan driver pengganti atau melakukan refund penuh.',
      },
      {
        q: 'Apakah saya bisa memilih driver tertentu?',
        a: 'Belum tersedia saat ini. Driver ditentukan otomatis berdasarkan lokasi dan ketersediaan terdekat untuk memastikan waktu tiba paling cepat.',
      },
    ],
  },
  {
    id: 'akun',
    label: 'Akun & Teknis',
    faqs: [
      {
        q: 'Bagaimana cara mendaftar E-Fuel?',
        a: 'Klik tombol "Daftar" di pojok kanan atas, masukkan email atau nomor HP kamu, verifikasi OTP, dan akun kamu langsung aktif. Proses pendaftaran kurang dari 2 menit.',
      },
      {
        q: 'Apakah data pribadi saya aman?',
        a: 'E-Fuel mematuhi ketentuan Undang-Undang Perlindungan Data Pribadi (UU PDP) Indonesia. Data kamu tidak akan dijual atau dibagikan kepada pihak ketiga tanpa persetujuanmu. Detail lebih lanjut bisa dibaca di Kebijakan Privasi kami.',
      },
      {
        q: 'Bagaimana cara menghubungi customer support?',
        a: 'Kamu bisa menghubungi kami melalui live chat di website (24 jam), WhatsApp di 0811-EFUEL-ID, atau email ke support@efuel.id. Tim kami merespons dalam maksimal 15 menit di jam operasional.',
      },
      {
        q: 'Apakah E-Fuel tersedia dalam bentuk aplikasi mobile?',
        a: 'Saat ini E-Fuel dapat diakses melalui website yang mobile-friendly. Aplikasi iOS dan Android sedang dalam pengembangan dan akan diluncurkan dalam waktu dekat.',
      },
    ],
  },
  {
    id: 'premium',
    label: 'Premium',
    faqs: [
      {
        q: 'Apa itu E-Fuel Premium?',
        a: 'E-Fuel Premium adalah paket berlangganan yang memberikan kamu akses ke berbagai keuntungan eksklusif — mulai dari diskon per liter, ongkir gratis, hingga prioritas driver. Tersedia dalam paket mingguan, bulanan, hingga tahunan.',
      },
      {
        q: 'Apa saja keuntungan E-Fuel Premium?',
        a: 'Pengguna Premium mendapatkan diskon Rp 300–500 per liter tergantung paket, ongkir gratis untuk pembelian di atas 10 liter, prioritas pencarian driver lebih cepat, estimasi waktu tiba lebih akurat, serta promo dan cashback eksklusif member.',
      },
      {
        q: 'Berapa harga paket Premium?',
        a: 'Tersedia lima pilihan paket: 1 minggu Rp 14.900, 1 bulan Rp 49.900, 3 bulan Rp 129.900, 6 bulan Rp 249.900, dan 1 tahun Rp 449.900. Semakin panjang paket, semakin besar diskon per liter yang kamu dapatkan.',
      },
      {
        q: 'Bagaimana cara berlangganan Premium?',
        a: 'Klik menu "Premium" di navbar, pilih paket yang sesuai, lalu selesaikan pembayaran. Status Premium aktif langsung setelah pembayaran dikonfirmasi.',
      },
      {
        q: 'Apakah Premium otomatis diperpanjang?',
        a: 'Tidak, Premium tidak diperpanjang otomatis. Kamu akan mendapat notifikasi 3 hari sebelum masa aktif berakhir sebagai pengingat untuk memperpanjang.',
      },
      {
        q: 'Apakah diskon Premium berlaku untuk semua jenis BBM?',
        a: 'Ya, diskon per liter berlaku untuk semua jenis BBM yang tersedia di E-Fuel, termasuk Pertalite, Pertamax, BLAZE 95, dan Solar.',
      },
      {
        q: 'Bagaimana jika saya ingin upgrade atau ganti paket Premium?',
        a: 'Kamu bisa upgrade paket kapan saja. Sisa masa aktif paket lama akan dikonversi secara proporsional ke paket baru. Downgrade baru berlaku setelah masa aktif paket berjalan selesai.',
      },
      {
        q: 'Apakah ada refund jika saya ingin berhenti Premium di tengah periode?',
        a: 'Pembatalan di tengah periode tidak mendapatkan refund, namun kamu tetap bisa menikmati seluruh benefit hingga masa aktif berakhir. Jika ada kendala teknis dari pihak kami, refund proporsional dapat diajukan ke tim support.',
      },
    ],
  },
];

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

// ─── Component ────────────────────────────────────────────────────────────────

export default function FAQScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;
  const [activeId, setActiveId] = useState('umum');

  const activeCategory = CATEGORIES.find(c => c.id === activeId)!;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* ── Page Title ── */}
      <View style={styles.titleSection}>
        <Text style={styles.pageTitle}>Frequently Asked Questions</Text>
      </View>

      {/* ── Body: Sidebar + Content ── */}
      <View style={[styles.body, isDesktop && styles.bodyDesktop]}>
        {/* Sidebar */}
        <View style={[styles.sidebar, isDesktop && styles.sidebarDesktop]}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.sidebarItem, activeId === cat.id && styles.sidebarItemActive]}
              onPress={() => setActiveId(cat.id)}
            >
              <Text style={[styles.sidebarText, activeId === cat.id && styles.sidebarTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQ Content */}
        <View style={styles.content}>
          {activeCategory.faqs.map((faq, index) => (
            <View key={index} style={styles.faqItem}>
              <Text style={styles.faqQuestion}>
                {index + 1}. {faq.q}
              </Text>
              <Text style={styles.faqAnswer}>{faq.a}</Text>
            </View>
          ))}
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Title
  titleSection: {
    paddingTop: 48,
    paddingBottom: 32,
    paddingHorizontal: 24,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  pageTitle: {
    fontSize: Platform.OS === 'web' ? 40 : 28,
    fontWeight: '800',
    color: '#0F172A',
  },

  // Body layout
  body: {
    paddingHorizontal: 24,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    paddingBottom: 80,
  },
  bodyDesktop: {
    flexDirection: 'row',
    gap: 48,
    alignItems: 'flex-start',
  },

  // Sidebar
  sidebar: {
    marginBottom: 32,
  },
  sidebarDesktop: {
    width: 160,
    flexShrink: 0,
  },
  sidebarItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 2,
  },
  sidebarItemActive: {
    backgroundColor: '#0F172A',
  },
  sidebarText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
  },
  sidebarTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // FAQ content
  content: {
    flex: 1,
    gap: 28,
  },
  faqItem: {
    gap: 6,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 22,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
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