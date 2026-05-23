import React, { useEffect, useMemo, useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/useAuthStore';
import { useOrderStore } from '../../store/useOrderStore';
import { FuelType } from '../../types';

const QUICK_LITERS = [1, 3, 5, 10, 15, 20];
const QUICK_NOMINALS = [20000, 50000, 100000, 150000, 200000];

const FUEL_COLORS: Record<string, string> = {
  IGNITE: '#14B8A6',
  BLAZE: '#F43F5E',
  QUANTUM: '#8B5CF6',
  DIESEL: '#854D0E',
};

const formatIDR = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');
const formatNominalShort = (n: number) => {
  if (n >= 1000) return `Rp ${n / 1000}rb`;
  return `Rp ${n}`;
};

export default function OrderScreen() {
  const router = useRouter();
  const { token, user } = useAuthStore();
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

  const [vehicle, setVehicle] = useState<'motor' | 'mobil'>('motor');
  const [vehicleModel, setVehicleModel] = useState('Honda PCX 160');
  const [selectedFuel, setSelectedFuel] = useState<FuelType | null>(null);
  const [literMode, setLiterMode] = useState<'liter' | 'nominal'>('liter');
  const [liters, setLiters] = useState<number>(10);
  const [manualValue, setManualValue] = useState('');

  const [address, setAddress] = useState('Jl. Merdeka No. 17, RT 02/03, Jakarta Pusat');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'dana' | 'ovo' | 'gopay' | 'shopeepay' | 'qris' | 'bca' | 'bni' | 'mandiri' | 'bri'>('dana');
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchFuelPrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedProduct = useMemo(
    () => fuelProducts.find((f) => f.fuelType === selectedFuel) || null,
    [fuelProducts, selectedFuel]
  );

  const pricePerLiter = selectedProduct?.pricePerLiter ?? 0;
  const serviceFee = selectedProduct?.serviceFee ?? 5000;
  const deliveryFee = 10000;
  const discount = 5000;
  const subtotal = pricePerLiter * liters;
  const total = selectedProduct ? subtotal + serviceFee + deliveryFee - discount : 0;

  // ===== Liter handling =====
  const pickQuickLiter = (val: number) => {
    setLiters(val);
    setManualValue('');
    setFormError('');
  };

  const pickNominal = (val: number) => {
    setManualValue('');
    setFormError('');
    if (pricePerLiter > 0) {
      setLiters(Math.max(1, Math.floor(val / pricePerLiter)));
    }
  };

  const applyManualValue = (raw: string) => {
    setManualValue(raw);
    setFormError('');
    const num = Number(raw.replace(/[^0-9]/g, ''));
    if (!num) return;
    if (literMode === 'liter') {
      setLiters(Math.min(num, 200));
    } else if (pricePerLiter > 0) {
      setLiters(Math.max(1, Math.min(Math.floor(num / pricePerLiter), 200)));
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
      const composedNotes = [`Kendaraan: ${vehicleLabel} - ${vehicleModel}`, notes.trim()]
        .filter(Boolean)
        .join('. ');
      const order = await createOrder({
        fuelType: selectedFuel,
        liters,
        location: { address: address.trim(), coordinates: { lat: -6.2088, lng: 106.8456 } },
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

  // ===== Render: main column =====
  const renderContent = () => (
    <View style={styles.mainContent}>
      <Text style={styles.pageTitle}>Pilih Bensin dan Jumlah Liter</Text>
      <Text style={styles.pageSubtitle}>
        Pilih jenis bensin dan jumlah liter — kami antar ke tempat Anda.
      </Text>

      {/* ===== Alamat Pengiriman ===== */}
      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>Alamat Pengiriman</Text>
          <TouchableOpacity
            style={styles.changeAddressBtn}
            onPress={() => {
              if (Platform.OS === 'web') {
                window.alert('Fitur ganti alamat segera hadir.');
              }
            }}
          >
            <Ionicons name="create-outline" size={16} color={Colors.primary} />
            <Text style={styles.changeAddressBtnText}>Ganti Alamat</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />
        <View style={styles.addressInfoRow}>
          <Ionicons name="person-circle-outline" size={36} color={Colors.textMuted} />
          <View style={{ flex: 1 }}>
            <Text style={styles.addressUserName}>{user?.name || 'Customer Demo'}</Text>
            <Text style={styles.addressPhone}>{user?.phone || '0812-3456-7890'}</Text>
            <Text style={styles.addressText}>{address}</Text>
          </View>
        </View>
      </Card>

      {/* ===== Estimasi Pengiriman ===== */}
      <View style={styles.estimasiBar}>
        <Ionicons name="time-outline" size={20} color={Colors.primary} />
        <Text style={styles.estimasiText}>Estimasi Pengiriman <Text style={{ fontWeight: '800' }}>5-10 Menit</Text> ke Lokasi mu</Text>
      </View>

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
        <Text style={styles.inputLabel}>MODEL KENDARAAN</Text>
        <TextInput
          style={styles.modelInput}
          value={vehicleModel}
          onChangeText={setVehicleModel}
          placeholder="cth. Honda PCX 160"
          placeholderTextColor={Colors.textMuted}
        />
      </Card>

      {/* ===== Pilih Bensin ===== */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Produk BBM</Text>
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
              const isRecommended = fuel.fuelType === 'BLAZE';
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
                    <View style={styles.fuelNameRow}>
                      <Text style={styles.fuelName} numberOfLines={1}>
                        {fuel.name}
                      </Text>
                      {isRecommended && (
                        <View style={styles.recommendedBadge}>
                          <Text style={styles.recommendedText}>Recommended</Text>
                        </View>
                      )}
                    </View>
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

      {/* ===== Jumlah ===== */}
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

        {literMode === 'liter' ? (
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
        ) : (
          <View style={styles.quickLiterGrid}>
            {QUICK_NOMINALS.map((val) => (
              <TouchableOpacity
                key={val}
                style={[styles.quickBtn, !manualValue && pricePerLiter > 0 && liters === Math.floor(val / pricePerLiter) && styles.quickBtnActive]}
                onPress={() => pickNominal(val)}
              >
                <Text
                  style={[
                    styles.quickBtnText,
                    !manualValue && pricePerLiter > 0 && liters === Math.floor(val / pricePerLiter) && styles.quickBtnTextActive,
                  ]}
                >
                  {formatNominalShort(val)}
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
        )}

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

      {/* ===== Quick Summary (Bottom Left on Desktop) ===== */}
      {isDesktop && selectedProduct && (
        <Card style={styles.quickSummaryCard}>
          <View style={styles.quickSummaryRow}>
            <View>
              <Text style={styles.quickSummaryLabel}>Jenis BBM</Text>
              <Text style={styles.quickSummaryValue}>{selectedProduct.name}</Text>
            </View>
            <View>
              <Text style={styles.quickSummaryLabel}>Jumlah</Text>
              <Text style={styles.quickSummaryValue}>{liters} Liter</Text>
            </View>
            <View>
              <Text style={styles.quickSummaryLabel}>Total Bayar</Text>
              <Text style={[styles.quickSummaryValue, { color: Colors.primary }]}>{formatIDR(total)}</Text>
            </View>
          </View>
        </Card>
      )}
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
        <Text style={styles.sidebarLabel}>Tulis Catatanmu</Text>
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
          <Text style={styles.orderDetailPrice}>{formatIDR(deliveryFee)}</Text>
        </View>
        <View style={styles.orderDetailRow}>
          <Text style={styles.orderDetailText}>Biaya Layanan</Text>
          <Text style={styles.orderDetailPrice}>{formatIDR(serviceFee)}</Text>
        </View>
        <View style={styles.orderDetailRow}>
          <Text style={[styles.orderDetailText, { color: Colors.success }]}>
            Diskon Pelanggan
          </Text>
          <Text style={[styles.orderDetailPrice, { color: Colors.success }]}>
            - {formatIDR(discount)}
          </Text>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatIDR(total)}</Text>
        </View>

        {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button
          title={token ? 'Lanjut Bayar' : 'Masuk untuk Memesan'}
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
  // Address card
  changeAddressBtn: {
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
  changeAddressBtnText: { ...Typography.bodySmall, color: Colors.primary, fontWeight: '700' },
  addressInfoRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  addressUserName: { ...Typography.body, fontWeight: '700', color: Colors.text },
  addressPhone: { ...Typography.bodySmall, color: Colors.textMuted, marginTop: 2 },
  addressText: { ...Typography.bodySmall, color: Colors.textMuted, marginTop: 4, lineHeight: 20 },
  // Estimasi
  estimasiBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: '#F0FDFA',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  estimasiText: { ...Typography.bodySmall, color: Colors.text },
  // Vehicle
  inputLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
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
  modelInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Typography.body,
    color: Colors.text,
    backgroundColor: Colors.surface,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
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
  fuelNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  fuelName: { ...Typography.body, fontWeight: '700', color: Colors.text },
  fuelMeta: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  recommendedBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recommendedText: { fontSize: 10, fontWeight: '700', color: '#2563EB' },
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
  // Quick Summary
  quickSummaryCard: { padding: Spacing.lg, backgroundColor: '#F0FDFA', borderWidth: 1, borderColor: '#CCFBF1' },
  quickSummaryRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.lg },
  quickSummaryLabel: { ...Typography.caption, color: Colors.textMuted, marginBottom: 4 },
  quickSummaryValue: { ...Typography.body, fontWeight: '700', color: Colors.text },
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
