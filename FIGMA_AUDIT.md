# FIGMA AUDIT — E-Fuel Mobile Fuel Delivery App

> Audit Date: 2026-05-23  
> Figma File: [E-Fuel Design](https://www.figma.com/design/NKRXZRBUy5OafPy1hLfSra/E-Fuel?node-id=0-1&m=dev)  
> Figma Prototype: [E-Fuel Prototype](https://www.figma.com/proto/NKRXZRBUy5OafPy1hLfSra/E-Fuel?node-id=0-1)

---

## 1. Pages/Frames yang Teridentifikasi dari Figma

> [!NOTE]
> Figma file berjudul "E-Fuel", dibuat 06 Maret 2026, terakhir dimodifikasi 20 Mei 2026.  
> Konten Figma yang dinamis tidak bisa di-scrape langsung, sehingga analisis ini berdasarkan:
> 1. Metadata Figma (OG tags, editing_file JSON)
> 2. Kode existing yang sudah mengimplementasi desain Figma
> 3. Referensi warna, komponen, dan layout dari `constants/theme.ts`

### Halaman-halaman yang teridentifikasi dari implementasi:

| # | Page/Frame Figma | Route Existing | Status |
|---|-----------------|---------------|--------|
| 1 | **Onboarding / Landing Page** | `/(onboarding)` | ✅ Diimplementasi |
| 2 | **Login** | `/(auth)/login` | ✅ Diimplementasi |
| 3 | **Register** | `/(auth)/register` | ✅ Diimplementasi |
| 4 | **Home / Pesan Bensin** | `/(tabs)/index` | ✅ Diimplementasi |
| 5 | **Explore / Info BBM** | `/(tabs)/explore` | ✅ Diimplementasi |
| 6 | **Pesanan Saya (Orders List)** | `/(tabs)/orders` | ✅ Diimplementasi |
| 7 | **Profile** | `/(tabs)/profile` | ✅ Diimplementasi |
| 8 | **Order Tracking / Detail** | `/order/[id]` | ✅ Diimplementasi |
| 9 | **Payment** | `/order/payment` | ✅ Diimplementasi |
| 10 | **Driver Dashboard** | `/(driver)` | ✅ Diimplementasi |
| 11 | **Admin Dashboard** | `/(admin)` | ✅ Diimplementasi |

---

## 2. Flow Utama dari Prototype

### Flow Customer (User Utama)
```
Onboarding Landing → Register/Login → Home (Pesan Bensin)
                                        ↓
                                    Pilih Lokasi (Map)
                                        ↓
                                    Pilih Kendaraan
                                        ↓
                                    Pilih Jenis Bensin
                                        ↓
                                    Pilih Jumlah Liter
                                        ↓
                                    Pilih Metode Pembayaran
                                        ↓
                                    Pesan Sekarang
                                        ↓
                              ┌─── Cash ──→ Orders List
                              │
                              └─── Digital ──→ Payment Screen ──→ Order Tracking
                                                                      ↓
                                                              Live Map + Timeline
                                                                      ↓
                                                              Driver Info + Call
                                                                      ↓
                                                              QR Verification
                                                                      ↓
                                                              Pesanan Selesai
```

### Flow Driver
```
Login (role: driver) → Driver Dashboard
                           ↓
                    Toggle Online/Offline
                           ↓
                    Lihat Pesanan Tersedia
                           ↓
                    Terima / Tolak Pesanan
                           ↓
                    Progress Status:
                    accepted → on_the_way → arrived → fueling → delivered
                           ↓
                    Bagikan Lokasi (Simulasi GPS)
                           ↓
                    Riwayat Terakhir
```

### Flow Admin
```
Login (role: admin) → Admin Dashboard
                           ↓
                    Lihat Stats (Revenue, Orders, Users)
                           ↓
                    Kelola Harga BBM (Edit Price)
                           ↓
                    Lihat Pesanan Terbaru
```

---

## 3. Komponen Penting

### UI Components (Existing)
| Komponen | File | Keterangan |
|----------|------|------------|
| `Button` | `components/ui/Button.tsx` | Primary, outline, sizes, loading state |
| `Input` | `components/ui/Input.tsx` | Label, error, password toggle |
| `Card` | `components/ui/Card.tsx` | Base card container |
| `Badge` | `components/ui/Badge.tsx` | Status badge (success, warning, error, info) |
| `Navbar` | `components/ui/Navbar.tsx` | Web-only top navbar dengan logo, links, auth actions |
| `MapPicker` | `components/MapPicker.web.tsx` | Leaflet map untuk pilih lokasi (web) |
| `TrackingMap` | `components/TrackingMap.web.tsx` | Leaflet map untuk tracking driver (web) |
| `Collapsible` | `components/ui/collapsible.tsx` | Accordion/collapsible panel |

### Komponen yang Terlihat di Desain Tapi Belum Optimal
- **Product Card** — di onboarding page ada product card dengan gambar placeholder, belum ada gambar produk real
- **Testimonial Card** — avatar masih placeholder icon
- **Footer** — link "Tentang Kami", "Layanan", "FAQs", "Kontak" belum navigasi ke mana-mana
- **Cart/Notification Badge** — di navbar ada icon cart & notifikasi tapi badge selalu "0" dan belum fungsional

---

## 4. Warna, Typography, Spacing & Style Utama

### Color Palette (dari `constants/theme.ts`)
| Token | Hex Value | Penggunaan |
|-------|-----------|-----------|
| `primary` | `#334E52` | Brand utama (Figma Teal) |
| `primaryDark` | `#24383B` | Avatar, header gelap |
| `primaryLight` | `#4B7379` | Gradient end |
| `accent` | `#00D4AA` | CTA accent |
| `secondary` | `#E6F4F1` | Badge bg, icon box bg |
| `background` | `#F8FAFC` | Page background (Slate 50) |
| `surface` | `#FFFFFF` | Card surface |
| `text` | `#1E293B` | Teks utama (Slate 800) |
| `textMuted` | `#64748B` | Teks sekunder (Slate 500) |
| `success` | `#10B981` | Status sukses |
| `error` | `#EF4444` | Status error |
| `warning` | `#F59E0B` | Status warning |
| `info` | `#3B82F6` | Status info |
| `border` | `#E2E8F0` | Border umum (Slate 200) |

### Warna Fuel-Specific
| Fuel Type | Hex Color | Nama |
|-----------|-----------|------|
| IGNITE | `#14B8A6` | Teal |
| BLAZE | `#F43F5E` | Rose |
| QUANTUM | `#8B5CF6` | Violet |
| DIESEL | `#854D0E` | Brown |

### Auth Pages Extra Colors
| Penggunaan | Hex |
|-----------|-----|
| Left panel bg (login/register) | `#CFE2E8` |
| Hero button bg | `#CFFAFE` |

### Typography
| Token | Size | Weight |
|-------|------|--------|
| `h1` | 36px | 800 |
| `h2` | 28px | 700 |
| `h3` | 22px | 600 |
| `bodyLarge` | 18px | 400 |
| `body` | 16px | 400 |
| `bodySmall` | 14px | 400 |
| `caption` | 12px | 500 |

> [!NOTE]
> Tidak ada custom font yang diimport. Menggunakan system font default.
> Figma mungkin menggunakan Inter/Roboto — ini belum dicek.

### Spacing
| Token | Value |
|-------|-------|
| `xs` | 4px |
| `sm` | 8px |
| `md` | 16px |
| `lg` | 24px |
| `xl` | 32px |
| `xxl` | 48px |
| `huge` | 64px |

### Border Radius
| Token | Value |
|-------|-------|
| `sm` | 6px |
| `md` | 10px |
| `lg` | 16px |
| `xl` | 24px |
| `pill` | 9999px |

### Shadows
- `small` — subtle elevation (2px)
- `medium` — card elevation (12px blur, teal-tinted)
- `large` — prominent elevation (20px blur)
- `glow` — brand glow effect (15px radius)

---

## 5. Fitur yang Terlihat dari Desain/Prototype

### ✅ Sudah Diimplementasi (Fungsional)
1. **Onboarding Landing Page** — Hero section, guide steps, product cards, testimonials, footer
2. **Auth System** — Login & Register dengan validasi, split-screen layout desktop, error handling
3. **Home / Order Form** — Map picker, vehicle selection, fuel selection, liter input, payment method, order summary, order submission
4. **Order List** — Daftar pesanan dengan status badges, cancel, track button
5. **Order Tracking** — Live map, timeline status, driver info, QR verification, call driver
6. **Payment Flow** — QR code, Virtual Account, countdown timer, konfirmasi bayar
7. **Profile** — Avatar, user info, menu items, logout
8. **Explore** — Harga BBM, fitur keunggulan, tips hemat BBM, CTA
9. **Driver Dashboard** — Online/offline toggle, available orders, accept/reject, status progression, location simulation
10. **Admin Dashboard** — Stats cards, fuel price management (edit), recent orders list
11. **Navbar** — Logo, navigation links, auth buttons, cart/notification badge, user profile
12. **Role-based Routing** — Customer → tabs, Driver → driver dashboard, Admin → admin dashboard
13. **Real-time Socket** — Driver location sharing, order status updates

### ⚠️ Terlihat di UI Tapi Belum Fungsional
1. **Google Login** — Tombol ada tapi belum terintegrasi
2. **Lupa Password** — Tombol ada di login tapi belum ada halaman
3. **Cart Badge** — Selalu "0", belum ada logika cart
4. **Notification Badge** — Selalu "0", belum ada notification system
5. **Nav Links** — "Cara Kerja", "Area Layanan", "FAQs" belum menuju halaman apapun
6. **Footer Links** — "Tentang Kami", "Layanan", "FAQs", "Kontak" belum ada halaman
7. **Edit Profile** — Menu item ada tapi belum ada halaman edit
8. **Payment Methods** (Profile menu) — Belum ada halaman
9. **Help & Support** (Profile menu) — Belum ada halaman
10. **Explore tab** — Ada di tabs layout tapi tersembunyi dari tab bar (hanya akses via nav)
11. **Hero Image** — Menggunakan path image dari conversation sebelumnya, mungkin tidak tersedia

### ❌ Mungkin Ada di Figma Tapi Belum Dibuat
1. **Halaman Cara Kerja** (terpisah dari onboarding section)
2. **Halaman Area Layanan** (peta coverage area)
3. **Halaman FAQ** (dedicated FAQ page)
4. **Halaman Kontak**
5. **Halaman About**
6. **Edit Profile Screen** (form edit profil)
7. **Notification List Screen**
8. **Order Receipt / Invoice Screen**
9. **Rating / Review Driver Screen**

---

## 6. Ringkasan Status Keseluruhan

| Aspek | Status | Detail |
|-------|--------|--------|
| **Core User Flow** | ✅ 90% | Register → Order → Pay → Track sudah end-to-end |
| **Design System** | ✅ 85% | Theme tokens lengkap, UI components reusable |
| **Responsive Layout** | ✅ 80% | Desktop/mobile detected, web-first layout |
| **Auth & Security** | ✅ 90% | JWT, bcrypt, role-based routing |
| **Backend API** | ✅ 85% | CRUD lengkap, payment simulation |
| **Real-time** | ✅ 70% | Socket.io untuk driver tracking |
| **Visual Polish** | ⚠️ 60% | Beberapa placeholder, font belum match Figma |
| **Secondary Pages** | ❌ 20% | FAQ, About, Contact belum ada |
| **Non-functional UX** | ⚠️ 40% | Google auth, forgot password, notifications belum |
