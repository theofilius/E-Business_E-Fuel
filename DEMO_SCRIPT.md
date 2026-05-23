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

### 5. Penutup (1 Menit)
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
