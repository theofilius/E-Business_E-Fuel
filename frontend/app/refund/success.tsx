import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { Button } from '../../components/ui/Button';

export default function RefundSuccessScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();

  const shortId = orderId ? `#${orderId.slice(-6).toUpperCase()}` : '';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        {/* Success icon */}
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
        </View>

        <Text style={styles.title}>Refund Berhasil Dikirim</Text>

        <Text style={styles.body}>
          Pengajuan refund untuk transaksi{shortId ? ` ${shortId}` : ''} telah diterima oleh
          tim E-Fuel dan akan diproses dalam{' '}
          <Text style={styles.bold}>1–3 hari kerja</Text>.{'\n\n'}
          Anda akan mendapat notifikasi setelah pengajuan diproses.
        </Text>

        {/* Status pill */}
        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Status: Menunggu Proses</Text>
        </View>

        <Button
          title="Kembali ke Pesanan Saya"
          onPress={() => router.replace('/(tabs)/orders')}
          style={styles.btn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.medium,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  body: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  bold: { fontWeight: '700', color: Colors.text },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.pill,
    marginBottom: Spacing.xl,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.warning,
  },
  statusText: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.warning,
  },
  btn: { width: '100%' },
});
