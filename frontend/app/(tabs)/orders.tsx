import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useOrderStore } from '../../store/useOrderStore';

export default function OrdersScreen() {
  const { orders, fetchOrders, isLoading } = useOrderStore();

  useEffect(() => {
    fetchOrders();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <Card style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        <Badge label={item.status} status={item.status === 'completed' ? 'success' : 'warning'} />
      </View>
      <View style={styles.orderDetails}>
        <Text style={styles.fuelType}>{item.fuelType} ({item.liters}L)</Text>
        <Text style={styles.price}>Rp {item.totalPrice.toLocaleString('id-ID')}</Text>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Orders</Text>
      </View>
      
      {isLoading && orders.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No orders found</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
  },
  listContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
  orderCard: {
    marginBottom: Spacing.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  orderDate: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fuelType: {
    ...Typography.bodyLarge,
    color: Colors.text,
    fontWeight: '600',
  },
  price: {
    ...Typography.bodyLarge,
    color: Colors.primary,
    fontWeight: '700',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textMuted,
  }
});
