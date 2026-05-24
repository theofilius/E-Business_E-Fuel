import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, G, Text as SvgText } from 'react-native-svg';
import { router } from 'expo-router';

// ─── Types ────────────────────────────────────────────────────────────────────
type CityStatus = 'active' | 'coming' | 'inactive';

interface City {
  name: string;
  status: CityStatus;
  /** 0-100 coordinates relative to the map SVG viewBox (800 x 420) */
  x: number;
  y: number;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const CITIES: City[] = [
  // Sumatra
  { name: 'Medan', status: 'active', x: 148, y: 178 },
  { name: 'Pekanbaru', status: 'active', x: 180, y: 218 },
  { name: 'Palembang', status: 'active', x: 218, y: 258 },
  { name: 'Banda Aceh', status: 'coming', x: 130, y: 155 },
  // Java
  { name: 'Jakarta', status: 'active', x: 268, y: 288 },
  { name: 'Bandung', status: 'active', x: 282, y: 296 },
  { name: 'Semarang', status: 'active', x: 306, y: 286 },
  { name: 'Surabaya', status: 'active', x: 330, y: 282 },
  { name: 'Yogyakarta', status: 'coming', x: 314, y: 292 },
  // Kalimantan
  { name: 'Balikpapan', status: 'active', x: 388, y: 248 },
  { name: 'Pontianak', status: 'coming', x: 340, y: 230 },
  { name: 'Banjarmasin', status: 'active', x: 372, y: 262 },
  // Sulawesi
  { name: 'Makassar', status: 'active', x: 420, y: 272 },
  { name: 'Manado', status: 'active', x: 452, y: 228 },
  // Bali & NTB
  { name: 'Denpasar', status: 'active', x: 348, y: 298 },
  { name: 'Mataram', status: 'coming', x: 362, y: 300 },
  // Maluku
  { name: 'Ambon', status: 'active', x: 494, y: 278 },
  // Papua
  { name: 'Jayapura', status: 'active', x: 594, y: 258 },
];

const STATS = [
  { value: '18', label: 'Kota Aktif' },
  { value: '7', label: 'Segera Hadir' },
  { value: '6 Pulau', label: 'Jangkauan' },
  { value: '500rb+', label: 'Pengguna Aktif' },
];

const FOOTER_COLS = [
  { 
    title: 'E-FUEL', 
    links: [
      { label: 'Tentang E-FUEL', route: '/tentang' },
      { label: 'Cara Kerja', route: '/' },
      { label: 'Area Layanan', route: '/area-layanan' },
      { label: 'Jadi Mitra Driver', route: null },
    ] 
  },
  { 
    title: 'Fitur', 
    links: [
    //   { label: 'Pesan Bensin ›', route: '/order' },
      { label: 'Pesan Bensin ›', route: null },
      { label: 'Emergency Fuel', route: null },
      { label: 'Pengiriman Cepat', route: null },
      { label: 'Premium Membership', route: '/premium' },
    ] 
  },
  { 
    title: 'Informasi Layanan', 
    links: [
      { label: 'Syarat dan Ketentuan', route: '/syarat' },
    //   { label: 'Kebijakan Privasi', route: '/privasi' },
      { label: 'Kebijakan Privasi', route: null },
      { label: 'FAQs', route: '/faq' },
    ] 
  },
  { 
    title: 'Sosial Media', 
    links: [
      { label: '@efuel.id', route: null },
      { label: 'E-Fuel Indonesia', route: null },
      { label: '@efuel.id (TikTok)', route: null },
      { label: 'E-Fuel Indonesia (YT)', route: null },
    ] 
  },
];

const STATUS_COLOR: Record<CityStatus, string> = {
  active: '#14B8A6',
  coming: '#F59E0B',
  inactive: '#CBD5E1',
};

// ─── Indonesia Map (simplified SVG path) ──────────────────────────────────────
// Approximate outline of the Indonesian archipelago at 800×420 viewBox
const INDONESIA_PATH = `
  M 130 170 C 135 165 145 160 155 163 C 160 155 168 150 175 158 C 182 152 190 155 195 162
  C 200 155 208 158 210 165 C 215 158 222 160 224 168 C 228 162 236 165 237 172
  C 240 165 248 168 248 175 C 252 169 260 172 260 180 C 264 174 272 177 271 185
  C 255 188 245 195 240 205 C 250 202 258 206 260 215 C 264 208 272 211 272 220
  C 268 226 265 232 268 240 C 272 235 280 237 282 245 C 285 238 293 240 294 248
  C 290 255 285 262 280 268 C 292 265 300 270 302 278 C 308 272 316 274 318 282
  C 322 276 330 278 332 286 C 336 280 344 282 346 290 C 350 284 358 286 360 294
  C 355 300 350 308 346 315 C 350 310 358 313 360 320 C 356 326 350 330 346 336
  C 336 332 326 328 320 320 C 314 326 308 322 304 315 C 298 320 292 316 288 310
  C 282 316 276 312 272 305 C 266 310 260 308 256 302 C 250 307 244 303 240 298
  C 234 303 228 300 224 295 C 218 300 212 297 208 292 C 200 296 193 292 190 287
  C 182 291 175 287 172 282 C 165 285 158 282 155 276 C 148 278 142 274 140 268
  C 132 270 126 265 124 258 C 118 262 112 257 110 250 C 104 253 98 248 98 242
  C 102 236 108 230 115 226 C 108 222 104 216 106 208 C 100 204 96 198 98 190
  C 104 185 112 182 120 180 C 112 174 112 170 120 167 Z

  M 170 215 C 175 210 183 213 185 220 C 190 214 198 217 200 225 C 194 230 186 228 182 222
  C 176 228 168 224 170 215 Z

  M 380 238 C 386 232 394 235 396 242 C 402 236 410 239 412 247 C 416 242 424 244 426 252
  C 432 246 440 248 442 256 C 438 262 430 265 422 263 C 426 268 424 276 417 278
  C 411 274 406 268 402 262 C 396 267 388 264 384 258 C 378 262 372 258 372 252
  C 376 246 378 242 380 238 Z

  M 445 225 C 450 220 458 222 460 230 C 464 224 472 226 474 234 C 468 240 460 238 456 232
  C 450 237 444 233 445 225 Z

  M 464 255 C 468 248 477 251 479 258 C 483 252 491 255 493 262 C 497 256 505 258 507 266
  C 503 272 495 274 488 272 C 482 277 474 274 472 268 C 466 272 460 268 464 255 Z

  M 510 262 C 515 256 524 258 527 265 C 533 259 541 262 543 270 C 537 275 528 274 524 268
  C 518 273 511 269 510 262 Z

  M 575 250 C 585 244 596 246 601 254 C 607 248 616 250 619 258 C 615 264 607 267 600 264
  C 594 270 585 267 582 261 C 576 264 570 260 575 250 Z
`;

// ─── Component ────────────────────────────────────────────────────────────────
export default function AreaLayananScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width > 1024;
  const [query, setQuery] = useState('');

  const filteredCities = CITIES.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  const mapWidth = isDesktop ? Math.min(width - 80, 900) : width - 40;
  const mapHeight = mapWidth * (420 / 800);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* ── Hero / Search Section ── */}
        <View style={styles.searchSection}>
          <Text style={styles.availableBadge}>Tersedia di 18 Kota</Text>
          <Text style={styles.heroTitle}>Cek area layanan E-FUEL di kotamu</Text>
          <Text style={styles.heroSubtitle}>
            Masukkan nama kota atau kecamatanmu untuk cek ketersediaan layanan
          </Text>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Cari kota atau kecamatan"
              placeholderTextColor="#94A3B8"
              value={query}
              onChangeText={setQuery}
            />
            <TouchableOpacity style={styles.searchBtn}>
              <Ionicons name="search" size={22} color="#334155" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Stats Row ── */}
        <View style={styles.statsSection}>
          <View style={[styles.statsRow, isDesktop && styles.statsRowDesktop]}>
            {STATS.map(s => (
              <View key={s.label} style={styles.statCard}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Map Section ── */}
        <View style={styles.mapSection}>
          <View style={[styles.mapContainer, { width: mapWidth, height: mapHeight }]}>
            <Image
              source={require('../../assets/images/map-layanan.png')}
              style={{ width: mapWidth, height: mapHeight, borderRadius: 16 }}
              resizeMode="center"
            />

            {/* Legend */}
            {/* <View style={styles.legend}>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: STATUS_COLOR.active }]} />
                <Text style={styles.legendText}>Tersedia</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: STATUS_COLOR.coming }]} />
                <Text style={styles.legendText}>Segera hadir</Text>
              </View>
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: STATUS_COLOR.inactive }]} />
                <Text style={styles.legendText}>Belum tersedia</Text>
              </View>
            </View> */}
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <View style={[styles.footerGrid, isDesktop && styles.footerGridDesktop]}>
            {/* Brand col */}
            <View style={styles.footerBrandCol}>
              <View style={styles.footerLogoRow}>
                <Ionicons name="flash" size={18} color="#14B8A6" />
                <Text style={styles.footerBrand}>E-FUEL</Text>
              </View>
            </View>

            {FOOTER_COLS.map(col => (
              <View key={col.title} style={styles.footerCol}>
                <Text style={styles.footerColTitle}>{col.title}</Text>
                {col.links.map((link, i) => (
                <TouchableOpacity 
                    key={i} 
                    onPress={() => link.route ? router.push(link.route as any) : <></>}
                >
                    <Text style={styles.footerLink}>{link.label}</Text>
                </TouchableOpacity>
                ))}
              </View>
            ))}

            {/* Payment col */}
            <View style={styles.footerCol}>
              <Text style={styles.footerColTitle}>Berbagai Metode Pembayaran</Text>
              <Text style={styles.footerPaymentNote}>Didukung oleh</Text>
              <View style={styles.paymentBadges}>
                {['QRIS', 'Dana', 'OVO', 'Mandiri', 'BCA', 'BNI'].map(p => (
                  <View key={p} style={styles.paymentBadge}>
                    <Text style={styles.paymentBadgeText}>{p}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.midtransRow}>
                <Text style={styles.midtransText}>midtrans</Text>
              </View>
            </View>
          </View>

          <View style={styles.footerBottom}>
            <Text style={styles.copyText}>© 2026 PT E-Fuel Indonesia. All Rights Reserved.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Navbar
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  navbarDesktop: {
    paddingHorizontal: 40,
  },
  navLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navBrand: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1,
  },
  navLinks: {
    flexDirection: 'row',
    gap: 24,
  },
  navLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  navLinkActive: {
    color: '#14B8A6',
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },

  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },

  // Search
  searchSection: {
    alignItems: 'center',
    paddingVertical: 56,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  availableBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: '#14B8A6',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: Platform.OS === 'web' ? 36 : 26,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 12,
    maxWidth: 600,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 500,
    marginBottom: 32,
    lineHeight: 22,
  },
  searchRow: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 520,
    gap: 10,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  searchBtn: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  // Stats
  statsSection: {
    backgroundColor: '#EBF5F3',
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  statsRow: {
    width: '100%',
    maxWidth: 900,
    gap: 12,
  },
  statsRowDesktop: {
    flexDirection: 'row',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },

  // Map
  mapSection: {
    paddingVertical: 48,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  mapContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    // backgroundColor: '#E8F4F1',
    backgroundColor: "transparent"
  },
  legend: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 12,
    gap: 6,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },

  // Footer
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 48,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  footerGrid: {
    gap: 32,
    marginBottom: 40,
  },
  footerGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  footerBrandCol: {
    marginBottom: 8,
  },
  footerLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerBrand: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1,
  },
  footerCol: {
    gap: 8,
    minWidth: 120,
  },
  footerColTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#14B8A6',
    marginBottom: 4,
  },
  footerLink: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  footerPaymentNote: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 4,
  },
  paymentBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  paymentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
  },
  midtransRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  midtransText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    fontStyle: 'italic',
  },
  footerBottom: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 20,
    alignItems: 'center',
  },
  copyText: {
    fontSize: 12,
    color: '#94A3B8',
  },
});