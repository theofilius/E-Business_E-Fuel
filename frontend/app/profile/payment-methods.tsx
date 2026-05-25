import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/useAuthStore';

const PAYMENT_OPTIONS = [
  { key: 'qris',     label: 'QRIS',                icon: 'qr-code-outline'      as const },
  { key: 'gopay',    label: 'GoPay',               icon: 'phone-portrait-outline' as const },
  { key: 'dana',     label: 'DANA',                icon: 'wallet-outline'        as const },
  { key: 'ovo',      label: 'OVO',                 icon: 'card-outline'          as const },
  { key: 'shopeepay',label: 'ShopeePay',           icon: 'bag-handle-outline'    as const },
  { key: 'bca',      label: 'BCA Virtual Account', icon: 'business-outline'      as const },
  { key: 'bni',      label: 'BNI Virtual Account', icon: 'business-outline'      as const },
  { key: 'mandiri',  label: 'Mandiri Virtual Account', icon: 'business-outline'  as const },
  { key: 'cash',     label: 'Tunai (Cash)',         icon: 'cash-outline'          as const },
];

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuthStore();

  const [selected, setSelected] = useState<string>(user?.defaultPaymentMethod || '');
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await updateProfile({ defaultPaymentMethod: selected || null } as any);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      /* error handled in store */
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Metode Pembayaran</Text>
        </View>

        <Text style={styles.subtitle}>
          Pilih metode pembayaran default yang akan digunakan saat memesan bensin.
        </Text>

        {/* Success banner */}
        {saved && (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
            <Text style={styles.successText}>Metode pembayaran default disimpan!</Text>
          </View>
        )}

        <Card style={styles.card}>
          {PAYMENT_OPTIONS.map((opt, idx) => {
            const isSelected = selected === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.option,
                  idx < PAYMENT_OPTIONS.length - 1 && styles.optionBorder,
                  isSelected && styles.optionSelected,
                ]}
                onPress={() => setSelected(isSelected ? '' : opt.key)}
              >
                <View style={[styles.iconWrap, isSelected && styles.iconWrapSelected]}>
                  <Ionicons name={opt.icon} size={20} color={isSelected ? Colors.textInverse : Colors.primary} />
                </View>
                <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                  {opt.label}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
                )}
              </TouchableOpacity>
            );
          })}
        </Card>

        <Button
          title={saving ? 'Menyimpan…' : 'Simpan Pilihan'}
          onPress={handleSave}
          disabled={saving}
          isLoading={saving}
          style={styles.saveBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...Typography.h2, color: Colors.text },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginBottom: Spacing.lg,
  },

  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#D1FAE5',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
  successText: { ...Typography.bodySmall, color: Colors.success, fontWeight: '600' },

  card: { padding: 0, overflow: 'hidden', marginBottom: Spacing.lg },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
  },
  optionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  optionSelected: { backgroundColor: Colors.secondary },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapSelected: { backgroundColor: Colors.primary },
  optionLabel: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  optionLabelSelected: { fontWeight: '700', color: Colors.primary },

  saveBtn: { ...Shadows.small },
});
