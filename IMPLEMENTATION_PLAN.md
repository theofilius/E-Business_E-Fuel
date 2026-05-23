# IMPLEMENTATION PLAN — E-Fuel Final Project

> Deadline: 2 hari (25 Mei 2026)  
> Strategi: Incremental improvement, TIDAK rewrite dari nol  
> Fokus: Demo end-to-end yang polished

---

## 1. Mapping Figma Page → React Route

| Figma Page | Route | File | Status |
|-----------|-------|------|--------|
| Onboarding/Landing | `/(onboarding)` | `app/(onboarding)/index.tsx` | ✅ Sudah ada |
| Login | `/(auth)/login` | `app/(auth)/login.tsx` | ✅ Sudah ada |
| Register | `/(auth)/register` | `app/(auth)/register.tsx` | ✅ Sudah ada |
| Home / Pesan Bensin | `/(tabs)/` | `app/(tabs)/index.tsx` | ✅ Sudah ada |
| Explore | `/(tabs)/explore` | `app/(tabs)/explore.tsx` | ✅ Sudah ada |
| Pesanan Saya | `/(tabs)/orders` | `app/(tabs)/orders.tsx` | ✅ Sudah ada |
| Profile | `/(tabs)/profile` | `app/(tabs)/profile.tsx` | ✅ Sudah ada |
| Order Tracking | `/order/[id]` | `app/order/[id].tsx` | ✅ Sudah ada |
| Payment | `/order/payment` | `app/order/payment.tsx` | ✅ Sudah ada |
| Driver Dashboard | `/(driver)` | `app/(driver)/index.tsx` | ✅ Sudah ada |
| Admin Dashboard | `/(admin)` | `app/(admin)/index.tsx` | ✅ Sudah ada |

> [!IMPORTANT]
> Semua routes utama sudah ada. Tidak perlu membuat route baru.

---

## 2. Mapping Figma Component → React Component

| Figma Component | React Component | File | Status |
|----------------|----------------|------|--------|
| Button (Primary/Outline) | `<Button>` | `components/ui/Button.tsx` | ✅ Ada |
| Text Input | `<Input>` | `components/ui/Input.tsx` | ✅ Ada |
| Card Container | `<Card>` | `components/ui/Card.tsx` | ✅ Ada |
| Status Badge | `<Badge>` | `components/ui/Badge.tsx` | ✅ Ada |
| Top Navigation Bar | `<Navbar>` | `components/ui/Navbar.tsx` | ✅ Ada |
| Map Picker (Leaflet) | `<MapPicker>` | `components/MapPicker.web.tsx` | ✅ Ada |
| Tracking Map | `<TrackingMap>` | `components/TrackingMap.web.tsx` | ✅ Ada |
| Themed Text | `<ThemedText>` | `components/themed-text.tsx` | ✅ Ada |
| Themed View | `<ThemedView>` | `components/themed-view.tsx` | ✅ Ada |
| Collapsible | `<Collapsible>` | `components/ui/collapsible.tsx` | ✅ Ada |

---

## 3. File Existing yang Sudah Sesuai

### ✅ Tidak Perlu Diubah (atau perubahan minimal)
| File | Alasan |
|------|--------|
| `constants/theme.ts` | Design tokens lengkap, match Figma colors |
| `types/index.ts` | Type definitions lengkap (User, Order, FuelProduct, etc.) |
| `store/useAuthStore.ts` | Auth state management lengkap |
| `store/useOrderStore.ts` | Order state management lengkap |
| `store/useDriverStore.ts` | Driver state management lengkap |
| `services/api.ts` | API client configured |
| `services/authService.ts` | Auth API calls |
| `services/orderService.ts` | Order API calls |
| `services/paymentService.ts` | Payment API calls |
| `services/socket.ts` | Socket.io client |
| `utils/geocode.ts` | Reverse geocoding utility |
| `utils/storage.ts` | Storage abstraction |
| `app/_layout.tsx` | Root layout + role-based routing |
| `app/index.tsx` | Root redirect logic |
| `app/(auth)/_layout.tsx` | Auth layout |
| `app/(tabs)/_layout.tsx` | Tabs layout |
| `app/(driver)/_layout.tsx` | Driver layout |
| `app/(admin)/_layout.tsx` | Admin layout |
| Backend: semua files di `backend/src/` | Backend sudah complete |

---

## 4. File yang Perlu Diedit (Perbaikan Visual/Fungsional)

### Priority 1 — Critical untuk Demo

#### [EDIT] `app/(onboarding)/index.tsx`
- **Masalah**: Hero image path hardcoded ke path dari conversation lain, mungkin tidak ada
- **Solusi**: Ganti dengan gambar yang tersedia atau generate baru, atau gunakan gradient/solid color sebagai fallback
- **Estimasi**: 30 menit

#### [EDIT] `components/ui/Navbar.tsx`
- **Masalah**: Nav links "Cara Kerja", "Area Layanan", "FAQs" tidak navigasi, cart/notif badge hardcoded "0"
- **Solusi**: 
  - Scroll ke section di onboarding page untuk "Cara Kerja"
  - Sembunyikan link yang belum ada halaman, atau arahkan ke anchor
  - Sembunyikan cart badge (tidak relevan untuk fuel delivery)
- **Estimasi**: 45 menit

#### [EDIT] `app/(tabs)/profile.tsx`
- **Masalah**: Menu items "Edit Profile", "Payment Methods", "Help & Support" belum navigasi
- **Solusi**: Minimal buat placeholder screens, atau jadikan non-clickable dengan "Coming Soon" label
- **Estimasi**: 30 menit

#### [EDIT] `app/(tabs)/index.tsx` (Home)
- **Masalah**: Explore tab terdaftar tapi tersembunyi dari navigasi web
- **Solusi**: Pastikan accessible dari navbar atau tambahkan di tab layout web
- **Estimasi**: 15 menit

### Priority 2 — Visual Polish

#### [EDIT] Multiple files — Font consistency
- **Masalah**: Tidak ada Google Font (Inter/Roboto) yang di-load
- **Solusi**: Tambah `expo-font` loading untuk Inter atau system font declaration
- **Estimasi**: 30 menit

#### [EDIT] `app/(onboarding)/index.tsx`
- **Masalah**: Product cards menampilkan "Rp /Liter" tanpa harga actual
- **Solusi**: Fetch harga dari API atau hardcode harga demo
- **Estimasi**: 20 menit

#### [EDIT] `app/(admin)/index.tsx`
- **Masalah**: Admin dashboard agak basic, beberapa styling bisa dipoles
- **Solusi**: Perbaiki layout stats cards, tambah border visual
- **Estimasi**: 30 menit

### Priority 3 — Nice to Have

#### [NEW] `app/(tabs)/faq.tsx` (Opsional)
- Halaman FAQ sederhana
- **Estimasi**: 1 jam

#### [EDIT] `app/(auth)/login.tsx`
- Google login button bisa di-hide atau diberi "Coming Soon" toast
- **Estimasi**: 15 menit

---

## 5. File yang TIDAK Perlu Dibuat

> [!WARNING]
> Jangan buang waktu untuk fitur berikut — bukan prioritas demo:

- ❌ Halaman "Tentang Kami" terpisah
- ❌ Halaman "Area Layanan" dengan peta
- ❌ Notification system
- ❌ Google OAuth integration
- ❌ Forgot password flow
- ❌ Rating/review system
- ❌ Order receipt/invoice PDF
- ❌ Push notification
- ❌ Chat driver-customer

---

## 6. Strategi Implementasi (Tanpa Rewrite)

### Prinsip Utama
1. **Preserve existing code** — Semua fitur yang sudah jalan TETAP dijaga
2. **Incremental edits** — Hanya edit bagian spesifik yang perlu diperbaiki
3. **No new dependencies** kecuali benar-benar diperlukan
4. **Test after each change** — Pastikan app masih berjalan setelah setiap perubahan

### Timeline Implementasi

#### Hari 1 (23-24 Mei) — Fix Critical Issues
| # | Task | Estimasi | File |
|---|------|----------|------|
| 1 | Fix hero image onboarding | 30 min | `(onboarding)/index.tsx` |
| 2 | Fix navbar dead links | 45 min | `Navbar.tsx` |
| 3 | Fix product cards pricing | 20 min | `(onboarding)/index.tsx` |
| 4 | Fix profile menu items | 30 min | `profile.tsx` |
| 5 | Ensure Explore accessible | 15 min | `(tabs)/_layout.tsx`, `Navbar.tsx` |
| 6 | Test all flows end-to-end | 1 hr | - |

#### Hari 2 (24-25 Mei) — Visual Polish & Demo Prep
| # | Task | Estimasi | File |
|---|------|----------|------|
| 7 | Font loading (optional) | 30 min | `_layout.tsx` |
| 8 | Admin dashboard polish | 30 min | `(admin)/index.tsx` |
| 9 | Clean up google/forgot password buttons | 15 min | `login.tsx`, `register.tsx` |
| 10 | Final test all 3 roles | 1 hr | - |
| 11 | Seed demo data | 15 min | `npm run seed` |
| 12 | Demo rehearsal | 30 min | - |

---

## 7. Arsitektur yang TETAP Dipertahankan

```
e-fuel/
├── backend/                    ← JANGAN UBAH
│   └── src/
│       ├── controllers/        (5 controllers)
│       ├── models/             (3 models: User, Order, Driver)
│       ├── routes/             (5 route files)
│       ├── middleware/
│       └── server.js
│
├── frontend/                   ← EDIT INCREMENTAL SAJA
│   ├── app/
│   │   ├── (onboarding)/       ← Edit visual
│   │   ├── (auth)/             ← Minor cleanup
│   │   ├── (tabs)/             ← Fix explore, profile
│   │   ├── (driver)/           ← Sudah OK
│   │   ├── (admin)/            ← Minor polish
│   │   └── order/              ← Sudah OK
│   ├── components/
│   │   ├── ui/                 ← Edit Navbar
│   │   ├── MapPicker.*         ← Sudah OK
│   │   └── TrackingMap.*       ← Sudah OK
│   ├── constants/theme.ts      ← JANGAN UBAH
│   ├── store/                  ← JANGAN UBAH
│   ├── services/               ← JANGAN UBAH
│   ├── types/                  ← JANGAN UBAH
│   └── utils/                  ← JANGAN UBAH
│
└── package.json                ← JANGAN UBAH
```

---

## 8. Risiko & Mitigasi

| Risiko | Impact | Mitigasi |
|--------|--------|----------|
| Hero image tidak ada | Onboarding jelek | Generate image baru atau pakai gradient |
| Backend down saat demo | Demo gagal total | Pastikan seed data + backend running |
| MongoDB connection issue | Tidak bisa login/order | Gunakan MongoDB Atlas, test sebelum demo |
| Leaflet map tidak load | Map picker & tracking rusak | Map sudah pakai OpenStreetMap gratis, harusnya OK |
| Font tidak match Figma | Visual kurang polish | Gunakan system font, acceptable untuk demo |
