# PRIORITY TODO — E-Fuel Final Project

> Deadline: 25 Mei 2026 (2 hari)  
> Fokus: Demo end-to-end yang polished untuk semua 3 role (Customer, Driver, Admin)

---

## 🔴 MUST HAVE (Hari 1 — Wajib selesai untuk demo)

### 1. Fix Hero Image Onboarding
- [ ] **File**: `app/(onboarding)/index.tsx` (line 11)
- **Problem**: `HERO_IMAGE` path hardcoded ke file dari conversation lain yang mungkin tidak ada
- **Action**: Generate image baru atau gunakan gradient/solid color fallback
- **Impact**: Landing page adalah first impression — harus terlihat baik
- ⏱️ **30 menit**

### 2. Fix Product Cards di Onboarding (Harga)
- [ ] **File**: `app/(onboarding)/index.tsx` (line 112)
- **Problem**: Product card menampilkan "Rp /Liter" tanpa angka harga
- **Action**: Hardcode harga demo atau fetch dari API
- **Impact**: Produk terlihat tidak professional tanpa harga
- ⏱️ **20 menit**

### 3. Fix Navbar Dead Links
- [ ] **File**: `components/ui/Navbar.tsx` (line 76-84)
- **Problem**: "Cara Kerja", "Area Layanan", "FAQs" tidak navigasi ke mana-mana
- **Action**: 
  - Arahkan "Cara Kerja" ke scroll di onboarding page
  - Hide atau disable link yang belum ada halaman
  - Atau ganti jadi anchor link ke section
- **Impact**: Navbar adalah navigasi utama web — dead links = UX jelek
- ⏱️ **45 menit**

### 4. Fix Cart & Notification Badge di Navbar
- [ ] **File**: `components/ui/Navbar.tsx` (line 91-102)
- **Problem**: Badge selalu menampilkan "0", cart tidak relevan untuk fuel delivery
- **Action**: Sembunyikan cart icon atau ganti jadi icon yang relevan; sembunyikan notification badge
- **Impact**: Badge "0" terlihat placeholder
- ⏱️ **15 menit**

### 5. Fix Profile Menu Items
- [ ] **File**: `app/(tabs)/profile.tsx` (line 33-51)
- **Problem**: "Edit Profile", "Payment Methods", "Help & Support" tidak bisa diklik
- **Action**: 
  - Tambahkan `onPress` handler minimal (misal toast "Coming Soon")
  - Atau buat disabled state visual
- **Impact**: User bisa confused kalau klik dan tidak terjadi apa-apa
- ⏱️ **20 menit**

### 6. Pastikan Database + Backend Running
- [ ] **Action**: 
  - Test `npm run seed` berhasil
  - Test `npm run dev` — backend + frontend berjalan
  - Login dengan demo account (`demo@efuel.com` / `demo123`)
- **Impact**: Demo GAGAL TOTAL kalau backend mati
- ⏱️ **30 menit**

### 7. Test End-to-End Flow: Customer
- [ ] **Action**: 
  - Register akun baru
  - Order bensin (semua step)
  - Bayar (e-wallet / VA)
  - Lihat tracking page
  - Lihat order list
- **Impact**: Flow utama harus 100% lancar
- ⏱️ **30 menit**

### 8. Test End-to-End Flow: Driver
- [ ] **Action**: 
  - Login sebagai driver
  - Toggle online
  - Terima order
  - Update status: accepted → on_the_way → arrived → fueling → delivered
  - Test simulasi lokasi
- **Impact**: Driver flow harus demo-able
- ⏱️ **20 menit**

### 9. Test End-to-End Flow: Admin
- [ ] **Action**: 
  - Login sebagai admin
  - Lihat stats dashboard
  - Edit harga BBM
  - Lihat pesanan terbaru
- **Impact**: Admin flow harus demo-able
- ⏱️ **15 menit**

---

## 🟡 SHOULD HAVE (Hari 2 — Sangat disarankan sebelum demo)

### 10. Polish Onboarding "Lihat Cara Kerja" Button
- [ ] **File**: `app/(onboarding)/index.tsx` (line 61-63)
- **Problem**: Button outline "Lihat Cara Kerja" tidak memiliki onPress
- **Action**: Scroll ke guide section saat diklik
- ⏱️ **15 menit**

### 11. Make Explore Tab Accessible
- [ ] **File**: `components/ui/Navbar.tsx`
- **Problem**: Explore page exists tapi tidak ada link di navbar
- **Action**: Tambahkan link "Explore" atau "Info BBM" di navbar
- ⏱️ **10 menit**

### 12. Polish Auth Pages — Google Button
- [ ] **File**: `app/(auth)/login.tsx`, `app/(auth)/register.tsx`
- **Problem**: Google login/register button ada tapi non-functional
- **Action**: Tambahkan disabled state + "Segera Hadir" label, atau sembunyikan
- ⏱️ **15 menit**

### 13. Polish Auth Pages — Forgot Password
- [ ] **File**: `app/(auth)/login.tsx` (line 94-96)
- **Problem**: "Lupa kata sandi?" button tidak navigasi
- **Action**: Tambah toast/alert "Fitur sedang dalam pengembangan"
- ⏱️ **10 menit**

### 14. Admin Dashboard Visual Polish
- [ ] **File**: `app/(admin)/index.tsx`
- **Problem**: Stats cards bisa lebih visual, typography bisa lebih premium
- **Action**: Tambah subtle visual enhancements (gradient, icon styling)
- ⏱️ **30 menit**

### 15. Onboarding Page — Testimonial Avatars
- [ ] **File**: `app/(onboarding)/index.tsx` (line 130)
- **Problem**: Testimonial avatar masih placeholder icon
- **Action**: Generate atau gunakan placeholder avatar images
- ⏱️ **20 menit**

### 16. Demo Data Preparation
- [ ] **Action**:
  - Seed data lengkap: 1 customer, 1 driver, 1 admin
  - Buat beberapa orders dengan berbagai status
  - Siapkan script seed yang comprehensive
- ⏱️ **30 menit**

---

## 🟢 NICE TO HAVE (Jika masih ada waktu)

### 17. Add Loading/Splash Screen Polish
- [ ] **Problem**: Splash screen masih default Expo
- **Action**: Custom splash screen dengan E-FUEL branding
- ⏱️ **30 menit**

### 18. Font Loading (Inter/Roboto)
- [ ] **Problem**: Menggunakan system font, bisa beda dengan Figma
- **Action**: Load Inter via `expo-font` untuk match Figma
- ⏱️ **30 menit**

### 19. Micro-Animations pada Cards
- [ ] **Problem**: Cards statis, kurang "alive"
- **Action**: Tambah fade-in animation saat scroll (sudah ada di Explore, extend ke halaman lain)
- ⏱️ **30 menit**

### 20. FAQ Page Sederhana
- [ ] **Action**: Buat halaman FAQ statis dengan accordion
- ⏱️ **1 jam**

### 21. Footer Links pada Onboarding
- [ ] **File**: `app/(onboarding)/index.tsx` (line 148-152)
- **Action**: Arahkan ke anchor sections atau halaman jika ada
- ⏱️ **15 menit**

### 22. Responsive Testing — Mobile Web
- [ ] **Action**: Test pada viewport kecil, pastikan layout tidak pecah
- ⏱️ **30 menit**

### 23. Dark Mode Support
- [ ] **Action**: SKIP — tidak prioritas untuk demo 2 hari
- ⏱️ **3+ jam**

---

## 📊 Ringkasan Estimasi Waktu

| Priority | Tasks | Total Estimasi |
|----------|-------|---------------|
| 🔴 MUST HAVE | 9 tasks | **~3.5 jam** |
| 🟡 SHOULD HAVE | 7 tasks | **~2 jam** |
| 🟢 NICE TO HAVE | 7 tasks | **~4 jam** |
| **TOTAL** | **23 tasks** | **~9.5 jam** |

> [!TIP]
> Dengan 2 hari = ~16 jam kerja efektif, ada cukup waktu untuk menyelesaikan semua MUST HAVE + SHOULD HAVE, dan beberapa NICE TO HAVE. Fokuskan Hari 1 pada MUST HAVE, Hari 2 pada SHOULD HAVE + testing.

---

## 🎯 Demo Checklist

Sebelum demo, pastikan:

- [ ] `npm run seed` berhasil
- [ ] `npm run dev` menjalankan backend + frontend
- [ ] Browser bisa akses `http://localhost:8081`
- [ ] Customer flow: Register → Order → Pay → Track → Selesai
- [ ] Driver flow: Login → Online → Accept → Status Updates → Delivered
- [ ] Admin flow: Login → Dashboard → Edit Harga
- [ ] Onboarding page terlihat professional (hero, produk, testimonial)
- [ ] Navbar berfungsi dengan baik (no dead links)
- [ ] Profile page tidak ada menu item yang stuck
- [ ] Tidak ada console errors yang terlihat
