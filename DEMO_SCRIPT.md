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
  - Di halaman `Pesan Bensin` (Explore), pilih tipe BBM (misal: **RON 92 IGNITE**).
  - Masukkan jumlah bensin: `10` Liter. *Tunjukkan sistem secara otomatis menghitung harga*.
  - *Tunjukkan simulasi form lokasi*.
  - Pilih metode pembayaran (misal: **Cash**).
  - Klik **"Pesan Sekarang"**.

### 3. Skenario Driver: Menerima Order (2 Menit)
*Aksi: Buka tab baru / incognito, lalu login sebagai Driver.*
- **Akun**: `driver1@efuel.com` / `driver123`
- **Jelaskan**: "Sekarang di tab ini, kita berperan sebagai Driver. Driver yang sedang aktif akan melihat pesanan yang masuk ke areanya."
- **Demo Interaksi**:
  - Tunjukkan bahwa ada Order baru berstatus `pending` dari customer `Customer Demo`.
  - Klik **"Terima Pesanan"**.
  - *Aksi Opsional*: Tunjukkan UI perubahan status pesanan pada Driver Dashboard (menjadi *Accepted*, *On The Way*, dsb).
  - *Aksi Opsional*: Kembali sebentar ke tab Customer untuk menunjukkan bahwa pesanan telah diterima (Status *Accepted* oleh driver).

### 4. Skenario Admin: Mengelola Platform (1 Menit)
*Aksi: Buka browser lain / incognito baru, login sebagai Admin.*
- **Akun**: `admin@efuel.com` / `admin123`
- **Jelaskan**: "Terakhir, inilah layar kontrol Admin untuk mengelola keseluruhan ekosistem E-Fuel."
- **Demo Interaksi**:
  - Tunjukkan statistik **Total Revenue** dan **Total Orders** yang berubah karena pesanan Customer tadi.
  - Tunjukkan daftar pesanan masuk di tabel **Pesanan Terbaru**.
  - Edit harga BBM: Klik ikon pensil pada salah satu produk BBM (misal IGNITE), ubah harga menjadi nominal lain, lalu simpan.

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
