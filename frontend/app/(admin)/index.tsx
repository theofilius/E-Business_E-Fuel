import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../services/api';

const formatIDR = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');
const formatDate = (iso: string) => new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function AdminDashboard() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [fuelPrices, setFuelPrices] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [editingFuel, setEditingFuel] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes, pricesRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/orders?limit=10'),
        api.get('/admin/fuel-prices')
      ]);
      setStats(statsRes.data.data);
      setOrders(ordersRes.data.data);
      setFuelPrices(pricesRes.data.data);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdatePrice = async (fuelType: string) => {
    try {
      await api.put(`/admin/fuel-prices/${fuelType.toLowerCase()}`, { pricePerLiter: Number(editPrice) });
      setEditingFuel(null);
      fetchDashboardData();
    } catch (err) {
      alert('Failed to update price');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  if (loading && !stats) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.inner}>
          
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Admin Dashboard</Text>
              <Text style={styles.subtitle}>Halo, {user?.name}</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.refreshBtn} onPress={fetchDashboardData}>
                <Ionicons name="refresh" size={20} color={Colors.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
                <Ionicons name="log-out-outline" size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Grid */}
          {stats && (
            <View style={styles.statsGrid}>
              <Card style={styles.statCard}>
                <View style={styles.statIconBox}><Ionicons name="cash-outline" size={24} color={Colors.success} /></View>
                <Text style={styles.statLabel}>Total Revenue</Text>
                <Text style={styles.statValue}>{formatIDR(stats.revenue)}</Text>
              </Card>
              <Card style={styles.statCard}>
                <View style={[styles.statIconBox, { backgroundColor: '#EFF6FF' }]}><Ionicons name="receipt-outline" size={24} color={Colors.info} /></View>
                <Text style={styles.statLabel}>Total Orders</Text>
                <Text style={styles.statValue}>{stats.totalOrders}</Text>
              </Card>
              <Card style={styles.statCard}>
                <View style={[styles.statIconBox, { backgroundColor: '#FFFBEB' }]}><Ionicons name="people-outline" size={24} color={Colors.warning} /></View>
                <Text style={styles.statLabel}>Active Users</Text>
                <Text style={styles.statValue}>{stats.totalCustomers} Customers, {stats.totalDrivers} Drivers</Text>
              </Card>
            </View>
          )}

          {/* Fuel Prices Management */}
          {fuelPrices && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Kelola Harga BBM</Text>
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
          )}

          {/* Recent Orders */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pesanan Terbaru</Text>
            {orders.map(order => (
              <Card key={order._id} style={styles.orderItem}>
                <View style={styles.orderTopRow}>
                  <Text style={styles.orderTitle}>{order.fuelType} · {order.liters}L</Text>
                  <Text style={styles.orderPrice}>{formatIDR(order.totalPrice)}</Text>
                </View>
                <View style={styles.orderDetailRow}>
                  <Text style={styles.orderUser}>{order.userId?.name || 'Unknown'}</Text>
                  <Badge label={order.status} status={order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'error' : 'warning'} />
                </View>
                <Text style={styles.orderMeta}>{formatDate(order.createdAt)} · {order.paymentMethod.toUpperCase()}</Text>
              </Card>
            ))}
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  inner: { width: '100%', maxWidth: 1024, alignSelf: 'center', gap: Spacing.xl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { ...Typography.h2, color: Colors.text },
  subtitle: { ...Typography.bodySmall, color: Colors.textMuted },
  headerActions: { flexDirection: 'row', gap: Spacing.sm },
  refreshBtn: { padding: Spacing.sm, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md },
  signOutBtn: { padding: Spacing.sm, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  statCard: { flex: 1, minWidth: 250, padding: Spacing.lg },
  statIconBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md },
  statLabel: { ...Typography.bodySmall, color: Colors.textMuted, marginBottom: 4 },
  statValue: { ...Typography.h3, color: Colors.text },
  section: { gap: Spacing.md },
  sectionTitle: { ...Typography.h3, color: Colors.text },
  fuelGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  fuelCard: { flex: 1, minWidth: 200, padding: Spacing.lg },
  fuelName: { ...Typography.body, fontWeight: '700', color: Colors.text },
  fuelRon: { ...Typography.caption, color: Colors.textMuted, marginBottom: Spacing.sm },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fuelPrice: { ...Typography.h3, color: Colors.primary },
  editRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  editInput: { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.sm, padding: Spacing.xs, ...Typography.body },
  saveBtn: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: BorderRadius.sm },
  saveBtnText: { color: 'white', ...Typography.caption, fontWeight: '700' },
  cancelBtn: { padding: Spacing.xs },
  orderItem: { padding: Spacing.md, marginBottom: Spacing.sm },
  orderTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
  orderTitle: { ...Typography.body, fontWeight: '700' },
  orderPrice: { ...Typography.body, fontWeight: '700', color: Colors.primary },
  orderDetailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  orderUser: { ...Typography.bodySmall, color: Colors.textMuted },
  orderMeta: { ...Typography.caption, color: Colors.textMuted },
});
