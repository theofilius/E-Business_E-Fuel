import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import api from '../../services/api';

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/drivers');
      setDrivers(res.data.data);
    } catch (err) {
      console.error('Failed to fetch drivers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleAction = (action: string) => {
    if (Platform.OS === 'web') {
      window.alert(`Segera Hadir: Fitur ${action} driver sedang dalam pengembangan.`);
    } else {
      Alert.alert('Segera Hadir', `Fitur ${action} driver sedang dalam pengembangan.`);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'DR';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Kelola Driver</Text>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>
      ) : (
        <View style={styles.grid}>
          {drivers.length === 0 ? (
            <Text style={styles.emptyText}>Belum ada data driver.</Text>
          ) : (
            drivers.map((driver) => {
              const status = driver.status || 'Aktif';
              const badgeStatus = status === 'Sibuk' ? 'warning' : status === 'Offline' ? 'error' : 'success';

              const driverRating = driver.rating != null ? driver.rating.toFixed(1) : '5.0';
              const ratingDisplay = driver.ratingCount
                ? `${driverRating} (${driver.ratingCount})`
                : driverRating;
              const totalOrder = driver.stats?.totalOrders || 0;

              return (
                <Card key={driver._id} style={styles.driverCard}>
                  <View style={styles.cardTop}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{getInitials(driver.name)}</Text>
                    </View>
                    <Text style={styles.driverName}>{driver.name}</Text>
                    <Text style={styles.driverVehicle}>{driver.vehicle || 'Honda Vario • B 1234 ABC'}</Text>
                    <View style={{ marginTop: Spacing.sm }}>
                       <Badge label={status} status={badgeStatus as any} />
                    </View>
                  </View>

                  <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                      <Text style={styles.statIcon}>⭐</Text>
                      <View>
                         <Text style={styles.statValue}>{ratingDisplay}</Text>
                      </View>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                      <View>
                        <Text style={styles.statLabel}>Total Order</Text>
                        <Text style={styles.statValue}>{totalOrder}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.btnOutline} onPress={() => handleAction('Profil')}>
                      <Text style={styles.btnOutlineText}>Profil</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnOutline} onPress={() => handleAction('Nonaktif')}>
                      <Text style={styles.btnOutlineText}>Nonaktif</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              );
            })
          )}
        </View>
      )}
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
  emptyText: {
    ...Typography.body,
    color: Colors.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg,
  },
  driverCard: {
    width: 280,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  cardTop: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 24,
  },
  driverName: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  driverVehicle: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.borderLight,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.borderLight,
  },
  statIcon: {
    fontSize: 16,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  statValue: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.text,
  },
  actionRow: {
    flexDirection: 'row',
    width: '100%',
    gap: Spacing.sm,
  },
  btnOutline: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  btnOutlineText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.textMuted,
  }
});
