import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, useWindowDimensions, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/useAuthStore';
import { useOrderStore } from '../../store/useOrderStore';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { fuelPrices, createOrder, isLoading } = useOrderStore();
  const { width } = useWindowDimensions();
  const isDesktop = width > 1024;

  const [vehicle, setVehicle] = useState<'motor' | 'mobil'>('motor');
  const [selectedFuel, setSelectedFuel] = useState<string | null>(null);
  const [literMode, setLiterMode] = useState<'liter' | 'nominal'>('liter');
  const [liters, setLiters] = useState<number>(10);
  const [manualLiter, setManualLiter] = useState('');

  const quickLiters = [1, 3, 5, 10, 15, 20];

  const handleOrder = () => {
    if (!selectedFuel) return;
    createOrder({
      fuelType: selectedFuel as any,
      liters: liters,
      totalPrice: (fuelPrices.find(f => f.type === selectedFuel)?.pricePerLiter! * liters) + 10000 - 5000,
    });
  };

  const renderContent = () => (
    <View style={styles.mainContent}>
      <Text style={styles.pageTitle}>Pilih Bensin dan Jumlah Liter</Text>

      {/* Alamat Pengiriman */}
      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>Alamat Pengiriman</Text>
          <TouchableOpacity><Text style={styles.ubahLink}>Ubah</Text></TouchableOpacity>
        </View>
        <View style={styles.divider} />
        <View style={styles.addressRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.addressName}>{user?.name || 'James'} <Text style={styles.addressPhone}>08123456789</Text></Text>
            <Text style={styles.addressText}>Jl. Raya Gede banget di sebelah alfamart yang 2 lantai, Serpong Utara, Tangerang Selatan. 12345</Text>
          </View>
          <Button title="Ganti Alamat" variant="outline" size="small" onPress={() => {}} style={styles.gantiAlamatBtn} />
        </View>
      </Card>

      {/* Jenis Kendaraan */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Jenis Kendaraan</Text>
        <View style={styles.vehicleRow}>
          <TouchableOpacity 
            style={[styles.vehicleBtn, vehicle === 'motor' && styles.vehicleBtnActive]} 
            onPress={() => setVehicle('motor')}
          >
             <Ionicons name="bicycle" size={24} color={vehicle === 'motor' ? Colors.primary : Colors.textMuted} />
             <Text style={[styles.vehicleBtnText, vehicle === 'motor' && styles.vehicleBtnTextActive]}>Motor</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.vehicleBtn, vehicle === 'mobil' && styles.vehicleBtnActive]} 
            onPress={() => setVehicle('mobil')}
          >
             <Ionicons name="car" size={24} color={vehicle === 'mobil' ? Colors.primary : Colors.textMuted} />
             <Text style={[styles.vehicleBtnText, vehicle === 'mobil' && styles.vehicleBtnTextActive]}>Mobil</Text>
          </TouchableOpacity>
          
          <View style={styles.vehicleDropdown}>
             <Text style={styles.dropdownText}>{vehicle === 'motor' ? 'Honda PCX 160' : 'Toyota Avanza'}</Text>
             <Ionicons name="chevron-down" size={20} color={Colors.textMuted} />
          </View>
        </View>
      </Card>

      {/* Pilih Bensin */}
      <View style={styles.fuelGrid}>
        {fuelPrices.map((fuel) => {
          const shortName = fuel.type.match(/\d+/)?.[0] || fuel.type.charAt(0);
          return (
            <TouchableOpacity 
              key={fuel.type} 
              onPress={() => setSelectedFuel(fuel.type)}
              style={[styles.fuelItem, selectedFuel === fuel.type && styles.fuelItemActive]}
            >
              <View style={[styles.fuelIcon, { backgroundColor: fuel.type.includes('92') ? '#E0F2FE' : fuel.type.includes('95') ? '#FEF2F2' : '#F0FDF4' }]}>
                 <Text style={styles.fuelIconText}>{shortName}</Text>
              </View>
              <View style={styles.fuelInfo}>
                <Text style={styles.fuelName} numberOfLines={1}>{fuel.type}</Text>
                <Text style={styles.fuelPrice}>Rp {fuel.pricePerLiter.toLocaleString('id-ID')} / L</Text>
              </View>
              {selectedFuel === fuel.type && (
                 <View style={styles.checkCircle}>
                   <Ionicons name="checkmark" size={16} color={Colors.textInverse} />
                 </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Pilih Jumlah Liter */}
      <Card style={styles.sectionCard}>
        <View style={styles.literToggleRow}>
          <TouchableOpacity 
            style={[styles.literToggleBtn, literMode === 'liter' && styles.literToggleActive]}
            onPress={() => setLiterMode('liter')}
          >
            <Text style={[styles.literToggleText, literMode === 'liter' && styles.literToggleTextActive]}>Isi per Liter</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.literToggleBtn, literMode === 'nominal' && styles.literToggleActive]}
            onPress={() => setLiterMode('nominal')}
          >
            <Ionicons name="cash-outline" size={18} color={literMode === 'nominal' ? Colors.primary : Colors.textMuted} />
            <Text style={[styles.literToggleText, literMode === 'nominal' && styles.literToggleTextActive]}>Isi per Nominal</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickLiterGrid}>
          {quickLiters.map(val => (
            <TouchableOpacity 
              key={val} 
              style={[styles.quickBtn, liters === val && styles.quickBtnActive]}
              onPress={() => { setLiters(val); setManualLiter(''); }}
            >
              <Text style={[styles.quickBtnText, liters === val && styles.quickBtnTextActive]}>{val}L</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity 
            style={[styles.quickBtn, liters === 50 && styles.quickBtnActive]}
            onPress={() => { setLiters(50); setManualLiter(''); }}
          >
            <Text style={[styles.quickBtnText, liters === 50 && styles.quickBtnTextActive]}>Full Tank</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.manualInputSection}>
          <Text style={styles.manualLabel}>ATAU INPUT MANUAL</Text>
          <View style={styles.manualInputWrapper}>
             <TextInput 
               style={styles.manualInput} 
               placeholder="Contoh: 7" 
               keyboardType="numeric"
               value={manualLiter}
               onChangeText={(val) => {
                 setManualLiter(val);
                 if (val) setLiters(Number(val));
               }}
             />
             <Text style={styles.manualUnit}>{literMode === 'liter' ? 'Liter' : 'Rupiah'}</Text>
          </View>
        </View>
      </Card>
    </View>
  );

  const renderSidebar = () => (
    <View style={styles.sidebar}>
      <Card style={styles.sidebarCard}>
         <Text style={styles.sidebarLabel}>Metode Pembayaran</Text>
         <View style={styles.paymentSelector}>
            <View style={styles.paymentMethod}>
               <Ionicons name="wallet-outline" size={24} color={Colors.primary} />
               <Text style={styles.paymentName}>E-Wallet (Dana/OVO)</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
         </View>
      </Card>

      <Card style={styles.sidebarCard}>
         <Text style={styles.sidebarLabel}>Tulis Catatanmu</Text>
         <View style={styles.noteInput}>
            <Text style={styles.placeholderText}>cth. Mobil saya Honda Civic Hitam Mogok di dekat warung</Text>
         </View>
      </Card>

      <Card style={styles.summaryCard}>
         <Text style={styles.sidebarLabel}>Rincian Pesanan</Text>
         <View style={styles.orderDetailRow}>
            <Text style={styles.orderDetailText}>{selectedFuel || 'Belum pilih bensin'} ({liters}L)</Text>
            <Text style={styles.orderDetailPrice}>Rp {(selectedFuel ? fuelPrices.find(f => f.type === selectedFuel)?.pricePerLiter! * liters : 0).toLocaleString('id-ID')}</Text>
         </View>
         <View style={styles.orderDetailRow}>
            <Text style={styles.orderDetailText}>Ongkos Kirim</Text>
            <Text style={styles.orderDetailPrice}>Rp 10.000</Text>
         </View>
         
         <View style={styles.shippingToggle}>
            <Ionicons name="square-outline" size={24} color={Colors.border} />
            <Text style={styles.shippingText}>Pengiriman Cepat</Text>
            <Ionicons name="information-circle-outline" size={18} color={Colors.textMuted} />
         </View>

         <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Sub Total</Text>
            <Text style={styles.totalValue}>Rp {(selectedFuel ? (fuelPrices.find(f => f.type === selectedFuel)!.pricePerLiter * liters + 10000) : 0).toLocaleString('id-ID')}</Text>
         </View>

         <View style={styles.discountRow}>
            <Text style={styles.discountText}>Diskon Akun Premium</Text>
            <Text style={styles.discountValue}>- Rp 5.000</Text>
         </View>

         <Button 
           title="Lanjut Bayar" 
           disabled={!selectedFuel} 
           isLoading={isLoading} 
           onPress={handleOrder}
           style={styles.orderBtn}
         />
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
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
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
  mainContent: {
    flex: 2,
    gap: Spacing.xl,
  },
  sidebar: {
    flex: 1,
    gap: Spacing.lg,
    minWidth: 350,
  },
  pageTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  sectionCard: {
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    ...Typography.h3,
    color: Colors.text,
  },
  ubahLink: {
    color: Colors.primary,
    ...Typography.bodySmall,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginBottom: Spacing.md,
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  addressName: {
    ...Typography.bodyLarge,
    fontWeight: '700',
    color: Colors.text,
  },
  addressPhone: {
    fontWeight: '400',
    color: Colors.textMuted,
    marginLeft: Spacing.sm,
  },
  addressText: {
    ...Typography.body,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
    lineHeight: 24,
  },
  gantiAlamatBtn: {
    minWidth: 120,
  },
  vehicleRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
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
  vehicleBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: '#F0FDFA',
  },
  vehicleBtnText: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  vehicleBtnTextActive: {
    color: Colors.primary,
  },
  vehicleDropdown: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
  },
  dropdownText: {
    ...Typography.body,
    color: Colors.text,
  },
  fuelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  fuelItem: {
    width: Platform.OS === 'web' ? '48%' : '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    ...Shadows.small,
  },
  fuelItemActive: {
    borderColor: Colors.primary,
    backgroundColor: '#F0FDFA',
  },
  fuelIcon: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    overflow: 'hidden',
  },
  fuelIconText: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.primary,
  },
  fuelInfo: {
    flex: 1,
    overflow: 'hidden',
  },
  fuelName: {
    ...Typography.bodyLarge,
    fontWeight: '700',
    color: Colors.text,
  },
  fuelPrice: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginTop: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  literToggleRow: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: 4,
    marginBottom: Spacing.xl,
  },
  literToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 10,
    borderRadius: BorderRadius.sm,
  },
  literToggleActive: {
    backgroundColor: Colors.surface,
    ...Shadows.small,
  },
  literToggleText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  literToggleTextActive: {
    color: Colors.primary,
  },
  quickLiterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  quickBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    minWidth: 80,
    alignItems: 'center',
  },
  quickBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: '#F0FDFA',
  },
  quickBtnText: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  quickBtnTextActive: {
    color: Colors.primary,
  },
  manualInputSection: {
    marginTop: Spacing.md,
  },
  manualLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  manualInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.sm,
  },
  manualInput: {
    flex: 1,
    ...Typography.h3,
    color: Colors.text,
    padding: 0,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
  manualUnit: {
    ...Typography.bodyLarge,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  sidebarCard: {
    padding: Spacing.lg,
  },
  paymentSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  paymentName: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text,
  },
  summaryCard: {
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    ...Shadows.medium,
  },
  sidebarLabel: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  noteInput: {
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 100,
  },
  placeholderText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
  },
  orderDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  orderDetailText: {
    ...Typography.body,
    color: Colors.textMuted,
  },
  orderDetailPrice: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
  },
  shippingToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    marginTop: Spacing.sm,
  },
  shippingText: {
    ...Typography.bodySmall,
    color: Colors.text,
    fontWeight: '500',
    flex: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 2,
    borderTopColor: Colors.border,
  },
  totalLabel: {
    ...Typography.bodyLarge,
    fontWeight: '800',
    color: Colors.text,
  },
  totalValue: {
    ...Typography.h2,
    color: Colors.primary,
  },
  discountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  discountText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '600',
  },
  discountValue: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '700',
  },
  orderBtn: {
    width: '100%',
    paddingVertical: Spacing.lg,
  }
});
