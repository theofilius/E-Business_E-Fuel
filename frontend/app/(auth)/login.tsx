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

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, isLoading } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { width } = useWindowDimensions();
  const isDesktop = width > 1024;
  
  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email dan password wajib diisi');
      return;
    }
    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (err) {
      setError('Email atau password salah');
    }
  };

  const renderForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.title}>Selamat datang kembali!</Text>
      <Text style={styles.subtitle}>Masukkan detail akun Anda untuk melanjutkan.</Text>

      <View style={styles.form}>
        <Input
          label="Email"
          placeholder="nama@email.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Input
          label="Password"
          placeholder="Masukkan kata sandi"
          value={password}
          onChangeText={setPassword}
          isPassword
        />
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity style={styles.forgotBtn}>
          <Text style={styles.forgotText}>Lupa kata sandi?</Text>
        </TouchableOpacity>

        <Button 
          title="Masuk" 
          onPress={handleLogin} 
          isLoading={isLoading}
          style={styles.loginBtn}
        />

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>atau</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.googleBtn}>
          <Ionicons name="logo-google" size={20} color="#EA4335" />
          <Text style={styles.googleBtnText}>Masuk dengan Google</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Belum punya akun E-Fuel? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.registerLink}>Daftar Sekarang</Text>
          </TouchableOpacity>
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -Spacing.md,
  },
  forgotText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '700',
  },
  errorText: {
    color: Colors.error,
    ...Typography.caption,
    textAlign: 'center',
  },
  loginBtn: {
    height: 54,
    backgroundColor: '#334E52',
    borderRadius: 8,
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
  registerLink: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '800',
  }
});
