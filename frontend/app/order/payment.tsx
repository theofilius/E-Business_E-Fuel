import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useOrderStore } from '../../store/useOrderStore';
import { PaymentSession } from '../../types';

export default function PaymentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { initiatePayment, confirmPayment, orders, fetchOrders } = useOrderStore();
  
  const [session, setSession] = useState<PaymentSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  const order = orders.find(o => o._id === id);

  useEffect(() => {
    if (!order && id) {
      fetchOrders();
    }
  }, [id, order, fetchOrders]);

  useEffect(() => {
    const init = async () => {
      if (!id || typeof id !== 'string') return;
      try {
        setLoading(true);
        const s = await initiatePayment(id);
        setSession(s);
        
        // Calculate remaining time
        if (s.paymentExpiry) {
          const expiryTime = new Date(s.paymentExpiry).getTime();
          const now = new Date().getTime();
          const diff = Math.max(0, Math.floor((expiryTime - now) / 1000));
          setTimeLeft(diff);
        }
      } catch (err: any) {
        setError(err.message || 'Gagal membuat sesi pembayaran');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleConfirm = async () => {
    if (!id || typeof id !== 'string') return;
    try {
      setConfirming(true);
      await confirmPayment(id);
      router.replace('/(tabs)/orders' as any);
    } catch (err: any) {
      setError(err.message || 'Gagal mengkonfirmasi pembayaran');
      setConfirming(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatIDR = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

  if (loading || !order) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Menyiapkan Pembayaran...</Text>
      </View>
    );
  }

  const isQrisOrEwallet = order.paymentMethod !== 'bca' && order.paymentMethod !== 'bni' && order.paymentMethod !== 'mandiri' && order.paymentMethod !== 'bri';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pembayaran</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {error ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={20} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Card style={styles.card}>
          <View style={styles.timerContainer}>
            <Text style={styles.timerLabel}>Selesaikan dalam</Text>
            <Text style={[styles.timerValue, timeLeft < 60 && { color: Colors.error }]}>
              {formatTime(timeLeft)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.orderSummary}>
            <View>
              <Text style={styles.merchantName}>E-FUEL Delivery</Text>
              <Text style={styles.orderId}>Order #{order._id.slice(-6).toUpperCase()}</Text>
            </View>
            <Text style={styles.totalPrice}>{formatIDR(order.totalPrice)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.paymentMethodInfo}>
            <Text style={styles.paymentMethodLabel}>Metode Pembayaran</Text>
            <Text style={styles.paymentMethodName}>{order.paymentMethod.toUpperCase()}</Text>
          </View>

          {isQrisOrEwallet ? (
            <View style={styles.qrContainer}>
              <View style={styles.qrPlaceholder}>
                {session?.qrData ? (
                  <Image
                    source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(session.qrData)}` }}
                    style={styles.qrImage}
                    resizeMode="contain"
                  />
                ) : (
                  <ActivityIndicator color={Colors.primary} />
                )}
                <View style={styles.qrScannerLine} />
              </View>
              <Text style={styles.qrInstruction}>
                Scan QR code ini menggunakan aplikasi {order.paymentMethod.toUpperCase()} Anda.
              </Text>
            </View>
          ) : (
            <View style={styles.vaContainer}>
              <Text style={styles.vaLabel}>Nomor Virtual Account</Text>
              <View style={styles.vaBox}>
                <Text style={styles.vaNumber}>
                  {order.paymentMethod === 'bca' ? '3901' : '8821'} {Math.floor(10000000 + Math.random() * 90000000)}
                </Text>
                <TouchableOpacity style={styles.copyBtn}>
                  <Ionicons name="copy-outline" size={18} color={Colors.primary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.qrInstruction}>
                Transfer tepat <Text style={{fontWeight: 'bold'}}>{formatIDR(order.totalPrice)}</Text> ke nomor VA di atas.
              </Text>
            </View>
          )}

          <Button 
            title="Saya Sudah Bayar" 
            onPress={handleConfirm}
            isLoading={confirming}
            style={styles.confirmBtn}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { ...Typography.body, color: Colors.textMuted, marginTop: Spacing.md },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backBtn: { padding: Spacing.sm },
  headerTitle: { ...Typography.h3, color: Colors.text },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  errorText: { color: Colors.error, flex: 1, ...Typography.bodySmall },
  card: { padding: Spacing.xl, ...Shadows.medium, maxWidth: 480, width: '100%', alignSelf: 'center' },
  timerContainer: { alignItems: 'center', marginBottom: Spacing.md },
  timerLabel: { ...Typography.bodySmall, color: Colors.textMuted },
  timerValue: { ...Typography.h1, color: Colors.warning, marginTop: 4 },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: Spacing.md },
  orderSummary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  merchantName: { ...Typography.body, fontWeight: '700', color: Colors.text },
  orderId: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  totalPrice: { ...Typography.h3, color: Colors.primary, fontWeight: '800' },
  paymentMethodInfo: { alignItems: 'center', marginVertical: Spacing.sm },
  paymentMethodLabel: { ...Typography.caption, color: Colors.textMuted },
  paymentMethodName: { ...Typography.bodyLarge, fontWeight: '800', color: Colors.text, marginTop: 4 },
  qrContainer: { alignItems: 'center', marginVertical: Spacing.xl },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    position: 'relative',
    overflow: 'hidden',
    padding: 10,
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },
  qrScannerLine: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: Colors.primary,
    top: '50%',
    opacity: 0.5,
  },
  qrInstruction: { ...Typography.bodySmall, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.lg, paddingHorizontal: Spacing.lg },
  vaContainer: { alignItems: 'center', marginVertical: Spacing.xl, width: '100%' },
  vaLabel: { ...Typography.caption, color: Colors.textMuted, marginBottom: Spacing.sm, alignSelf: 'flex-start' },
  vaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
  },
  vaNumber: { ...Typography.h3, color: Colors.text, letterSpacing: 2 },
  copyBtn: { padding: Spacing.sm },
  confirmBtn: { marginTop: Spacing.lg, height: 56 },
});
