import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/useAuthStore';

export default function ProfileScreen() {
  const { user, signOut, updateProfile } = useAuthStore();

  const [editing, setEditing]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [name, setName]           = useState(user?.name || '');
  const [phone, setPhone]         = useState(user?.phone || '');
  const [address, setAddress]     = useState(user?.address || '');
  const [saveError, setSaveError] = useState('');
  const [saveOk, setSaveOk]       = useState(false);

  // Sync fields if user object changes (e.g. after restoreToken)
  useEffect(() => {
    if (!editing) {
      setName(user?.name || '');
      setPhone(user?.phone || '');
      setAddress(user?.address || '');
    }
  }, [user, editing]);

  const handleSave = async () => {
    if (!name.trim()) {
      setSaveError('Nama tidak boleh kosong');
      return;
    }
    setSaveError('');
    setSaveOk(false);
    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), phone: phone.trim(), address: address.trim() });
      setSaveOk(true);
      setEditing(false);
      setTimeout(() => setSaveOk(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Gagal menyimpan profil');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setSaveError('');
    setName(user?.name || '');
    setPhone(user?.phone || '');
    setAddress(user?.address || '');
  };

  const handleSignOut = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Yakin ingin keluar?')) signOut();
    } else {
      Alert.alert('Log Out', 'Yakin ingin keluar?', [
        { text: 'Batal', style: 'cancel' },
        { text: 'Keluar', style: 'destructive', onPress: () => signOut() },
      ]);
    }
  };

  const initials = (user?.name || 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const isPremium = user?.isPremium;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        <View style={styles.topHeader}>
          <Text style={styles.pageTitle}>Profile</Text>
          {!editing && (
            <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
              <Ionicons name="pencil-outline" size={16} color={Colors.primary} />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Avatar + name */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, isPremium && styles.avatarPremium]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          {isPremium && (
            <View style={styles.premiumBadge}>
              <Ionicons name="star" size={12} color="#fff" />
              <Text style={styles.premiumBadgeText}>PREMIUM</Text>
            </View>
          )}
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={styles.rolePill}>
            <Text style={styles.rolePillText}>{user?.role?.toUpperCase() || 'CUSTOMER'}</Text>
          </View>
        </View>

        {/* Success banner */}
        {saveOk && (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
            <Text style={styles.successText}>Profil berhasil disimpan!</Text>
          </View>
        )}

        {/* Error banner */}
        {!!saveError && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color={Colors.error} />
            <Text style={styles.errorText}>{saveError}</Text>
          </View>
        )}

        {/* Profile form */}
        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Informasi Akun</Text>

          {/* Nama */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Nama Lengkap</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Nama lengkap"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="words"
              />
            ) : (
              <Text style={styles.fieldValue}>{user?.name || '-'}</Text>
            )}
          </View>

          {/* Email (readonly) */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email</Text>
            <View style={styles.readonlyRow}>
              <Text style={styles.fieldValue}>{user?.email || '-'}</Text>
              <View style={styles.readonlyBadge}>
                <Text style={styles.readonlyBadgeText}>Tidak dapat diubah</Text>
              </View>
            </View>
          </View>

          {/* Telepon */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Nomor Telepon</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="08xxxxxxxxxx"
                placeholderTextColor={Colors.textMuted}
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.fieldValue}>{user?.phone || '-'}</Text>
            )}
          </View>

          {/* Alamat */}
          <View style={[styles.field, { borderBottomWidth: 0 }]}>
            <Text style={styles.fieldLabel}>Alamat Pengiriman Default</Text>
            {editing ? (
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={address}
                onChangeText={setAddress}
                placeholder="Jl. Nama Jalan, Kota, Kode Pos"
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            ) : (
              <Text style={styles.fieldValue}>{user?.address || '-'}</Text>
            )}
          </View>
        </Card>

        {/* Premium status card */}
        <Card style={[styles.premiumCard, isPremium ? styles.premiumCardActive : styles.premiumCardBasic]}>
          <View style={styles.premiumRow}>
            <View>
              <Text style={styles.premiumCardTitle}>
                {isPremium ? '⭐ Premium Member' : '🔓 Akun Basic'}
              </Text>
              <Text style={styles.premiumCardSub}>
                {isPremium
                  ? `Aktif hingga ${user?.premiumUntil ? new Date(user.premiumUntil).toLocaleDateString('id-ID') : '-'}`
                  : 'Upgrade ke Premium untuk diskon & ongkir gratis'}
              </Text>
            </View>
            {!isPremium && (
              <View style={styles.upgradePill}>
                <Text style={styles.upgradePillText}>Upgrade</Text>
              </View>
            )}
          </View>
        </Card>

        {/* Edit action buttons */}
        {editing && (
          <View style={styles.editActions}>
            <Button
              title="Batal"
              variant="outline"
              onPress={handleCancel}
              style={{ flex: 1 }}
            />
            <Button
              title={saving ? 'Menyimpan…' : 'Simpan Perubahan'}
              onPress={handleSave}
              disabled={saving}
              isLoading={saving}
              style={{ flex: 1 }}
            />
          </View>
        )}

        {/* Other menu */}
        <Card style={styles.menuCard} variant="outlined">
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Alert.alert('Segera Hadir', 'Metode pembayaran akan hadir segera.')}
          >
            <Ionicons name="card-outline" size={22} color={Colors.text} />
            <Text style={styles.menuText}>Metode Pembayaran</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Alert.alert('Segera Hadir', 'Fitur bantuan akan hadir segera.')}
          >
            <Ionicons name="help-circle-outline" size={22} color={Colors.text} />
            <Text style={styles.menuText}>Bantuan & Dukungan</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </Card>

        <Button
          title="Log Out"
          variant="outline"
          onPress={handleSignOut}
          style={styles.logoutBtn}
          icon={<Ionicons name="log-out-outline" size={20} color={Colors.primary} />}
        />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing.xxl * 2 },

  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  pageTitle: { ...Typography.h1, color: Colors.text },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  editBtnText: { ...Typography.bodySmall, fontWeight: '700', color: Colors.primary },

  avatarSection: { alignItems: 'center', marginBottom: Spacing.xl },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    ...Shadows.medium,
  },
  avatarPremium: { backgroundColor: '#7C3AED' },
  avatarText: { ...Typography.h2, color: Colors.textInverse },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.pill,
    marginBottom: Spacing.sm,
  },
  premiumBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  userName: { ...Typography.h3, color: Colors.text, marginBottom: 2 },
  userEmail: { ...Typography.bodySmall, color: Colors.textMuted, marginBottom: Spacing.sm },
  rolePill: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
  },
  rolePillText: { ...Typography.caption, color: Colors.primary, fontWeight: '800', letterSpacing: 1 },

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
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#FEF2F2',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: { ...Typography.bodySmall, color: Colors.error, flex: 1 },

  formCard: { padding: Spacing.lg, marginBottom: Spacing.md },
  sectionTitle: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.md, fontSize: 17 },
  field: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    marginBottom: Spacing.sm,
  },
  fieldLabel: { ...Typography.caption, color: Colors.textMuted, fontWeight: '700', marginBottom: 4 },
  fieldValue: { ...Typography.body, color: Colors.text },
  readonlyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  readonlyBadge: {
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.pill,
  },
  readonlyBadgeText: { ...Typography.caption, color: Colors.textMuted },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    ...Typography.body,
    color: Colors.text,
    backgroundColor: Colors.surface,
    marginTop: 4,
  },
  inputMultiline: { minHeight: 60, textAlignVertical: 'top' },

  premiumCard: { padding: Spacing.lg, marginBottom: Spacing.md },
  premiumCardActive: { backgroundColor: '#F5F3FF', borderWidth: 1, borderColor: '#C4B5FD' },
  premiumCardBasic: { backgroundColor: Colors.secondary, borderWidth: 1, borderColor: Colors.border },
  premiumRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  premiumCardTitle: { ...Typography.bodyLarge, fontWeight: '800', color: Colors.text, marginBottom: 2 },
  premiumCardSub: { ...Typography.bodySmall, color: Colors.textMuted },
  upgradePill: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.pill,
  },
  upgradePillText: { ...Typography.caption, color: '#fff', fontWeight: '800' },

  editActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },

  menuCard: { padding: 0, overflow: 'hidden', marginBottom: Spacing.xl },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  menuText: { ...Typography.body, color: Colors.text, flex: 1 },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: Spacing.md },
  logoutBtn: {},
});
