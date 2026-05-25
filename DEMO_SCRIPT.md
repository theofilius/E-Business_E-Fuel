# DEMO SCRIPT — E-Fuel Final Project

Gunakan script ini sebagai panduan alur presentasi di depan penguji untuk memastikan demo berjalan terstruktur, logis, dan memamerkan seluruh fitur utama E-Fuel tanpa mengalami hambatan.

## Persiapan Pra-Demo (5 Menit Sebelum Presentasi)
1. Buka terminal di folder project utama (`e-fuel`).
2. Jalankan instalasi ulang jika pindah mesin: `npm run install-all`.
3. Pastikan database dan backend berjalan: Buka terminal di `backend` dan jalankan `npm run dev`.
4. Lakukan reset/seed data demo: Buka terminal baru di `backend` dan jalankan `npm run seed`.
5. Jalankan frontend: Buka terminal di root `e-fuel` lalu jalankan `npm run dev`.
6. Buka browser (Chrome disarankan) dan masuk ke `http://localhost:8081`.

---

## 🎬 Skenario Presentasi

### 1. Pembukaan & Landing Page (1 Menit)
*Aksi: Tampilkan layar utama `http://localhost:8081`.*
- **Jelaskan**: "E-Fuel adalah solusi pengiriman bahan bakar on-demand. Bayangkan ini seperti GoFood, tetapi untuk bensin (BBM), mengatasi masalah saat kendaraan kehabisan bensin di tengah jalan atau bagi mereka yang tidak punya waktu mengantre di SPBU."
- **Demo Interaksi**: 
  - Scroll ke bawah memperlihatkan daftar harga produk BBM secara real-time.
  - Klik tombol "Lihat Cara Kerja" untuk mendemokan auto-scroll interaktif.
  - Tunjukkan testimonials.

### 2. Skenario Customer: Pesan BBM (2 Menit)
*Aksi: Klik tombol "Masuk" dan login.*
- **Akun**: `demo@efuel.com` / `demo123`
- **Jelaskan**: "Sebagai customer, setelah saya login, saya dapat langsung melihat pilihan BBM, dan harga terkini."
- **Demo Interaksi**:
  - A. Flow Customer (End-to-End)
1. **Buka Web Frontend**
   - Tampil *landing page* dengan Hero mobil E-FUEL.
2. **Login Customer**
   - Klik **Masuk**
   - Gunakan kredensial: `demo@efuel.com` / `demo123`
3. **Pesan Bensin**
   - Setelah login, tampilkan landing page hero E-FUEL.
   - Klik **Pesan Sekarang**.
   - Akan diarahkan ke halaman `/order` (Pilih Bensin dan Jumlah Liter).
   - Pilih **Lokasi** (Klik Gunakan Lokasi Saya atau drag pin di peta).
   - Pilih **Jenis BBM** (Misal: BLAZE 95).
   - Masukkan **Jumlah** (Bisa per Liter atau per Nominal Rupiah).
   - Buka **Pilihan Pembayaran** (Misal: QRIS atau BCA Virtual Account).
   - Klik **Pesan Sekarang**.
4. **Simulasi Pembayaran**
   - Sistem akan menampilkan layar QRIS atau VA.
   - Perhatikan *countdown timer*.
   - Klik tombol **Saya Sudah Bayar** untuk simulasi sukses.
   - Akan diarahkan otomatis ke tab **Pesanan Saya**.
5. **Lacak Pesanan**
   - Di daftar pesanan, klik **Lacak Pesanan** pada order terbaru.
   - Lihat peta *live tracking* dan status (Menunggu Driver -> Diterima -> Selesai). Demo

### 2.5 Skenario Premium: Upgrade & Manfaat (2 Menit)
*Aksi: Masih di tab Customer, klik "Premium" di navbar.*
- **Jelaskan**: "E-Fuel memiliki program membership Premium untuk pelanggan setia. Dengan berlangganan, pengguna mendapatkan berbagai keuntungan eksklusif."
- **Demo Interaksi**:
  1. Klik **Premium** di navbar → tampil halaman Premium dengan hero gradient.
  2. Scroll ke bawah untuk lihat paket (1 Minggu s.d. 1 Tahun) dan tabel benefit.
  3. Klik **Beli Sekarang** pada paket **3 Bulan** (badge "Recommend").
  4. Di halaman **Checkout**: pilih metode pembayaran (mis. **QRIS**), klik **Bayar Sekarang**.
  5. Diarahkan ke halaman **simulasi pembayaran** (`/premium/payment`):
     - *QRIS*: tampil QR placeholder besar dengan countdown 5 menit.
     - *Virtual Account*: pilih bank → tampil nomor VA dummy → tombol "Salin".
     - *GoPay/DANA*: tampil instruksi langkah demi langkah.
  6. Klik **Saya Sudah Bayar** → user baru menjadi Premium (PUT /api/auth/premium dipanggil).
  7. Alert sukses muncul → pilih **Mulai Pesan Bensin**.
  8. Perhatikan badge **⭐ PREMIUM** di Rincian Pesanan.
  9. Pilih bensin & set 10L → lihat **Diskon Premium (Rp300/L)** dan **Ongkir: Gratis**.

*Demo Premium account (sudah aktif tanpa perlu upgrade):*
- Login sebagai `premium@efuel.com` / `premium123` untuk demo yang sudah berlangganan.

### 3. Skenario Driver: Menerima Order (2 Menit)
*Aksi: Buka tab baru / incognito, lalu login sebagai Driver.*
- **Akun**: `driver1@efuel.com` / `driver123`
- **Jelaskan**: "Sekarang di tab ini, kita berperan sebagai Driver. Driver yang sedang aktif akan melihat pesanan yang masuk ke areanya."
- **Demo Interaksi**:
  - Tunjukkan bahwa ada Order baru berstatus `pending` dari customer `Customer Demo`.
  - Klik **"Terima Pesanan"**.
  - *Aksi Opsional*: Tunjukkan UI perubahan status pesanan pada Driver Dashboard (menjadi *Accepted*, *On The Way*, dsb).
  - *Aksi Opsional*: Kembali sebentar ke tab Customer untuk menunjukkan bahwa pesanan telah diterima (Status *Accepted* oleh driver).

### 4. Skenario Admin: Mengelola Platform (2 Menit)
*Aksi: Buka browser lain / incognito baru, login sebagai Admin.*
- **Akun**: `admin@efuel.com` / `admin123`
- **Jelaskan**: "Terakhir, inilah layar kontrol Admin untuk mengelola keseluruhan ekosistem E-Fuel. Layoutnya terdiri dari Sidebar Navigation di kiri untuk berbagai modul."
- **Demo Interaksi**:
  - **Dashboard**: Tunjukkan Overview statistik (Revenue, Order Masuk).
  - **Kelola Order**: Klik menu ini di sidebar. Tunjukkan filter tab (Baru, Diantar, Selesai) untuk menyortir pesanan.
  - **Kelola Driver**: Tunjukkan daftar driver yang aktif beserta inisial avatarnya. Jelaskan bahwa admin bisa memantau rating dan pesanan.
  - **Laporan & Analitik**: Perlihatkan bar chart custom yang menampilkan dominasi bahan bakar terlaris (misal BLAZE 95).
  - **Pengaturan Cabang**: Tunjukkan form informasi area layanan dan tabel harga BBM di bawahnya. Anda dapat mengedit harga di sini jika diinginkan.

### 5. Skenario Customer + Admin: Refund End-to-End (3 Menit)

**Bagian A — Customer Mengajukan Refund**
*Aksi: Login sebagai Customer (`demo@efuel.com` / `demo123`).*
- Buka **Pesanan Saya** dari Navbar.
- Cari order dengan status **Selesai** atau **Dibatalkan** — tombol **"Ajukan Refund"** muncul di card.
- Klik tombol → halaman **Ajukan Refund**: kotak biru muda (tanggal, total, driver), dropdown alasan, textarea.
- Pilih **"Volume Tidak Sesuai"** — info box kontekstual muncul otomatis.
- Isi textarea singkat → klik **"Kirim Pengajuan Refund"**.
- Tunjukkan **modal konfirmasi** dua tombol. Klik **"Batal"** dulu — modal menutup tanpa submit.
- Klik lagi → **"Kirim"** → redirect ke halaman sukses (icon hijau + status pill "Menunggu Proses").
- Kembali ke Pesanan Saya → badge **"Refund Diproses"** kuning muncul di order card.
- Tunjukkan **bell notifikasi** Navbar — dropdown tampil refund terbaru.

**Bagian B — Admin Approve Refund**
*Aksi: Buka tab baru, login sebagai Admin (`admin@efuel.com` / `admin123`).*
- Masuk Admin Dashboard → klik **"Kelola Refund"** di sidebar (badge merah menunjukkan jumlah pending).
- Tunjukkan 4 summary cards (Pending, Disetujui, Ditolak, Total Nominal).
- Temukan refund yang baru diajukan → klik **"Setujui"**.
- Tunjukkan modal konfirmasi → klik **"Setujui"** → status berubah ke **"Disetujui"** hijau langsung.

**Bagian C — Customer Melihat Status Update**
*Aksi: Kembali ke tab Customer.*
- Refresh Pesanan Saya (klik "Muat Ulang") → badge berubah dari kuning **"Diproses"** menjadi hijau **"Refund Disetujui"**.
- *(Opsional)* Tunjukkan skenario **Tolak**: Admin klik "Tolak" + isi catatan → Customer lihat badge merah "Refund Ditolak" + catatan admin. Customer bisa klik **"Ajukan Ulang"** untuk re-submit.

### 6. Penutup (1 Menit)
- **Jelaskan**: "Dengan E-Fuel, proses dari pelanggan memesan, kurir/driver mengirimkan, hingga admin memantau seluruh transaksi dapat berjalan lancar dalam satu ekosistem terpadu."
- Tutup presentasi dan persilakan penguji bertanya.

---

## 🚫 Do's and Don'ts Selama Demo
1. **DO**: Gunakan browser dengan width yang cukup (fullscreen). UI dioptimalkan dengan panel split desktop.
2. **DO**: Ingatkan penguji bahwa "Lupa Kata Sandi" dan "Login Google" di-disable (Segera Hadir) secara sengaja untuk lingkup demo 2 hari.
3. **DON'T**: Me-refresh halaman secara agresif saat API sedang loading.
4. **DON'T**: Klik tombol "Help & Support" atau fitur *coming soon* lainnya kecuali memang ditanya oleh penguji (akan muncul alert "Segera Hadir").
5. **DON'T**: Matikan terminal backend selama demo berlangsung, karena state frontend bergantung sepenuhnya pada API server.

---
**Semoga berhasil presentasinya! 🚀**
