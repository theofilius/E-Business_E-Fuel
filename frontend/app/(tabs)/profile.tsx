import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/useAuthStore';

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
          </View>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <Text style={styles.email}>{user?.email || 'user@example.com'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role || 'Customer'}</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          <Card style={styles.menuCard} variant="outlined">
            <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Segera Hadir', 'Fitur ini masih dalam tahap pengembangan.')}>
              <Ionicons name="person-outline" size={24} color={Colors.text} />
              <Text style={styles.menuText}>Edit Profile</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Segera Hadir', 'Fitur ini masih dalam tahap pengembangan.')}>
              <Ionicons name="card-outline" size={24} color={Colors.text} />
              <Text style={styles.menuText}>Payment Methods</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Segera Hadir', 'Fitur ini masih dalam tahap pengembangan.')}>
              <Ionicons name="help-circle-outline" size={24} color={Colors.text} />
              <Text style={styles.menuText}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </Card>
        </View>

        <Button 
          title="Log Out" 
          variant="outline" 
          onPress={signOut}
          style={styles.logoutBtn}
          icon={<Ionicons name="log-out-outline" size={20} color={Colors.primary} />}
        />

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
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    ...Typography.h1,
    color: Colors.textInverse,
  },
  name: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: 4,
  },
  email: {
    ...Typography.body,
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  roleBadge: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleText: {
    ...Typography.caption,
    color: Colors.primary,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  menuSection: {
    marginBottom: Spacing.xl,
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  menuText: {
    ...Typography.bodyLarge,
    color: Colors.text,
    flex: 1,
    marginLeft: Spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  logoutBtn: {
    marginTop: 'auto',
  }
});
