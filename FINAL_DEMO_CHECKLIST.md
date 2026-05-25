# FINAL DEMO CHECKLIST — E-Fuel Project

## Status Branch & Workspace
- [x] Berada di branch `jaga-jaga`.
- [x] Working tree dalam kondisi clean (semua changes tahap 3 telah di-commit).

## 1. Startup & Environment
- [x] Database lokal MongoDB berhasil start (`npm run db:local` atau service `mongod` aktif).
- [x] Backend API berhasil start di port `5001`.
- [x] Frontend Expo berhasil start di port `8081` (Web).
- [x] Seeding data demo berhasil (terdapat data Customer, Driver, Admin, dan orders awal).

## 2. Navigasi & Blank Pages
- [x] Halaman Onboarding (Landing Page) termuat sempurna tanpa error.
- [x] Halaman Auth (Login & Register) dapat diakses tanpa blank page.
- [x] Redirect role berjalan semestinya:
  - Customer -> `/(tabs)/explore` atau `/(tabs)/orders`
  - Driver -> `/(driver)`
  - Admin -> `/(admin)`

## 3. Demo Accounts & Role Flow
- [x] **Customer (Basic)**: `demo@efuel.com` / `demo123` — isPremium: false
- [x] **Customer (Premium)**: `premium@efuel.com` / `premium123` — isPremium: true, plan "3 Bulan"
- [x] **Driver**: `driver1@efuel.com` / `driver123`
- [x] **Admin**: `admin@efuel.com` / `admin123`

## 4. End-to-End Order Flow (API Validated)
- [x] Customer dapat membuat order BBM (pilihan IGNITE, dsb).
- [x] Order berhasil disimpan dan tercatat di backend dengan status `pending`.
- [x] Driver dapat melihat list order (Dashboard Driver).
- [x] Driver dapat menerima (Accept) order -> status berubah menjadi `accepted`.
- [x] Admin dapat melihat total revenue, jumlah active orders, dan status pesanan terbaru dari dashboard.

## 5. UI Polish & Navbar Interaction
- [x] **"Cara Kerja"** di navbar: Berfungsi melakukan auto-scroll ke bawah (Guide Section).
- [x] **"Info BBM"** di navbar: Berfungsi mengarahkan ke menu Explore.
- [x] Badge Cart/Notification: Badge dengan angka `0` telah dihilangkan untuk kesan bersih.

## 6. Disabled / Coming Soon Buttons (Aman untuk Demo)
Tombol-tombol berikut sudah diberi Alert pop-up ("Segera Hadir") atau state transparan/disabled agar user tidak menyangka aplikasi crash saat diklik:
- [x] Tombol "Masuk dengan Google" (Login)
- [x] Tombol "Daftar dengan Google" (Register)
- [x] Link "Lupa kata sandi?" (Login)
- [x] Tombol "Edit Profile" (Menu Profil)
- [x] Tombol "Payment Methods" (Menu Profil)
- [x] Tombol "Help & Support" (Menu Profil)

## 7. Responsiveness
- [x] Layout desktop (split panel pada Auth page) berjalan baik di browser.
- [x] Layout landing page aman pada viewport desktop.

## 8. External Visual Dependency (PENTING UNTUK DILAPORKAN)
- ⚠️ **Avatar Testimonial (Onboarding)**: Saat ini saya menggunakan API external `https://ui-avatars.com` untuk generate avatar inisial nama secara dinamis. 
  - **Risiko**: Jika saat presentasi demo tidak ada koneksi internet sama sekali, avatar ini akan gagal load (broken image link).
  - **Saran**: Jika presentasi akan sepenuhnya offline, sebaiknya avatar diganti dengan local icon (seperti sebelumnya) atau asset lokal. *Saya tidak mengubahnya saat ini menunggu konfirmasi Anda sesuai perintah "laporkan dulu sebelum mengubah".*

## 10. Premium Feature Checklist
- [x] Halaman `/premium` dapat diakses dari navbar (klik "Premium").
- [x] Hero, 5 paket, dan tabel benefit tampil sesuai Figma.
- [x] Klik "Beli Sekarang" → masuk `/premium/checkout` (harus login).
- [x] Checkout: pilih metode pembayaran, klik "Bayar Sekarang" → simulasi sukses.
- [x] Setelah bayar: user menjadi Premium di database & local state.
- [x] Order page Basic: tidak ada diskon premium, tidak ada "Gratis Ongkir".
- [x] Order page Premium: badge ⭐ PREMIUM, Diskon Rp300/L, Ongkir gratis jika ≥10L.
- [x] Login `premium@efuel.com` → langsung aktif Premium tanpa perlu upgrade.
- [x] Admin & Driver flow tidak terpengaruh.

## 11. Refund Full Integration Checklist (User ↔ Admin)
- [x] `POST /api/refunds` — buat refund (cegah duplikat; re-submit diizinkan setelah rejected).
- [x] `GET /api/refunds/my` — refund milik user.
- [x] `GET /api/admin/refunds` — semua refund + populate user/order/processedBy.
- [x] `PATCH /api/admin/refunds/:id` — approve/reject + set adminNote, processedBy, processedAt.
- [x] Model `RefundRequest` punya field `adminNote`, `processedBy`, `processedAt`.
- [x] Halaman `/refund/[orderId]` — form ajukan refund.
- [x] Halaman `/refund/success` — halaman sukses.
- [x] Pesanan Saya: badge kuning (pending) / hijau (approved) / merah (rejected) + catatan admin.
- [x] Pesanan Saya: tombol "Ajukan Ulang" untuk refund yang ditolak.
- [x] Admin sidebar: "Kelola Refund" + badge pending count, auto-refresh 15 detik.
- [x] Admin `/admin/refunds`: 4 summary cards, filter tabs, tabel, modal approve, modal reject+note.
- [x] Status update langsung di UI admin setelah approve/reject.
- [x] Customer lihat status terbaru setelah refresh Pesanan Saya.
- [x] Bell notifikasi Navbar menampilkan refund terbaru.
- [x] Admin & Driver flow tidak terpengaruh.
- [x] Premium flow tidak terpengaruh.

## 9. Known Issues (Aman untuk presentasi)
1. **Google OAuth & Lupa Password**: Flow belum selesai di backend, sudah di-handle dengan alert pop-up informatif. Hindari mengklik ini saat presentasi utama kecuali ditanya juri/penguji.
2. **Avatar Online**: Membutuhkan internet untuk meload inisial avatar dari `ui-avatars.com`.
3. **Cart Flow**: E-Fuel di-desain direct checkout (langsung pesan BBM via map). Cart ditiadakan untuk demo ini untuk menyederhanakan flow.
