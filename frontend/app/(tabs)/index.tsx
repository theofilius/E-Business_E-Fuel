import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import MapPicker, { LatLng } from '../../components/MapPicker';
import { useAuthStore } from '../../store/useAuthStore';
import { useOrderStore } from '../../store/useOrderStore';
import { reverseGeocode } from '../../utils/geocode';
import { FuelType } from '../../types';
import { LinearGradient } from 'expo-linear-gradient';

const HERO_IMAGE = require('../../assets/images/hero_image.png');

// Default map centre: Jakarta
const JAKARTA: LatLng = { lat: -6.2088, lng: 106.8456 };
const QUICK_LITERS = [1, 3, 5, 10, 15, 20];
const FUEL_COLORS: Record<string, string> = {
  IGNITE: '#14B8A6',
  BLAZE: '#F43F5E',
  QUANTUM: '#8B5CF6',
  DIESEL: '#854D0E',
};

const formatIDR = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

export default function HomeScreen() {
  const router = useRouter();
  const { token } = useAuthStore();
  const {
    fuelProducts,
    fetchFuelPrices,
    isLoadingPrices,
    createOrder,
    isSubmitting,
    error,
    clearError,
  } = useOrderStore();
  const { width } = useWindowDimensions();
  const isDesktop = width > 1024;
  const scrollViewRef = useRef<ScrollView>(null);
  const orderSectionY = useRef(0);

  const [vehicle, setVehicle] = useState<'motor' | 'mobil'>('motor');
  const [selectedFuel, setSelectedFuel] = useState<FuelType | null>(null);
  const [literMode, setLiterMode] = useState<'liter' | 'nominal'>('liter');
  const [liters, setLiters] = useState<number>(10);
  const [manualValue, setManualValue] = useState('');

  const [location, setLocation] = useState<LatLng>(JAKARTA);
  const [address, setAddress] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsHint, setGpsHint] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'dana' | 'ovo' | 'gopay' | 'shopeepay' | 'qris' | 'bca' | 'bni' | 'mandiri' | 'bri'>('dana');
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchFuelPrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToOrder = () => {
    scrollViewRef.current?.scrollTo({ y: orderSectionY.current, animated: true });
  };

  const selectedProduct = useMemo(
    () => fuelProducts.find((f) => f.fuelType === selectedFuel) || null,
    [fuelProducts, selectedFuel]
  );

  const pricePerLiter = selectedProduct?.pricePerLiter ?? 0;
  const serviceFee = selectedProduct?.serviceFee ?? 5000;
  const subtotal = pricePerLiter * liters;
  const total = selectedProduct ? subtotal + serviceFee : 0;

  // ===== Liter handling =====
  const pickQuickLiter = (val: number) => {
    setLiters(val);
    setManualValue('');
    setFormError('');
  };

  const applyManualValue = (raw: string) => {
    setManualValue(raw);
    setFormError('');
    const num = Number(raw.replace(/[^0-9]/g, ''));
    if (!num) return;
    if (literMode === 'liter') {
      setLiters(Math.min(num, 200));
    } else if (pricePerLiter > 0) {
      // nominal (rupiah) -> liters
      setLiters(Math.max(1, Math.min(Math.floor(num / pricePerLiter), 200)));
    }
  };

  // ===== Location handling =====
  const applyLocation = async (coords: LatLng) => {
    setLocation(coords);
    setFormError('');
    const addr = await reverseGeocode(coords.lat, coords.lng);
    if (addr) setAddress(addr);
  };

  const useMyLocation = async () => {
    setGpsLoading(true);
    setGpsHint('');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setGpsHint('Izin lokasi ditolak. Silakan pilih titik di peta secara manual.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      await applyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    } catch {
      setGpsHint('Gagal mendapatkan lokasi. Silakan pilih titik di peta secara manual.');
    } finally {
      setGpsLoading(false);
    }
  };

  // ===== Submit =====
  const handleOrder = async () => {
    setFormError('');
    clearError();
    if (!token) {
      router.push('/(auth)/login');
      return;
    }
    if (!selectedFuel) {
      setFormError('Silakan pilih jenis bensin terlebih dahulu.');
      return;
    }
    if (!liters || liters < 1) {
      setFormError('Masukkan jumlah liter (minimal 1 liter).');
      return;
    }
    if (!address.trim()) {
      setFormError('Alamat pengiriman wajib diisi.');
      return;
    }
    try {
      const vehicleLabel = vehicle === 'motor' ? 'Motor' : 'Mobil';
      const composedNotes = [`Kendaraan: ${vehicleLabel}`, notes.trim()]
        .filter(Boolean)
        .join('. ');
      const order = await createOrder({
        fuelType: selectedFuel,
        liters,
        location: { address: address.trim(), coordinates: location },
        paymentMethod,
        notes: composedNotes,
      });
      if (paymentMethod === 'cash') {
        router.push('/(tabs)/orders');
      } else {
        router.push(`/order/payment?id=${order._id}` as any);
      }
    } catch {
      // server error is shown via the store's `error`
    }
  };

  // ===== Render: hero landing section =====
  const renderHero = () => (
    <View style={heroStyles.wrapper}>
      {/* Hero Banner */}
      <View style={[heroStyles.hero, isDesktop && heroStyles.heroDesktop]}>
        <Image source={HERO_IMAGE} style={heroStyles.heroImage} />
        <LinearGradient
          colors={['rgba(15, 23, 42, 0.4)', 'rgba(15, 23, 42, 0.7)']}
          style={heroStyles.heroOverlay}
        >
          <View style={heroStyles.heroContent}>
            <Text style={heroStyles.heroTitle}>E-FUEL{'\n'}OUT OF FUEL? WE&apos;VE GOT{'\n'}YOU COVERED.</Text>
            <View style={heroStyles.heroActions}>
              <TouchableOpacity style={heroStyles.heroBtn} onPress={scrollToOrder}>
                <Text style={heroStyles.heroBtnText}>Pesan Sekarang</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={heroStyles.outlineBtn}
                onPress={() => scrollViewRef.current?.scrollTo({ y: 550, animated: true })}
              >
                <Text style={heroStyles.outlineBtnText}>Lihat Cara Kerja</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Guide Section */}
      <View style={heroStyles.guideSection}>
        <Text style={heroStyles.sectionTitle}>Beli Bensin dalam 3 Langkah Mudah</Text>
        <Text style={heroStyles.sectionSubtitle}>Beli bensin online dan kami kirim langsung ke lokasimu dengan proses yang cepat dan praktis.</Text>
        <View style={[heroStyles.stepsContainer, isDesktop && heroStyles.stepsDesktop]}>
          <View style={heroStyles.stepCard}>
            <Ionicons name="cube" size={48} color="#F97316" />
            <Text style={heroStyles.stepTitle}>Pilih Lokasi Pengiriman</Text>
          </View>
          <View style={heroStyles.stepCard}>
            <Ionicons name="hand-right" size={48} color="#3B82F6" />
            <Text style={heroStyles.stepTitle}>Pilih Jenis Bensin & Jumlah Liter</Text>
          </View>
          <View style={heroStyles.stepCard}>
            <Ionicons name="car-sport" size={48} color="#F59E0B" />
            <Text style={heroStyles.stepTitle}>Bayar & Bensin Dikirim</Text>
          </View>
        </View>
      </View>

      {/* Products Preview */}
      <View style={heroStyles.productsSection}>
        <Text style={heroStyles.sectionTitle}>Pesan Bensin Sekarang</Text>
        <Text style={heroStyles.sectionSubtitle}>Pilih jenis RON yang kamu butuhkan dan tentukan jumlah liter untuk pengiriman ke lokasimu.</Text>
        <View style={[heroStyles.productsGrid, isDesktop && heroStyles.productsDesktop]}>
          {fuelProducts.length > 0 ? fuelProducts.map((fuel) => {
            const color = FUEL_COLORS[fuel.fuelType] || Colors.primary;
            return (
              <View key={fuel.fuelType} style={heroStyles.productCard}>
                <View style={[heroStyles.productImagePlaceholder, { backgroundColor: color }]}>
                  <Text style={heroStyles.productBigRon}>{fuel.ron.replace(/\D/g, '')}</Text>
                  <Text style={heroStyles.productBrandText}>E-FUEL{'\n'}{fuel.name.split(' ').pop()}</Text>
                </View>
                <View style={heroStyles.productInfo}>
                  <Text style={heroStyles.productName}>{fuel.name}</Text>
                  <Text style={heroStyles.productPriceLabel}>{formatIDR(fuel.pricePerLiter)}/Liter</Text>
                  <TouchableOpacity style={heroStyles.productActionBtn} onPress={() => {
                    setSelectedFuel(fuel.fuelType);
                    scrollToOrder();
                  }}>
                    <Text style={heroStyles.productActionBtnText}>Pesan Sekarang</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }) : (
            <Text style={{ color: Colors.textMuted }}>Memuat produk...</Text>
          )}
        </View>
      </View>
    </View>
  );

  // ===== Render: main column =====
  const renderContent = () => (
    <View style={styles.mainContent} onLayout={(e) => { orderSectionY.current = e.nativeEvent.layout.y; }}>
      <Text style={styles.pageTitle}>Pilih Bensin dan Jumlah Liter</Text>
      <Text style={styles.pageSubtitle}>
        Pilih lokasi, jenis bensin, dan jumlah liter — kami antar ke tempat Anda.
      </Text>

      {/* ===== Alamat Pengiriman + Peta ===== */}
      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>Alamat Pengiriman</Text>
          <TouchableOpacity
            style={[styles.gpsBtn, gpsLoading && styles.gpsBtnLoading]}
            onPress={useMyLocation}
            disabled={gpsLoading}
          >
            {gpsLoading ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Ionicons name="locate" size={16} color={Colors.primary} />
            )}
            <Text style={styles.gpsBtnText}>
              {gpsLoading ? 'Mencari…' : 'Gunakan Lokasi Saya'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />

        <MapPicker value={location} onChange={applyLocation} height={isDesktop ? 300 : 220} />

        {gpsHint ? <Text style={styles.gpsHint}>{gpsHint}</Text> : null}
        <Text style={styles.mapHelp}>
          Klik pada peta atau geser pin untuk menentukan titik antar.
        </Text>

        <Text style={styles.inputLabel}>Alamat Lengkap</Text>
        <TextInput
          style={styles.addressInput}
          placeholder="cth. Jl. Merdeka No. 17, RT 02/03, Jakarta Pusat"
          placeholderTextColor={Colors.textMuted}
          value={address}
          onChangeText={(v) => {
            setAddress(v);
            setFormError('');
          }}
          multiline
        />
        <Text style={styles.coordsText}>
          📍 Titik: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
        </Text>
      </Card>

      {/* ===== Jenis Kendaraan ===== */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Jenis Kendaraan</Text>
        <View style={styles.vehicleRow}>
          <TouchableOpacity
            style={[styles.vehicleBtn, vehicle === 'motor' && styles.vehicleBtnActive]}
            onPress={() => setVehicle('motor')}
          >
            <Ionicons
              name="bicycle"
              size={22}
              color={vehicle === 'motor' ? Colors.primary : Colors.textMuted}
            />
            <Text
              style={[styles.vehicleBtnText, vehicle === 'motor' && styles.vehicleBtnTextActive]}
            >
              Motor
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.vehicleBtn, vehicle === 'mobil' && styles.vehicleBtnActive]}
            onPress={() => setVehicle('mobil')}
          >
            <Ionicons
              name="car"
              size={22}
              color={vehicle === 'mobil' ? Colors.primary : Colors.textMuted}
            />
            <Text
              style={[styles.vehicleBtnText, vehicle === 'mobil' && styles.vehicleBtnTextActive]}
            >
              Mobil
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* ===== Pilih Bensin ===== */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Pilih Jenis Bensin</Text>
        {isLoadingPrices ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={Colors.primary} />
            <Text style={styles.loadingText}>Memuat harga bensin…</Text>
          </View>
        ) : fuelProducts.length === 0 ? (
          <Text style={styles.loadingText}>
            Tidak dapat memuat harga. Pastikan server backend berjalan.
          </Text>
        ) : (
          <View style={styles.fuelGrid}>
            {fuelProducts.map((fuel) => {
              const active = selectedFuel === fuel.fuelType;
              const color = FUEL_COLORS[fuel.fuelType] || Colors.primary;
              return (
                <TouchableOpacity
                  key={fuel.fuelType}
                  onPress={() => {
                    setSelectedFuel(fuel.fuelType);
                    setFormError('');
                  }}
                  style={[styles.fuelItem, active && styles.fuelItemActive]}
                >
                  <View style={[styles.fuelIcon, { backgroundColor: color }]}>
                    <Text style={styles.fuelIconText}>{fuel.ron.replace(/\D/g, '')}</Text>
                  </View>
                  <View style={styles.fuelInfo}>
                    <Text style={styles.fuelName} numberOfLines={1}>
                      {fuel.name}
                    </Text>
                    <Text style={styles.fuelMeta}>
                      {fuel.ron} · {formatIDR(fuel.pricePerLiter)}/L
                    </Text>
                  </View>
                  {active && (
                    <View style={styles.checkCircle}>
                      <Ionicons name="checkmark" size={15} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </Card>

      {/* ===== Jumlah Liter ===== */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Jumlah</Text>
        <View style={styles.literToggleRow}>
          <TouchableOpacity
            style={[styles.literToggleBtn, literMode === 'liter' && styles.literToggleActive]}
            onPress={() => {
              setLiterMode('liter');
              setManualValue('');
            }}
          >
            <Text
              style={[
                styles.literToggleText,
                literMode === 'liter' && styles.literToggleTextActive,
              ]}
            >
              Isi per Liter
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.literToggleBtn, literMode === 'nominal' && styles.literToggleActive]}
            onPress={() => {
              setLiterMode('nominal');
              setManualValue('');
            }}
          >
            <Text
              style={[
                styles.literToggleText,
                literMode === 'nominal' && styles.literToggleTextActive,
              ]}
            >
              Isi per Nominal
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickLiterGrid}>
          {QUICK_LITERS.map((val) => (
            <TouchableOpacity
              key={val}
              style={[styles.quickBtn, liters === val && !manualValue && styles.quickBtnActive]}
              onPress={() => pickQuickLiter(val)}
            >
              <Text
                style={[
                  styles.quickBtnText,
                  liters === val && !manualValue && styles.quickBtnTextActive,
                ]}
              >
                {val} L
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.quickBtn, liters === 50 && !manualValue && styles.quickBtnActive]}
            onPress={() => pickQuickLiter(50)}
          >
            <Text
              style={[
                styles.quickBtnText,
                liters === 50 && !manualValue && styles.quickBtnTextActive,
              ]}
            >
              Full Tank
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.inputLabel}>
          {literMode === 'liter' ? 'ATAU INPUT MANUAL (LITER)' : 'INPUT NOMINAL (RUPIAH)'}
        </Text>
        <View style={styles.manualInputWrapper}>
          <TextInput
            style={styles.manualInput}
            placeholder={literMode === 'liter' ? 'cth. 7' : 'cth. 50000'}
            placeholderTextColor={Colors.textMuted}
            keyboardType="numeric"
            value={manualValue}
            onChangeText={applyManualValue}
          />
          <Text style={styles.manualUnit}>{literMode === 'liter' ? 'Liter' : 'Rupiah'}</Text>
        </View>
        <Text style={styles.literResult}>
          Jumlah pesanan: <Text style={styles.literResultBold}>{liters} Liter</Text>
        </Text>
      </Card>
    </View>
  );

  // ===== Render: sidebar / summary =====
  const renderSidebar = () => (
    <View style={styles.sidebar}>
      <Card style={styles.sidebarCard}>
        <Text style={styles.sidebarLabel}>Metode Pembayaran</Text>
        
        {/* Selected Payment Summary */}
        <TouchableOpacity 
          style={styles.paymentSelector}
          onPress={() => setShowPaymentOptions(!showPaymentOptions)}
        >
          <View style={styles.paymentMethod}>
            {paymentMethod === 'cash' ? (
              <Ionicons name="cash-outline" size={22} color={Colors.primary} />
            ) : paymentMethod === 'qris' ? (
              <Ionicons name="qr-code-outline" size={22} color={Colors.primary} />
            ) : ['bca', 'bni', 'mandiri', 'bri'].includes(paymentMethod) ? (
              <Ionicons name="business-outline" size={22} color={Colors.primary} />
            ) : (
              <Ionicons name="wallet-outline" size={22} color={Colors.primary} />
            )}
            <Text style={styles.paymentName}>
              {paymentMethod.toUpperCase()}
            </Text>
          </View>
          <Ionicons name={showPaymentOptions ? "chevron-up" : "chevron-down"} size={20} color={Colors.textMuted} />
        </TouchableOpacity>

        {/* Payment Options List */}
        {showPaymentOptions && (
          <View style={styles.paymentOptionsList}>
            <Text style={styles.paymentGroupLabel}>E-Wallet</Text>
            {['dana', 'ovo', 'gopay', 'shopeepay'].map((pm) => (
              <TouchableOpacity 
                key={pm} 
                style={[styles.paymentOptionItem, paymentMethod === pm && styles.paymentOptionActive]}
                onPress={() => { setPaymentMethod(pm as any); setShowPaymentOptions(false); }}
              >
                <Text style={[styles.paymentOptionText, paymentMethod === pm && styles.paymentOptionTextActive]}>
                  {pm.toUpperCase()}
                </Text>
                {paymentMethod === pm && <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />}
              </TouchableOpacity>
            ))}
            
            <Text style={styles.paymentGroupLabel}>E-Banking</Text>
            {['qris', 'bca', 'bni', 'mandiri', 'bri'].map((pm) => (
              <TouchableOpacity 
                key={pm} 
                style={[styles.paymentOptionItem, paymentMethod === pm && styles.paymentOptionActive]}
                onPress={() => { setPaymentMethod(pm as any); setShowPaymentOptions(false); }}
              >
                <Text style={[styles.paymentOptionText, paymentMethod === pm && styles.paymentOptionTextActive]}>
                  {pm === 'qris' ? 'QRIS' : `${pm.toUpperCase()} Virtual Account`}
                </Text>
                {paymentMethod === pm && <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />}
              </TouchableOpacity>
            ))}

            <Text style={styles.paymentGroupLabel}>Bayar di Tempat</Text>
            <TouchableOpacity 
                style={[styles.paymentOptionItem, paymentMethod === 'cash' && styles.paymentOptionActive]}
                onPress={() => { setPaymentMethod('cash'); setShowPaymentOptions(false); }}
              >
                <Text style={[styles.paymentOptionText, paymentMethod === 'cash' && styles.paymentOptionTextActive]}>
                  Cash on Delivery
                </Text>
                {paymentMethod === 'cash' && <Ionicons name="checkmark-circle" size={18} color={Colors.primary} />}
            </TouchableOpacity>
          </View>
        )}
      </Card>

      <Card style={styles.sidebarCard}>
        <Text style={styles.sidebarLabel}>Catatan untuk Driver</Text>
        <TextInput
          style={styles.noteInput}
          placeholder="cth. Rumah pagar hitam, motor di garasi"
          placeholderTextColor={Colors.textMuted}
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </Card>

      <Card style={styles.summaryCard}>
        <Text style={styles.sidebarLabel}>Rincian Pesanan</Text>

        <View style={styles.orderDetailRow}>
          <Text style={styles.orderDetailText}>
            {selectedProduct ? `${selectedProduct.name} (${liters} L)` : 'Belum pilih bensin'}
          </Text>
          <Text style={styles.orderDetailPrice}>{formatIDR(subtotal)}</Text>
        </View>
        <View style={styles.orderDetailRow}>
          <Text style={styles.orderDetailText}>Ongkos Kirim</Text>
          <Text style={styles.orderDetailPrice}>{formatIDR(10000)}</Text>
        </View>
        <View style={styles.orderDetailRow}>
          <Text style={[styles.orderDetailText, { color: Colors.success }]}>
            Diskon Pelanggan
          </Text>
          <Text style={[styles.orderDetailPrice, { color: Colors.success }]}>
            - {formatIDR(5000)}
          </Text>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatIDR(total)}</Text>
        </View>

        {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button
          title={token ? 'Pesan Sekarang' : 'Masuk untuk Memesan'}
          onPress={handleOrder}
          isLoading={isSubmitting}
          style={styles.orderBtn}
        />
        <Text style={styles.secureNote}>
          🔒 Pesanan diproses aman. Driver akan ditugaskan setelah konfirmasi.
        </Text>
      </Card>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContent}>
        {renderHero()}
        <View style={[styles.layout, isDesktop && styles.desktopLayout]}>
          {renderContent()}
          {renderSidebar()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: Spacing.xxl },
  layout: {
    padding: Spacing.lg,
    gap: Spacing.xl,
    maxWidth: 1440,
    width: '100%',
    alignSelf: 'center',
  },
  desktopLayout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.xxl,
  },
  mainContent: { flex: 2, gap: Spacing.lg },
  sidebar: { flex: 1, gap: Spacing.lg, minWidth: 320 },
  pageTitle: { ...Typography.h2, color: Colors.text },
  pageSubtitle: {
    ...Typography.body,
    color: Colors.textMuted,
    marginTop: -Spacing.sm,
    marginBottom: Spacing.xs,
  },
  sectionCard: { padding: Spacing.xl },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  sectionHeader: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.md },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginBottom: Spacing.md },
  // GPS button
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: '#F0FDFA',
    marginBottom: Spacing.md,
  },
  gpsBtnLoading: { opacity: 0.7 },
  gpsBtnText: { ...Typography.bodySmall, color: Colors.primary, fontWeight: '700' },
  gpsHint: {
    ...Typography.caption,
    color: Colors.warning,
    marginTop: Spacing.sm,
    fontWeight: '600',
  },
  mapHelp: { ...Typography.caption, color: Colors.textMuted, marginTop: Spacing.sm },
  inputLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  addressInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    minHeight: 64,
    ...Typography.body,
    color: Colors.text,
    backgroundColor: Colors.surface,
    textAlignVertical: 'top',
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  coordsText: { ...Typography.caption, color: Colors.textMuted, marginTop: Spacing.sm },
  // Vehicle
  vehicleRow: { flexDirection: 'row', gap: Spacing.md },
  vehicleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
  },
  vehicleBtnActive: { borderColor: Colors.primary, backgroundColor: '#F0FDFA' },
  vehicleBtnText: { ...Typography.body, fontWeight: '600', color: Colors.textMuted },
  vehicleBtnTextActive: { color: Colors.primary },
  // Fuel grid
  loadingBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.md },
  loadingText: { ...Typography.bodySmall, color: Colors.textMuted },
  fuelGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  fuelItem: {
    width: Platform.OS === 'web' ? '48%' : '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  fuelItemActive: { borderColor: Colors.primary, backgroundColor: '#F0FDFA' },
  fuelIcon: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  fuelIconText: { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
  fuelInfo: { flex: 1, overflow: 'hidden' },
  fuelName: { ...Typography.body, fontWeight: '700', color: Colors.text },
  fuelMeta: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Liter
  literToggleRow: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  literToggleBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.sm,
  },
  literToggleActive: { backgroundColor: Colors.surface, ...Shadows.small },
  literToggleText: { ...Typography.bodySmall, color: Colors.textMuted, fontWeight: '600' },
  literToggleTextActive: { color: Colors.primary },
  quickLiterGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  quickBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    minWidth: 76,
    alignItems: 'center',
  },
  quickBtnActive: { borderColor: Colors.primary, backgroundColor: '#F0FDFA' },
  quickBtnText: { ...Typography.body, fontWeight: '600', color: Colors.textMuted },
  quickBtnTextActive: { color: Colors.primary },
  manualInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.sm,
  },
  manualInput: {
    flex: 1,
    ...Typography.h3,
    color: Colors.text,
    padding: 0,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  manualUnit: { ...Typography.body, color: Colors.textMuted, fontWeight: '600' },
  literResult: { ...Typography.bodySmall, color: Colors.textMuted, marginTop: Spacing.md },
  literResultBold: { color: Colors.primary, fontWeight: '800' },
  // Sidebar
  sidebarCard: { padding: Spacing.lg },
  sidebarLabel: { ...Typography.body, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },
  paymentSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  paymentMethod: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  paymentName: { ...Typography.body, fontWeight: '600', color: Colors.text },
  paymentOptionsList: {
    marginTop: Spacing.md,
    gap: 4,
  },
  paymentGroupLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
    marginBottom: 4,
  },
  paymentOptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  paymentOptionActive: {
    backgroundColor: '#F0FDFA',
  },
  paymentOptionText: {
    ...Typography.bodySmall,
    color: Colors.text,
  },
  paymentOptionTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  noteInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    minHeight: 80,
    ...Typography.bodySmall,
    color: Colors.text,
    backgroundColor: Colors.background,
    textAlignVertical: 'top',
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  summaryCard: { padding: Spacing.lg, ...Shadows.medium },
  orderDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  orderDetailText: { ...Typography.bodySmall, color: Colors.textMuted, flex: 1 },
  orderDetailPrice: { ...Typography.bodySmall, color: Colors.text, fontWeight: '600' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 2,
    borderTopColor: Colors.border,
  },
  totalLabel: { ...Typography.bodyLarge, fontWeight: '800', color: Colors.text },
  totalValue: { ...Typography.h3, color: Colors.primary, fontWeight: '800' },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.error,
    fontWeight: '600',
    marginTop: Spacing.md,
  },
  orderBtn: { width: '100%', marginTop: Spacing.lg, paddingVertical: Spacing.md },
  secureNote: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});

const heroStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FFFFFF',
    paddingBottom: Spacing.xxl,
  },
  hero: {
    height: 500,
    width: '90%',
    alignSelf: 'center',
    marginTop: 20,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  heroDesktop: {
    height: 500,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    paddingHorizontal: Spacing.huge,
  },
  heroContent: {
    flex: 1,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    ...Typography.h1,
    color: '#FFFFFF',
    fontSize: Platform.OS === 'web' ? 56 : 32,
    lineHeight: Platform.OS === 'web' ? 64 : 40,
    marginBottom: Spacing.xl,
    textAlign: 'center',
    fontWeight: '900',
  },
  heroActions: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  heroBtn: {
    minWidth: 180,
    height: 50,
    backgroundColor: '#CFFAFE',
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroBtnText: {
    ...Typography.body,
    fontWeight: '700',
    color: '#000000',
  },
  outlineBtn: {
    minWidth: 180,
    height: 50,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlineBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  guideSection: {
    paddingVertical: 80,
    paddingHorizontal: Spacing.huge,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000000',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  sectionSubtitle: {
    ...Typography.body,
    color: Colors.textMuted,
    marginBottom: 40,
    textAlign: 'center',
    maxWidth: 600,
  },
  stepsContainer: {
    width: '100%',
    maxWidth: 1000,
    gap: 40,
  },
  stepsDesktop: {
    flexDirection: 'row',
  },
  stepCard: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.md,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
  },
  productsSection: {
    paddingVertical: 80,
    paddingHorizontal: Spacing.huge,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  productsGrid: {
    width: '100%',
    maxWidth: 1200,
    gap: Spacing.lg,
  },
  productsDesktop: {
    flexDirection: 'row',
  },
  productCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.small,
  },
  productImagePlaceholder: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  productBigRon: {
    fontSize: 80,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.2)',
    position: 'absolute',
  },
  productBrandText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22,
  },
  productInfo: {
    padding: Spacing.lg,
  },
  productName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 4,
  },
  productPriceLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: Spacing.lg,
  },
  productActionBtn: {
    borderWidth: 1,
    borderColor: '#F1F5F9',
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  productActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
});
