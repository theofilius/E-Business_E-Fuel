import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { useAuthStore } from '../../store/useAuthStore';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, isLoading } = useAuthStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { width } = useWindowDimensions();
  const isDesktop = width > 1024;
  
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Semua bidang wajib diisi');
      return;
    }
    if (password !== confirmPassword) {
      setError('Kata sandi tidak cocok');
      return;
    }
    try {
      await signUp(name, email, password);
      router.replace('/(tabs)');
    } catch (err) {
      setError('Pendaftaran gagal. Silakan coba lagi.');
    }
  };

  const renderForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.title}>Selamat datang!</Text>
      <Text style={styles.subtitle}>Yuk! Buat akun E-Fuel sekarang.</Text>

      <View style={styles.form}>
        <Input
          label="Nama"
          placeholder="Nama"
          value={name}
          onChangeText={setName}
        />
        <Input
          label="Email"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <View style={styles.passwordRow}>
          <View style={{ flex: 1 }}>
            <Input
              label="Password"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              isPassword
            />
          </View>
          <View style={{ flex: 1 }}>
            <Input
              label="Ketik Ulang Password"
              placeholder="Ketik Ulang Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword
            />
          </View>
        </View>
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button 
          title="Daftar" 
          onPress={handleRegister} 
          isLoading={isLoading}
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
           <Text style={styles.termsText}>• Dengan membuat akun E-Fuel, Anda telah setuju dengan Syarat & Ketentuan dan Kebijakan Privasi Kardoos</Text>
           <Text style={styles.termsText}>• Email verifikasi akun akan dikirimkan ke email Anda, pastikan untuk mencantumkan email aktif Anda.</Text>
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
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {renderForm()}
          </ScrollView>
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
  errorText: {
    color: Colors.error,
    ...Typography.caption,
    textAlign: 'center',
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
  }
});
