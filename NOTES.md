# NOTES — E-Fuel Project Analysis

File ini berisi rangkuman teknis tentang apa yang sudah diimplementasikan (existing), apa yang kurang/belum lengkap (gaps), analisis styling & visual, serta catatan penting lainnya mengenai arsitektur project E-Fuel.

---

## 1. Feature & Implementation Status

### 🟢 Sudah Diimplementasi (Existing)
*   **Authentication & Role Management**:
    *   Sistem registrasi & login lengkap menggunakan REST API.
    *   Tiga role utama: `customer`, `driver`, dan `admin`.
    *   Middleware JWT token-based authentication di backend.
    *   Penyimpanan token lokal aman dan state manager menggunakan Zustand (`store/useAuthStore`).
    *   Navigasi routing dinamis berdasarkan role user.
*   **Customer Fuel Ordering**:
    *   Pemilihan lokasi menggunakan Map (Leaflet untuk web).
    *   Pemilihan jenis kendaraan (Motor/Mobil) beserta info plat nomor.
    *   Pemilihan jenis bahan bakar (`IGNITE` / `BLAZE` / `QUANTUM` / `DIESEL`).
    *   Input jumlah liter beserta perhitungan total harga otomatis.
    *   Pemilihan metode pembayaran (Cash / E-Wallet / Virtual Account).
    *   Submission order ke backend.
*   **Order Tracking**:
    *   Tampilan Map tracking driver secara real-time.
    *   Timeline status pesanan (`pending`, `accepted`, `on_the_way`, `arrived`, `fueling`, `delivered`, `cancelled`).
    *   Sistem verifikasi menggunakan QR Code yang di-generate dari ID pesanan.
    *   Integrasi telepon driver & detail info driver.
*   **Driver Dashboard**:
    *   Status online/offline toggle.
    *   Daftar pesanan masuk yang berstatus `pending` (dapat diterima/ditolak).
    *   Progres status pesanan aktif dengan simulator pergerakan driver di Map.
*   **Admin Dashboard**:
    *   Statistik pendapatan (Revenue), total pesanan (Orders), dan total user.
    *   Manajemen harga BBM secara real-time.
    *   Daftar seluruh pesanan terbaru.

---

## 2. Gaps & Missing Features (Belum Lengkap)

### 🔴 Critical Gaps (Telah Diperbaiki untuk Demo)
1.  ~~**Hardcoded Hero Image Path** (`app/(onboarding)/index.tsx`)~~: ✅ *Telah diperbaiki dengan generate image lokal.*
2.  ~~**Product Cards Harga BBM Kosong** (`app/(onboarding)/index.tsx`)~~: ✅ *Telah diperbaiki dengan dummy state harga awal.*
3.  ~~**Dead Links di Navbar** (`components/ui/Navbar.tsx`)~~: ✅ *Telah diganti dengan routing ke `/` (Cara Kerja) dan `/(tabs)/explore` (Info BBM).*
4.  ~~**Dead Actions di Profile Menu** (`app/(tabs)/profile.tsx`)~~: ✅ *Telah diberi pop-up alert "Segera Hadir".*
5.  ~~**Cart & Notification Badge** (`components/ui/Navbar.tsx`)~~: ✅ *Badge `0` telah dihapus agar UI terlihat bersih.*

---

## 2.5 Catatan Eksekusi & Validasi Flow
- **End-to-End Demo Flow**: Flow pemesanan dari Customer -> Driver (Accept) -> Admin (Stats Update) **telah berhasil divalidasi** berjalan mulus via API testing.
- Backend API secara tegas memvalidasi input enum (`IGNITE`, lowercase `cash`), yang menuntut konsistensi pengiriman data dari frontend.
- Tidak ada fatal runtime error pada proses transpilasi Expo (Frontend) maupun Express (Backend).

### 🟡 Secondary Gaps (Telah Diperbaiki untuk Demo)
1.  ~~**Google OAuth Sign-In**~~: ✅ *Telah diberi disabled state dan alert "Segera Hadir".*
2.  ~~**Lupa Password**~~: ✅ *Telah diberi alert "Segera Hadir".*
3.  ~~**Onboarding CTA & Testimonials**~~: ✅ *Tombol "Lihat Cara Kerja" kini melakukan scroll. Testimonials menggunakan auto-generated avatars dari `ui-avatars.com`.*
4.  ~~**Admin Dashboard Polish**~~: ✅ *Dirombak total menjadi arsitektur multi-page dengan layout sidebar sesuai Figma (Dashboard, Kelola Order, Kelola Driver, Analytics, Settings).*
5.  ~~**Admin Dashboard Data Bugs**~~: ✅ *Diperbaiki: Badge kelola order dibuat dinamis. Status driver & performa dihitung *real-time* dari tabel order. Bar chart jenis BBM di *Analytics* menyesuaikan dengan transaksi nyata. Dobel navbar di-hilangkan.*
6.  ~~**Customer Landing & Order Flow**~~: ✅ *Landing page setelah login kini menampilkan hero section seperti publik. Flow pemesanan dan payment VA/QRIS telah disempurnakan lengkap dengan simulasi tombol "Saya Sudah Bayar" yang terintegrasi dengan state management dan backend existing. Lacak pesanan existing dipertahankan utuh.*
7.  ~~**Order Page Navbar Bug**~~: ✅ *Navbar marketing dihilangkan dari halaman form order (`/order`), simulasi bayar, dan map lacak pesanan. Form order kembali menggunakan header lama bawaan (title bar + back button).*
8.  ~~**Restore Customer Order Flow**~~: ✅ *Atas permintaan user, tampilan dan flow halaman pemesanan pelanggan (termasuk peta interaktif/MapPicker, rincian pesanan, dan navigasi) dikembalikan ke versi branch `jaga-jaga` sebelumnya.*

---

## 3. Styling, Font, dan Visual Design System

### 🎨 Color Palette & Themes
Warna didefinisikan secara tersentralisasi di [theme.ts](file:///Users/theofilius/e-fuel/frontend/constants/theme.ts) dan sudah sangat representatif terhadap brand E-Fuel di Figma:
*   `primary`: `#334E52` (Teal gelap sebagai identitas utama brand).
*   `accent`: `#00D4AA` (Hijau Neon untuk tombol CTA utama).
*   `background`: `#F8FAFC` (Latar belakang slate bersih).
*   **Fuel Product Colors**:
    *   `IGNITE`: `#14B8A6` (Teal)
    *   `BLAZE`: `#F43F5E` (Rose/Red)
    *   `QUANTUM`: `#8B5CF6` (Violet)
    *   `DIESEL`: `#854D0E` (Brown)

### 🅰️ Typography & Fonts
*   **Keadaan Saat Ini**: Font yang digunakan menggunakan font default sistem operasi (Sans-Serif bawaan platform).
*   **Perbandingan Figma**: Figma menggunakan font modern (seperti Inter atau Roboto) dengan weight bervariasi dari Light (300) hingga Extra Bold (800).
*   **Solusi**: Karena keterbatasan waktu demo (2 hari), system font default sangat memadai. Namun, jika ada sisa waktu, font `Inter` dapat di-load menggunakan `expo-font`.

### 📱 Layouting & Responsiveness
*   Aplikasi ini dibangun menggunakan Expo (React Native & React Native Web).
*   Deteksi ukuran layar digunakan untuk memisahkan layout mobile dan desktop (Web-first approach pada landing & auth pages, mobile-first pada order & tracking flows).
*   Shadows menggunakan setelan custom shadow properties (dengan paduan elevation untuk Android) agar tampilan card terlihat melayang (*floating card effect*) seperti desain premium di Figma.

---

## 4. Catatan Teknis & Arsitektur Project

### 📁 Struktur Folder Utama
*   **`backend/`**: Node.js & Express server yang berfungsi sebagai API server dan WebSocket server.
    *   Menggunakan MongoDB sebagai database (Mongoose ODM).
    *   Sudah mengimplementasi Socket.io untuk sinkronisasi koordinat real-time driver.
*   **`frontend/`**: Expo React Native project.
    *   Routing menggunakan **Expo Router** berbasis file-system.
    *   State management menggunakan **Zustand** (ringan, cepat, meminimalkan re-render).
    *   Peta interaktif menggunakan Leaflet API (`components/MapPicker.web.tsx` & `components/TrackingMap.web.tsx`) untuk platform web.

### ⚙️ Environment & Dependencies
*   **Node.js**: Versi modern (v18+ direkomendasikan).
*   **Expo**: SDK 54.
*   **React**: v19.1.0.
*   **React Native**: v0.81.5.
*   **Database**: Membutuhkan MongoDB local atau MongoDB Atlas. URI database dideklarasikan di `backend/.env`.

---

## 5. Rencana Pengujian Mandiri (Verification Plan)
Untuk memastikan tidak terjadi regresi ketika memperbaiki gap analysis di atas:
1.  **Frontend Build Integrity**: Jalankan `npm run web` di folder `frontend` untuk memverifikasi proses transpilasi web berjalan normal.
2.  **API Connection**: Pastikan backend terhubung ke database dan dapat mengembalikan daftar BBM beserta harga terupdate melalui endpoint `/api/fuels` (atau sejenisnya).
3.  **Role Redirects**: Lakukan pengujian login dengan tiga user yang berbeda:
    *   Customer Account: memverifikasi form order & tracking page.
    *   Driver Account: memverifikasi dashboard online & status progression.
    *   Admin Account: memverifikasi pengelolaan harga BBM.
