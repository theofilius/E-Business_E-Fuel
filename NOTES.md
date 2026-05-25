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

### 🟢 Premium Subscription (Baru — Ditambahkan Day 4, Bug Fix Day 5)
1.  ✅ **Halaman `/premium`**: Hero section dengan gradient, 5 paket (1 Minggu–1 Tahun), tabel benefit Basic vs Premium.
2.  ✅ **Halaman `/premium/checkout`**: Card checkout di tengah, 4 metode pembayaran (QRIS, GoPay, DANA, VA). "Bayar Sekarang" hanya **navigasi** ke `/premium/payment` — premium belum aktif di sini.
3.  ✅ **Halaman `/premium/payment`** *(baru, Day 5)*: Simulasi pembayaran per metode:
    *   **QRIS**: QR placeholder besar + countdown 5 menit + instruksi scan.
    *   **Virtual Account**: Pilih bank (BCA/BNI/Mandiri), nomor VA dummy, tombol "Salin", instruksi transfer.
    *   **GoPay/DANA**: Icon wallet + 5 langkah instruksi pembayaran.
    *   Tombol **"Saya Sudah Bayar"** adalah SATU-SATUNYA titik yang memanggil `PUT /api/auth/premium`.
4.  ✅ **Backend endpoint `PUT /api/auth/premium`**: Update `isPremium`, `premiumPlan`, `premiumUntil` ke database MongoDB via JWT-protected route.
5.  ✅ **User Model extended**: Tambah `isPremium` (Boolean, default false), `premiumPlan` (String), `premiumUntil` (Date).
6.  ✅ **Demo accounts**: `demo@efuel.com` (Basic), `premium@efuel.com / premium123` (Premium aktif 3 Bulan).
7.  ✅ **Order Summary Logic**: Basic = tidak ada diskon premium. Premium = diskon Rp300/L + ongkir gratis jika ≥10L.
8.  ✅ **Register selalu Basic** *(fix Day 5)*: Backend register controller mengembalikan `isPremium: false` secara eksplisit. Frontend `signUp` di `useAuthStore` meng-override premium fields ke `false` secara defensif — tidak ada stale state yang bisa terbawa.

### 🟢 Refund User ↔ Admin Integration (Diperbarui Day 6+)
1.  ✅ **Model `RefundRequest`** (updated): Tambah `adminNote`, `processedBy` (ref User), `processedAt`. Status enum: `pending | approved | rejected | processed`. Index unique per `orderId`.
2.  ✅ **Controller `refundController.js`** (updated): `createRefund`, `getMyRefunds`, `getAllRefunds`, **`processRefund`** (admin PATCH — approve/reject + set adminNote/processedBy/processedAt).
3.  ✅ **Routes**: `POST /api/refunds`, `GET /api/refunds/my`, `GET /api/admin/refunds`, **`PATCH /api/admin/refunds/:id`**.
4.  ✅ **Re-submit setelah rejected**: Backend hapus record lama jika status `rejected`, user bisa ajukan ulang.
5.  ✅ **Admin Sidebar**: "Kelola Refund" dengan badge merah jumlah pending, auto-refresh setiap 15 detik.
6.  ✅ **Halaman Admin `/admin/refunds`**: 4 summary cards, filter tabs (Semua/Pending/Disetujui/Ditolak), tabel 9 kolom, modal Approve, modal Reject + adminNote field, update UI optimistis.
4.  ✅ **Halaman `/refund/[orderId]`**: Form ajukan refund — summary order (biru muda), dropdown 4 alasan, info box kontekstual per alasan, textarea, modal konfirmasi dua tombol (Batal/Kirim).
5.  ✅ **Halaman `/refund/success`**: Success page dengan icon centang hijau, deskripsi, status pill "Menunggu Proses", tombol kembali ke Pesanan Saya.
6.  ✅ **Integrasi Pesanan Saya**: Tombol "Ajukan Refund" muncul di order card untuk order `delivered`/`cancelled` + `paymentStatus: paid`. Jika refund sudah ada, tampilkan badge status refund.
7.  ✅ **Notification Bell Navbar**: Bell menampilkan badge merah (count refund), dropdown notifikasi menampilkan daftar refund dengan status berwarna (warning/success/error), link ke Pesanan Saya.
8.  ✅ **Store `useRefundStore`**: `fetchMyRefunds`, `submitRefund`, `getRefundByOrderId`.
9.  ✅ **Type `RefundRequest`**: Ditambah di `frontend/types/index.ts`.
10. ✅ **Refund tidak mengembalikan uang** — murni demo workflow CS.

---

### 🟢 Stabilization Phase (Day 7 — Bugfix & Completion)

#### A. Chat Image Upload Fix
- `chatService.ts` `uploadImage`: platform-aware FormData — web converts data-URI to Blob via `fetch()`, native pakai `{uri,name,type}`.
- `app/chat/[orderId].tsx`: skip `requestMediaLibraryPermissionsAsync` on web (not needed).
- `app.json`: tambah plugin `expo-image-picker` dengan `photosPermission`.

#### B. Driver Chat Access Fix
- `app/_layout.tsx`: guard `isDriver && !inDriverGroup` sekarang menambahkan `&& !inOrderRoute` — driver tidak lagi di-redirect saat membuka `/chat/[orderId]` atau `/order/[id]`.

#### C. Role-Specific Navbar Notifications
- `notifCount` di `Navbar.tsx` sekarang `0` untuk driver dan admin (tidak pakai `refunds.length`).
- Dropdown konten berbeda per role: driver lihat pesan "notifikasi ada di dashboard driver", admin lihat "kelola di admin dashboard", customer lihat daftar refund seperti sebelumnya.
- `useRefundStore`: tambah action `clearRefunds()`.
- `useAuthStore.signOut()`: memanggil `useRefundStore.getState().clearRefunds()` untuk membersihkan state refund saat logout sehingga driver yang login berikutnya tidak melihat data refund customer sebelumnya.

#### D. Driver Rating System
- `backend/src/models/Order.js`: tambah `rating` (Number 1–5), `ratingComment` (String), `ratedAt` (Date).
- `backend/src/models/User.js`: tambah `ratingCount` (Number, default 0), `defaultPaymentMethod` (String enum).
- `backend/src/controllers/orderController.js`: tambah `rateOrder` — validasi ownership, status delivered, mencegah duplicate, recalculate driver rating average ((oldAvg × oldCount + newRating) / newCount).
- `backend/src/routes/orderRoutes.js`: `POST /:id/rating` dengan body validation.
- `frontend/app/(tabs)/orders.tsx`: rating modal dengan StarRow component, input komentar, submit via `api.post`. Tombol "⭐ Beri Rating Driver" muncul untuk order `delivered` yang belum dirating. Setelah rating, tampil badge bintang.
- `frontend/app/(driver)/index.tsx`: subtitle header menampilkan `rating.toFixed(1) (count)` dari user store.
- `frontend/app/(admin)/drivers.tsx`: tampilkan `ratingDisplay` real dari database (bukan mock "4.8").
- `frontend/types/index.ts`: tambah `rating`, `ratingComment`, `ratedAt` ke `Order`; `ratingCount`, `defaultPaymentMethod` ke `User`.

#### E. Profile: Metode Pembayaran
- `backend/src/models/User.js`: field `defaultPaymentMethod` (String enum, nullable).
- `backend/src/controllers/authController.js`: `updateProfile` handle `defaultPaymentMethod`. Login response include `defaultPaymentMethod`, `ratingCount`.
- `frontend/app/profile/payment-methods.tsx` *(baru)*: 9 metode pembayaran (QRIS, GoPay, DANA, OVO, ShopeePay, BCA/BNI/Mandiri VA, Cash). Selected state, save via `updateProfile`, success banner.
- `frontend/app/(tabs)/profile.tsx`: menu "Metode Pembayaran" navigasi ke `/profile/payment-methods`.
- `frontend/app/_layout.tsx`: register `profile/payment-methods`.

#### F. Profile: Bantuan & Dukungan
- `frontend/app/profile/help.tsx` *(baru)*: CS contact card (WhatsApp/Email/Phone), 6 FAQ accordion, form pesan (subject + message + charCount) dengan demo-mode submit (1 detik delay, sukses page).
- `frontend/app/(tabs)/profile.tsx`: menu "Bantuan & Dukungan" navigasi ke `/profile/help`.
- `frontend/app/_layout.tsx`: register `profile/help`.

---

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
