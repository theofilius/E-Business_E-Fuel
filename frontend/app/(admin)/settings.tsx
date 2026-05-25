import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import api from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

const formatIDR = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

export default function AdminSettings() {
  const [fuelPrices, setFuelPrices] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editingFuel, setEditingFuel] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');

  const fetchFuelPrices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/fuel-prices');
      setFuelPrices(res.data.data);
    } catch (err) {
      console.error('Failed to fetch fuel prices', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFuelPrices();
  }, []);

  const handleUpdatePrice = async (fuelType: string) => {
    try {
      await api.put(`/admin/fuel-prices/${fuelType.toLowerCase()}`, { pricePerLiter: Number(editPrice) });
      setEditingFuel(null);
      fetchFuelPrices();
    } catch {
      alert('Failed to update price');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Pengaturan Cabang</Text>

      {/* INFORMASI CABANG (DEMO READ-ONLY) */}
      <Card style={styles.formCard}>
        <Text style={styles.sectionTitle}>Informasi Cabang</Text>
        <View style={styles.formGrid}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nama Cabang</Text>
            <TextInput 
              style={styles.inputDisabled} 
              value="Cabang Tangerang Selatan" 
              editable={false} 
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Area Layanan</Text>
            <TextInput 
              style={styles.inputDisabled} 
              value="Tangerang Selatan, BSD" 
              editable={false} 
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Jam Operasional</Text>
            <TextInput 
              style={styles.inputDisabled} 
              value="06:00 - 22:00 WIB" 
              editable={false} 
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Maks. radius pengiriman</Text>
            <TextInput 
              style={styles.inputDisabled} 
              value="15 Km" 
              editable={false} 
            />
          </View>
        </View>
        <TouchableOpacity style={styles.btnDisabled} disabled>
          <Text style={styles.btnDisabledText}>Pengaturan Cabang</Text>
        </TouchableOpacity>
      </Card>

      {/* KELOLA HARGA BBM */}
      {loading ? (
        <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View>
      ) : fuelPrices ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { marginBottom: Spacing.md }]}>Kelola Harga BBM</Text>
          <View style={styles.fuelGrid}>
            {Object.entries(fuelPrices.products).map(([key, product]: [string, any]) => (
              <Card key={key} style={styles.fuelCard}>
                <Text style={styles.fuelName}>{product.name}</Text>
                <Text style={styles.fuelRon}>{product.ron}</Text>
                
                {editingFuel === key ? (
                  <View style={styles.editRow}>
                    <TextInput
                      style={styles.editInput}
                      value={editPrice}
                      onChangeText={setEditPrice}
                      keyboardType="numeric"
                    />
                    <TouchableOpacity style={styles.saveBtn} onPress={() => handleUpdatePrice(key)}>
                      <Text style={styles.saveBtnText}>Simpan</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingFuel(null)}>
                      <Ionicons name="close" size={20} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.priceRow}>
                    <Text style={styles.fuelPrice}>{formatIDR(product.pricePerLiter)}</Text>
                    <TouchableOpacity onPress={() => { setEditingFuel(key); setEditPrice(String(product.pricePerLiter)); }}>
                      <Ionicons name="pencil" size={18} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>
                )}
              </Card>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    gap: Spacing.xl,
  },
  center: {
    padding: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  section: {
    marginTop: Spacing.md,
  },
  sectionTitle: {
    ...Typography.bodyLarge,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  formCard: {
    padding: Spacing.xl,
  },
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg,
  },
  formGroup: {
    flex: 1,
    minWidth: 220,
    marginBottom: Spacing.sm,
  },
  label: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  inputDisabled: {
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    backgroundColor: Colors.background,
    color: Colors.textMuted,
    ...Typography.body,
  },
  btnDisabled: {
    backgroundColor: Colors.primaryLight,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
    marginTop: Spacing.lg,
    opacity: 0.7,
  },
  btnDisabledText: {
    color: 'white',
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  fuelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  fuelCard: {
    flex: 1,
    minWidth: 200,
    padding: Spacing.lg,
  },
  fuelName: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.text,
  },
  fuelRon: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fuelPrice: {
    ...Typography.h3,
    color: Colors.primary,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    padding: Spacing.xs,
    ...Typography.body,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  saveBtnText: {
    color: 'white',
    ...Typography.caption,
    fontWeight: '700',
  },
  cancelBtn: {
    padding: Spacing.xs,
  },
});
