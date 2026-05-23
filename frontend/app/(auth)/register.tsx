import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useAuthStore } from '../../store/useAuthStore';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FieldErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, isSubmitting, error, clearError } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const { width } = useWindowDimensions();
  const isDesktop = width > 1024;

  const validate = () => {
    const errs: FieldErrors = {};
    if (!name.trim()) errs.name = 'Nama wajib diisi';

    if (!email.trim()) errs.email = 'Email wajib diisi';
    else if (!EMAIL_REGEX.test(email.trim())) errs.email = 'Format email tidak valid';

    const phoneDigits = phone.replace(/\D/g, '');
    if (!phone.trim()) errs.phone = 'Nomor telepon wajib diisi';
    else if (phoneDigits.length < 9) errs.phone = 'Nomor telepon tidak valid';

    if (!password) errs.password = 'Password wajib diisi';
    else if (password.length < 6) errs.password = 'Password minimal 6 karakter';

    if (!confirmPassword) errs.confirmPassword = 'Ulangi password Anda';
    else if (password !== confirmPassword) errs.confirmPassword = 'Kata sandi tidak cocok';

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    try {
      await signUp({ name, email, password, phone });
      router.replace('/(tabs)');
    } catch {
      // server error is displayed via the store's `error`
    }
  };

  // Clear a field error (and any server error) as the user types
  const clearField = (field: keyof FieldErrors) => {
    if (fieldErrors[field]) setFieldErrors((e) => ({ ...e, [field]: undefined }));
    if (error) clearError();
  };

  const renderForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.title}>Selamat datang!</Text>
      <Text style={styles.subtitle}>Yuk! Buat akun E-Fuel sekarang.</Text>

      <View style={styles.form}>
        {error ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color={Colors.error} />
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        ) : null}

        <Input
          label="Nama"
          placeholder="Nama lengkap Anda"
          value={name}
          onChangeText={(v) => {
            setName(v);
            clearField('name');
          }}
          error={fieldErrors.name}
        />
        <Input
          label="Email"
          placeholder="nama@email.com"
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            clearField('email');
          }}
          autoCapitalize="none"
          keyboardType="email-address"
          error={fieldErrors.email}
        />
        <Input
          label="No. Telepon"
          placeholder="08xxxxxxxxxx"
          value={phone}
          onChangeText={(v) => {
            setPhone(v);
            clearField('phone');
          }}
          keyboardType="phone-pad"
          error={fieldErrors.phone}
        />
        <View style={styles.passwordRow}>
          <View style={styles.passwordCol}>
            <Input
              label="Password"
              placeholder="Min. 6 karakter"
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                clearField('password');
              }}
              isPassword
              error={fieldErrors.password}
            />
          </View>
          <View style={styles.passwordCol}>
            <Input
              label="Ketik Ulang Password"
              placeholder="Ulangi password"
              value={confirmPassword}
              onChangeText={(v) => {
                setConfirmPassword(v);
                clearField('confirmPassword');
              }}
              isPassword
              error={fieldErrors.confirmPassword}
            />
          </View>
        </View>

        <Button
          title="Daftar"
          onPress={handleRegister}
          isLoading={isSubmitting}
          style={styles.registerBtn}
        />

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>atau</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.googleBtn}>
          <Ionicons name="logo-google" size={20} color="#EA4335" />
          <Text style={styles.googleBtnText}>Daftar dengan Google</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Sudah punya akun E-Fuel? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginLink}>Masuk</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            • Dengan membuat akun E-Fuel, Anda telah setuju dengan Syarat & Ketentuan dan Kebijakan
            Privasi E-Fuel
          </Text>
          <Text style={styles.termsText}>
            • Email verifikasi akun akan dikirimkan ke email Anda, pastikan untuk mencantumkan email
            aktif Anda.
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.splitLayout}>
        {/* Left Panel */}
        {isDesktop && (
          <View style={styles.leftPanel}>
            <View style={styles.leftContent}>
              <View style={styles.dash} />
              <Text style={styles.promoTitle}>Fuel Delivered. So You{'\n'}Never Slow Down.</Text>
              <View style={styles.dash} />
            </View>
          </View>
        )}

        {/* Right Panel */}
        <View style={styles.rightPanel}>
          <ScrollView contentContainerStyle={styles.scrollContent}>{renderForm()}</ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  splitLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPanel: {
    flex: 4,
    backgroundColor: '#CFE2E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftContent: {
    maxWidth: 500,
    alignItems: 'center',
    gap: 40,
  },
  dash: {
    width: 80,
    height: 2,
    backgroundColor: '#000000',
  },
  promoTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 60,
  },
  rightPanel: {
    flex: 6,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Platform.OS === 'web' ? 80 : 20,
  },
  formContainer: {
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: '#000000',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textMuted,
    marginBottom: 40,
  },
  form: {
    gap: Spacing.lg,
  },
  passwordRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  passwordCol: {
    flex: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  errorBannerText: {
    color: Colors.error,
    ...Typography.bodySmall,
    fontWeight: '600',
    flex: 1,
  },
  registerBtn: {
    height: 54,
    backgroundColor: '#334E52',
    borderRadius: 8,
    marginTop: Spacing.md,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  dividerText: {
    paddingHorizontal: Spacing.md,
    color: Colors.textMuted,
    fontSize: 12,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: 54,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 8,
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  loginLink: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '800',
  },
  termsContainer: {
    marginTop: 40,
    gap: 8,
  },
  termsText: {
    fontSize: 10,
    color: Colors.textMuted,
    lineHeight: 14,
  },
});
