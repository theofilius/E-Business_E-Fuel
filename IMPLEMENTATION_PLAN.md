# Implementasi Admin Dashboard Sesuai Figma

Memperbarui arsitektur routing dan desain UI/UX pada fitur Dashboard Admin agar menyerupai Figma Prototype yang dilampirkan (Frame 3084 - 3088). Tujuannya untuk memberikan *experience* yang mulus dan clean sesuai standar demo, tanpa mengganggu existing code dari flow Customer maupun Driver.

## User Review Required

> [!IMPORTANT]
> Mengubah struktur folder di `app/(admin)/` yang saat ini hanya berupa 1 halaman (`index.tsx`), menjadi Layout khusus (`_layout.tsx`) dengan nested routing untuk Sidebar Menu (Dashboard, Orders, Drivers, Analytics, Settings). 
> Saya juga akan menambahkan Endpoint API `GET /api/admin/drivers` kecil di sisi Backend (hanya membaca tabel `User` dengan role `driver`) agar menu Kelola Driver bisa menggunakan data nyata tanpa harus mock. Apakah ini diizinkan? Jika tidak, saya akan murni mock data driver di frontend.

## Proposed Changes

---

### Backend (Admin Controllers)

Penambahan kecil *non-breaking* untuk mensupport halaman "Kelola Driver".

#### [MODIFY] [adminController.js](file:///Users/theofilius/e-fuel/backend/src/controllers/adminController.js)
- Menambahkan fungsi `getAllDrivers` yang melakukan query ke MongoDB (`User.find({ role: 'driver' })`) untuk mengambil list driver, rating (mock default jika tidak ada), dan status (dapat difilter dari state active order).

#### [MODIFY] [adminRoutes.js](file:///Users/theofilius/e-fuel/backend/src/routes/adminRoutes.js)
- Me-register route `GET /drivers` ke controller `getAllDrivers`.

---

### Frontend (Admin Dashboard System)

Melakukan refactor pada struktur route `app/(admin)` menjadi stack/sidebar-based navigation dan membuat UI komponen baru.

#### [MODIFY] [_layout.tsx](file:///Users/theofilius/e-fuel/frontend/app/(admin)/_layout.tsx)
- Diubah menggunakan struktur custom layout (Sidebar dan Content Wrapper) dibandingkan `Stack` biasa.
- Mengimplementasikan layout global:
  - Sidebar tetap (fixed left)
  - Logo E-Fuel Admin
  - Daftar menu sidebar navigasi: Dashboard, Kelola Order, Kelola Driver, Laporan & Analitik, Pengaturan Cabang.
  - Header atas dengan profil & ikon lonceng notifikasi.

#### [MODIFY] [index.tsx](file:///Users/theofilius/e-fuel/frontend/app/(admin)/index.tsx)
- Route ini akan menjadi **"Halaman 1 — Dashboard / Overview Hari Ini"**.
- Menampilkan *Stat Cards*: Order Masuk, Sedang Diantar, Revenue, Rating.
- Menampilkan Order Terbaru (maks. 5) dan Status Driver (Top 5).

#### [NEW] [orders.tsx](file:///Users/theofilius/e-fuel/frontend/app/(admin)/orders.tsx)
- Route **"Halaman 2 — Kelola Order"**.
- Menggunakan endpoint `/api/admin/orders`.
- Menambahkan Filter Tab UI (Semua, Baru, Diantar, Selesai, Batal) yang memanipulasi *state filtering* di frontend secara langsung (karena data API sudah tersedia/paginated).
- Menampilkan Tabel Order dengan Badge/Pill custom sesuai Figma.

#### [NEW] [drivers.tsx](file:///Users/theofilius/e-fuel/frontend/app/(admin)/drivers.tsx)
- Route **"Halaman 3 — Kelola Driver"**.
- Menampilkan grid kartu driver.
- Menggunakan inisial avatar dari lokal / `ui-avatars.com` (tergantung internet).
- Menampilkan Info: Kendaraan, Status (Sibuk/Aktif/Offline), Rating, Total Order.
- Tombol aksi "Profil" dan "Nonaktif" dengan `Alert` Segera Hadir (Aman untuk demo).

#### [NEW] [analytics.tsx](file:///Users/theofilius/e-fuel/frontend/app/(admin)/analytics.tsx)
- Route **"Halaman 4 — Laporan & Analitik"**.
- Stat blocks untuk: Revenue minggu ini, BBM Terlaris, Total order, dsb (dihitung dari frontend order data / stats backend).
- Membuat "Grafik / Bar" order BBM secara custom menggunakan `View` dan `Width %` agar menghindari dependency tambahan chart library.
- Menampilkan tabel Performa Driver Bulanan (mockup safe).

#### [NEW] [settings.tsx](file:///Users/theofilius/e-fuel/frontend/app/(admin)/settings.tsx)
- Route **"Halaman 5 — Pengaturan Cabang"**.
- Memindahkan form "Kelola Harga BBM" dari `index.tsx` yang lama ke sini, digabung dengan Info Cabang.
- Info Cabang dapat dibuat `disabled` form (Demo safe) yang berisi Nama Cabang, Jam Operasional, Maks Radius Pengiriman, Area Layanan.

---

## Verification Plan

### Automated / API Tests
- Mengakses masing-masing `/api/admin/orders`, `/api/admin/stats`, dan `/api/admin/drivers` untuk memvalidasi respon data (bebas *Internal Server Error*).

### Manual Verification
1. Login dengan kredensial `admin@efuel.com` / `admin123`.
2. Verifikasi UI layout apakah *Sidebar* statis tertancap di sisi kiri (Web).
3. Klik tiap-tiap menu dan verifikasi *active state* berubah serta memuat halaman yang sesuai secara instan (karena arsitektur Expo Router web).
4. Pastikan flow Order oleh *Customer -> Driver* tidak terdampak dan perubahan statusnya tercermin *real-time* (saat re-fetch) di halaman Kelola Order Admin.
