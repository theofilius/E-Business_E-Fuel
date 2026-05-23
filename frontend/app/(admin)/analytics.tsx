import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import api from '../../services/api';

const formatIDR = (n: number) => 'Rp ' + Math.round(n).toLocaleString('id-ID');

export default function AdminAnalytics() {
  const [stats, setStats] = useState<any>(null);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, driversRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/drivers')
      ]);
      setStats(statsRes.data.data);
      setDrivers(driversRes.data.data);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && !stats) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Fallback data for layout presentation matching Figma
  const revenue = stats?.revenue || 0;
  const totalOrder = stats?.totalOrders || 0;
  const avgOrderValue = totalOrder > 0 ? Math.round(revenue / totalOrder) : 0;
  const premiumUsers = 34; // Static mockup for premium users if we don't have it
  
  // Fuel chart data dynamic mapping
  const fuelColors: any = {
    'IGNITE': Colors.primary,
    'BLAZE': Colors.primaryLight,
    'QUANTUM': Colors.accent,
    'DIESEL': Colors.info
  };

  const dbFuelData = stats?.ordersByFuel || [];
  
  // Merge with defaults to ensure all 4 show up even if 0
  const defaultFuels = ['IGNITE', 'BLAZE', 'QUANTUM', 'DIESEL'];
  const fuelData = defaultFuels.map(f => {
    const found = dbFuelData.find((d: any) => d.name === f || d.name?.includes(f));
    return {
      name: f,
      count: found ? found.count : 0,
      color: fuelColors[f] || Colors.primary
    };
  });
  
  const maxCount = Math.max(...fuelData.map(d => d.count), 1); // use 1 as min to avoid div by zero

  // Find best seller
  const bestSeller = [...fuelData].sort((a, b) => b.count - a.count)[0];
  const bestSellerName = bestSeller.count > 0 ? bestSeller.name : '-';
  const bestSellerPercentage = totalOrder > 0 ? Math.round((bestSeller.count / totalOrder) * 100) : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Laporan & Analitik</Text>

      <View style={styles.topRow}>
        <Card style={styles.summaryCard}>
          <Text style={styles.sectionLabel}>Revenue minggu ini</Text>
          <Text style={styles.bigValue}>{formatIDR(revenue)}</Text>
          
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>BBM Terlaris</Text>
            <Text style={styles.dataValue}>{bestSellerName} ({bestSellerPercentage}%)</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Total Order</Text>
            <Text style={styles.dataValue}>{totalOrder} order</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Avg. order value</Text>
            <Text style={styles.dataValue}>{formatIDR(avgOrderValue)}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Pengguna premium</Text>
            <Text style={styles.dataValue}>{premiumUsers} user</Text>
          </View>
        </Card>

        <Card style={styles.chartCard}>
          <Text style={styles.sectionLabel}>Order per jenis BBM</Text>
          <View style={styles.chartContainer}>
            {fuelData.map((item, idx) => (
              <View key={idx} style={styles.barRow}>
                <Text style={styles.barLabel}>{item.name}</Text>
                <View style={styles.barTrack}>
                  <View 
                    style={[
                      styles.barFill, 
                      { width: `${(item.count / maxCount) * 100}%`, backgroundColor: item.color }
                    ]} 
                  />
                </View>
                <Text style={styles.barValue}>{item.count} Order</Text>
              </View>
            ))}
          </View>
        </Card>
      </View>

      <Card style={styles.tableCard}>
        <Text style={styles.cardTitle}>Performa Driver Bulan Ini</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.th, { flex: 2 }]}>Driver</Text>
          <Text style={[styles.th, { flex: 1.5 }]}>Total Order</Text>
          <Text style={[styles.th, { flex: 1 }]}>Selesai</Text>
          <Text style={[styles.th, { flex: 1 }]}>Batal</Text>
          <Text style={[styles.th, { flex: 1 }]}>Rating</Text>
          <Text style={[styles.th, { flex: 1.5 }]}>Avg Waktu</Text>
        </View>

        {drivers.length === 0 ? (
          <Text style={styles.emptyText}>Belum ada data driver.</Text>
        ) : (
          drivers.slice(0, 6).map((driver, idx) => {
            const mockRating = driver.rating ? driver.rating.toFixed(1) : "4.8";
            const dStats = driver.stats || { totalOrders: 0, completedOrders: 0, cancelledOrders: 0 };

            return (
              <View key={driver._id} style={styles.tableRow}>
                <Text style={[styles.td, { flex: 2, fontWeight: '600' }]}>{driver.name}</Text>
                <Text style={[styles.td, { flex: 1.5 }]}>{dStats.totalOrders}</Text>
                <Text style={[styles.td, { flex: 1 }]}>{dStats.completedOrders}</Text>
                <Text style={[styles.td, { flex: 1 }]}>{dStats.cancelledOrders}</Text>
                <Text style={[styles.td, { flex: 1, color: Colors.warning }]}>⭐ {mockRating}</Text>
                <Text style={[styles.td, { flex: 1.5 }]}>12 Menit</Text>
              </View>
            );
          })
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
    padding: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  summaryCard: {
    flex: 1,
    padding: Spacing.xl,
  },
  chartCard: {
    flex: 1,
    padding: Spacing.xl,
  },
  sectionLabel: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  bigValue: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  dataLabel: {
    ...Typography.bodySmall,
    color: Colors.text,
  },
  dataValue: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.text,
  },
  chartContainer: {
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  barLabel: {
    width: 80,
    ...Typography.caption,
    color: Colors.text,
  },
  barTrack: {
    flex: 1,
    height: 12,
    backgroundColor: Colors.borderLight,
    borderRadius: BorderRadius.pill,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: BorderRadius.pill,
  },
  barValue: {
    width: 60,
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'right',
  },
  tableCard: {
    padding: 0,
    overflow: 'hidden',
  },
  cardTitle: {
    ...Typography.h3,
    color: Colors.text,
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
