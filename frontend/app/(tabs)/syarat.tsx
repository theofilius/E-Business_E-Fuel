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

export default function SyaratScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;
  const contentWidth = Math.min(width - 48, 760);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.body, { maxWidth: contentWidth }]}>

        {/* ── Definisi ── */}
        <View style={styles.section}>
          <Text style={styles.h2}>Definisi</Text>
          <Text style={styles.body1}>
            "E-Fuel" mengacu pada platform layanan pengiriman bahan bakar yang dioperasikan oleh PT E-Fuel Teknologi Indonesia, dan tidak termasuk di dalamnya pemegang saham, pemilik, atau operator. "Pengguna" mengacu pada setiap individu yang mendaftar dan menggunakan layanan E-Fuel, baik sebagai pembeli maupun pihak yang menerima pengiriman. "Driver" mengacu pada mitra pengiriman terverifikasi yang terdaftar dan bekerja sama dengan E-Fuel untuk menjalankan layanan pengiriman bahan bakar. "Layanan" merujuk pada seluruh fitur yang tersedia di platform E-Fuel, termasuk pemesanan BBM, pembayaran, pelacakan pengiriman, dan layanan Premium. "Platform" merujuk pada website E-Fuel yang dapat diakses melalui efuel.id beserta seluruh fitur dan konten di dalamnya.
          </Text>
        </View>

        <View style={styles.divider} />

        {/* ── Pendaftaran dan Akun ── */}
        <View style={styles.section}>
          <Text style={styles.h2}>Pendaftaran dan Akun</Text>
          <Text style={styles.body1}>
            Untuk menggunakan layanan E-Fuel, kamu wajib mendaftarkan diri dengan memberikan informasi yang akurat, lengkap, dan terkini, termasuk nama lengkap, nomor HP aktif, dan alamat email yang valid. Untuk mendaftar, kamu harus menyediakan alamat email aktif yang akan digunakan untuk memverifikasi identitasmu. Apabila kamu mendaftar menggunakan alamat email fiktif atau milik orang lain, E-Fuel berhak menutup akunmu tanpa pemberitahuan sebelumnya.
          </Text>
          <Text style={styles.body1}>
            Kamu bertanggung jawab penuh atas kerahasiaan kata sandi dan seluruh aktivitas yang terjadi di bawah akunmu. E-Fuel tidak bertanggung jawab atas kerugian yang timbul akibat kelalaian kamu dalam menjaga keamanan akun. Satu pengguna hanya diperbolehkan memiliki satu akun aktif. E-Fuel berhak menonaktifkan akun yang terindikasi duplikat atau digunakan untuk keperluan yang melanggar ketentuan ini.
          </Text>
          <Text style={styles.body1}>
            Kamu wajib berusia minimal 17 tahun atau telah memiliki kapasitas hukum penuh untuk melakukan transaksi. Pengguna di bawah umur harus mendapatkan persetujuan orang tua atau wali sebelum menggunakan layanan ini. E-Fuel berhak menonaktifkan atau menonaktifkan akun tanpa pemberitahuan sebelumnya apabila ditemukan indikasi pemalsuan identitas, penipuan, atau pelanggaran terhadap ketentuan ini.
          </Text>
        </View>

        <View style={styles.divider} />

        {/* ── Layanan Pengiriman BBM ── */}
        <View style={styles.section}>
          <Text style={styles.h2}>Layanan Pengiriman BBM</Text>
          <Text style={styles.body1}>
            E-Fuel menyediakan layanan pengiriman bahan bakar ke lokasi yang berada dalam area layanan aktif. Ketersediaan layanan dapat berbeda-beda tergantung kota, waktu, dan kondisi operasional. Kamu wajib memastikan keberadaan diri atau perwakilan yang berwenang di lokasi pengiriman saat driver tiba. Jika tidak ada yang menerima dalam waktu 10 menit setelah driver tiba, pesanan dianggap gagal dan biaya tidak dapat dikembalikan.
          </Text>
          <Text style={styles.body1}>
            E-Fuel tidak bertanggung jawab atas kerusakan kendaraan yang timbul akibat penggunaan jenis BBM yang tidak sesuai dengan spesifikasi kendaraanmu. Kamu bertanggung jawab penuh dalam memilih jenis BBM yang tepat untuk kendaraanmu. Jumlah BBM yang kamu terima harus diperiksa saat pengiriman berlangsung. Klaim kekurangan volume yang diajukan lebih dari 1 jam setelah pengiriman selesai tidak dapat diproses.
          </Text>
          <Text style={styles.body1}>
            E-Fuel berhak menunda atau membatalkan pengiriman dalam kondisi force majeure, termasuk namun tidak terbatas pada cuaca ekstrem, bencana alam, gangguan keamanan, atau kendala operasional yang tidak terduga. Kamu dilarang memesan BBM dengan tujuan selain pengisian kendaraan pribadi, termasuk untuk dijual kembali, ditimbun, atau disalahgunakan dengan cara apapun. Pelanggaran terhadap ketentuan ini dapat mengakibatkan penonaktifan akun secara permanen.
          </Text>
        </View>

        <View style={styles.divider} />

        {/* ── Pembayaran ── */}
        <View style={styles.section}>
          <Text style={styles.h2}>Pembayaran</Text>
          <Text style={styles.body1}>
            Seluruh transaksi pada platform E-Fuel bersifat pembayaran di muka. Pesanan baru akan diproses setelah pembayaran berhasil dikonfirmasi oleh sistem kami. Harga BBM yang ditampilkan pada platform mengikuti harga yang berlaku saat pesanan dilakukan. E-Fuel berhak mengubah harga sewaktu-waktu tanpa pemberitahuan sebelumnya sesuai dengan kebijakan pemerintah dan kondisi pasar.
          </Text>
          <Text style={styles.body1}>
            Biaya pengiriman dihitung berdasarkan jarak antara titik asal driver dan lokasi pengirimanmu, dan seluruh rincian biaya akan ditampilkan secara transparan sebelum kamu melakukan konfirmasi pembayaran. Kamu bertanggung jawab atas seluruh biaya yang timbul dari transaksi yang dilakukan melalui akunmu, termasuk biaya yang timbul akibat tindak sah yang disebabkan oleh kelalaianmu sendiri.
          </Text>
          <Text style={styles.body1}>
            E-Fuel tidak menyimpan informasi kartu kredit atau debit secara langsung. Seluruh data pembayaran diproses oleh payment gateway berlisensi yang telah memenuhi standar keamanan PCI-DSS. Dalam hal terjadi kegagalan transaksi yang disebabkan oleh sistem E-Fuel, dana akan dikembalikan ke metode pembayaran asal dalam 1–3 hari kerja. Segala pertanyaan mengenai pembayaran dapat kamu tujukan ke support@efuel.id.
          </Text>
        </View>

        <View style={styles.divider} />

        {/* ── Pembatalan dan Refund ── */}
        <View style={styles.section}>
          <Text style={styles.h2}>Pembatalan dan Refund</Text>
          <Text style={styles.body1}>
            Kamu dapat membatalkan pesanan tanpa dikenakan biaya selama driver belum berangkat menuju lokasi pengiriman. Pembatalan setelah driver berangkat tidak dapat dilakukan dan tidak mendapat pengembalian dana. Bila kamu ingin membatalkan pesanan, masuk ke halaman Lacak Pesanan dan pilih opsi "Batalkan Pesanan" selama statusnya masih memungkinkan.
          </Text>
          <Text style={styles.body1}>
            Refund akan diproses apabila terjadi kegagalan pengiriman yang disebabkan oleh pihak E-Fuel, jumlah BBM yang diterima tidak sesuai dengan pesanan, atau driver tidak dapat ditemukan setelah melewati waktu tunggu yang wajar. Pengajuan refund harus dilakukan maksimal 1×24 jam setelah transaksi berlangsung dengan menyertakan bukti yang relevan. E-Fuel berhak menolak pengajuan refund yang tidak memenuhi ketentuan ini. Refund yang disetujui akan dikembalikan ke metode pembayaran asal dalam 1–5 hari kerja tergantung kebijakan penyedia layanan pembayaran.
          </Text>
        </View>

        <View style={styles.divider} />

        {/* ── Layanan Premium ── */}
        <View style={styles.section}>
          <Text style={styles.h2}>Layanan Premium</Text>
          <Text style={styles.body1}>
            E-Fuel Premium adalah layanan berlangganan berbayar yang memberikan akses ke fitur dan keuntungan eksklusif sebagaimana dijelaskan di halaman Premium. Masa aktif Premium dihitung sejak pembayaran berhasil dikonfirmasi dan berakhir sesuai dengan durasi paket yang dipilih. Layanan Premium tidak diperpanjang secara otomatis, dan kamu akan mendapatkan notifikasi pengingat sebelum masa aktif berakhir.
          </Text>
          <Text style={styles.body1}>
            E-Fuel berhak mengubah benefit, harga, atau ketentuan paket Premium dengan pemberitahuan minimal 14 hari sebelum perubahan berlaku. Pembatalan berlangganan Premium di tengah periode tidak mendapatkan pengembalian dana, namun kamu tetap dapat menikmati seluruh benefit hingga masa aktif berakhir. E-Fuel berhak mencabut status Premium tanpa pengembalian dana apabila ditemukan pelanggaran terhadap syarat dan ketentuan ini.
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
    gap: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  h2: {
    fontSize: Platform.OS === 'web' ? 26 : 20,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: Platform.OS === 'web' ? 34 : 28,
    marginBottom: 4,
  },
  body1: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 24,
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