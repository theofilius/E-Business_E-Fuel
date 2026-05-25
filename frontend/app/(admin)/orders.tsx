import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import api from '../../services/api';

const formatIDR = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

type TabType = 'Semua' | 'Baru' | 'Diantar' | 'Selesai' | 'Batal';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('Semua');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/orders?limit=100'); // Fetch enough for client side filtering
      setOrders(res.data.data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getFilteredOrders = () => {
    if (activeTab === 'Semua') return orders;
    if (activeTab === 'Baru') return orders.filter(o => o.status === 'pending');
    if (activeTab === 'Diantar') return orders.filter(o => ['accepted', 'on_the_way', 'arrived', 'fueling'].includes(o.status));
    if (activeTab === 'Selesai') return orders.filter(o => o.status === 'delivered');
    if (activeTab === 'Batal') return orders.filter(o => o.status === 'cancelled');
    return orders;
  };

  const filteredOrders = getFilteredOrders();

  const getTabCount = (tab: TabType) => {
    if (tab === 'Semua') return orders.length;
    if (tab === 'Baru') return orders.filter(o => o.status === 'pending').length;
    if (tab === 'Diantar') return orders.filter(o => ['accepted', 'on_the_way', 'arrived', 'fueling'].includes(o.status)).length;
    if (tab === 'Selesai') return orders.filter(o => o.status === 'delivered').length;
    if (tab === 'Batal') return orders.filter(o => o.status === 'cancelled').length;
    return 0;
  };

  const tabs: TabType[] = ['Semua', 'Baru', 'Diantar', 'Selesai', 'Batal'];

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Kelola Order</Text>

      <View style={styles.tabsContainer}>
        {tabs.map(tab => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab} ({getTabCount(tab)})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Card style={styles.tableCard}>
        {loading && orders.length === 0 ? (
          <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tableMinWidth}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 1.5 }]}>Order ID</Text>
              <Text style={[styles.th, { flex: 2 }]}>Pelanggan</Text>
              <Text style={[styles.th, { flex: 2 }]}>BBM & Jumlah</Text>
              <Text style={[styles.th, { flex: 3 }]}>Alamat</Text>
              <Text style={[styles.th, { flex: 1.5 }]}>Total</Text>
              <Text style={[styles.th, { flex: 1 }]}>Status</Text>
            </View>

            {filteredOrders.length === 0 ? (
              <Text style={styles.emptyText}>Tidak ada pesanan untuk kategori ini.</Text>
            ) : (
              filteredOrders.map(order => (
                <View key={order._id} style={styles.tableRow}>
                  <Text style={[styles.td, { flex: 1.5 }]} selectable>
                    #ORD-{order._id.substring(order._id.length - 4).toUpperCase()}
                  </Text>
                  <Text style={[styles.td, { flex: 2 }]}>{order.userId?.name || 'Customer'}</Text>
                  <Text style={[styles.td, { flex: 2 }]}>{order.fuelType} {order.liters}L</Text>
                  <Text style={[styles.td, { flex: 3 }]} numberOfLines={2}>
                     {order.location?.address || 'Simulasi GPS Alamat'}
                  </Text>
                  <Text style={[styles.td, { flex: 1.5 }]}>{formatIDR(order.totalPrice)}</Text>
                  <View style={{ flex: 1, alignItems: 'flex-start' }}>
                    <Badge 
                      label={
                        order.status === 'pending' ? 'Baru' : 
                        order.status === 'delivered' ? 'Selesai' : 
                        order.status === 'cancelled' ? 'Batal' : 
                        'Diantar'
                      } 
                      status={
                        order.status === 'delivered' ? 'success' : 
                        order.status === 'pending' ? 'info' : 
                        order.status === 'cancelled' ? 'error' : 
                        'warning'
                      } 
                    />
                  </View>
                </View>
              ))
            )}
          </View>
          </ScrollView>
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
  },
  center: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
    flexWrap: 'wrap',
  },
  tabBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#FFFFFF',
  },
  tabBtnActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.primaryLight,
  },
  tabText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  tableCard: {
    padding: 0,
    overflow: 'hidden',
  },
  tableMinWidth: {
    minWidth: 920,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  th: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  td: {
    ...Typography.bodySmall,
    color: Colors.text,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    padding: Spacing.xxl,
  }
});
