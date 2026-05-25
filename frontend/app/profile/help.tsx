import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const FAQ = [
  {
    q: 'Berapa lama pengiriman bensin tiba?',
    a: 'Estimasi 15–30 menit tergantung jarak dan ketersediaan driver di area Anda.',
  },
  {
    q: 'Apakah bisa memesan di luar jam operasional?',
    a: 'E-FUEL beroperasi 06.00–22.00 WIB setiap hari termasuk akhir pekan.',
  },
  {
    q: 'Apakah pembayaran tunai tersedia?',
    a: 'Ya, pembayaran tunai bisa dilakukan langsung ke driver saat bensin tiba.',
  },
  {
    q: 'Bagaimana cara mengajukan refund?',
    a: 'Buka menu Pesanan Saya, pilih pesanan selesai, lalu tekan tombol "Ajukan Refund".',
  },
  {
    q: 'Jenis bensin apa saja yang tersedia?',
    a: 'E-FUEL menyediakan IGNITE (RON 90), BLAZE (RON 92), QUANTUM (RON 98), dan DIESEL.',
  },
  {
    q: 'Apakah ada minimum pemesanan liter?',
    a: 'Minimum pemesanan adalah 1 liter, maksimum 200 liter per pesanan.',
  },
];

export default function HelpScreen() {
  const router   = useRouter();
  const [expanded, setExpanded] = useState<number | null>(null);

  // Demo form
  const [subject, setSubject]   = useState('');
  const [message, setMessage]   = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Isi subjek dan pesan terlebih dahulu.');
      } else {
        Alert.alert('Form Tidak Lengkap', 'Isi subjek dan pesan terlebih dahulu.');
      }
      return;
    }
    setSubmitting(true);
    // Simulate a 1-second network call (demo mode — no real backend)
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitting(false);
    setSubmitted(true);
    setSubject('');
    setMessage('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Bantuan & Dukungan</Text>
        </View>

        {/* CS contact card */}
        <Card style={styles.contactCard}>
          <View style={styles.contactRow}>
            <View style={styles.csIcon}>
              <Ionicons name="headset" size={28} color={Colors.textInverse} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactTitle}>Hubungi Customer Service</Text>
              <Text style={styles.contactSub}>Senin–Minggu, 06.00–22.00 WIB</Text>
            </View>
          </View>
          <View style={styles.contactBtns}>
            <TouchableOpacity
              style={styles.contactBtn}
              onPress={() => Linking.openURL('https://wa.me/6281234567890')}
            >
              <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
              <Text style={styles.contactBtnText}>WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contactBtn}
              onPress={() => Linking.openURL('mailto:cs@efuel.id')}
            >
              <Ionicons name="mail-outline" size={18} color={Colors.primary} />
              <Text style={styles.contactBtnText}>Email CS</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contactBtn}
              onPress={() => Linking.openURL('tel:+6281234567890')}
            >
              <Ionicons name="call-outline" size={18} color={Colors.primary} />
              <Text style={styles.contactBtnText}>Telepon</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* FAQ */}
        <Text style={styles.sectionTitle}>Pertanyaan Umum (FAQ)</Text>
        <Card style={styles.faqCard}>
          {FAQ.map((item, idx) => (
            <View key={idx}>
              <TouchableOpacity
                style={styles.faqRow}
                onPress={() => setExpanded(expanded === idx ? null : idx)}
              >
                <Text style={styles.faqQ} numberOfLines={expanded === idx ? undefined : 2}>
                  {item.q}
                </Text>
                <Ionicons
                  name={expanded === idx ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={Colors.textMuted}
                />
              </TouchableOpacity>
              {expanded === idx && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqA}>{item.a}</Text>
                </View>
              )}
              {idx < FAQ.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </Card>

        {/* Contact form */}
        <Text style={styles.sectionTitle}>Kirim Pesan ke Tim Kami</Text>
        {submitted ? (
          <Card style={styles.successCard}>
            <Ionicons name="checkmark-circle" size={36} color={Colors.success} />
            <Text style={styles.successTitle}>Pesan Terkirim!</Text>
            <Text style={styles.successSub}>
              Tim kami akan membalas dalam 1×24 jam ke email yang terdaftar.
            </Text>
            <Button
              title="Kirim Lagi"
              variant="outline"
              size="small"
              onPress={() => setSubmitted(false)}
              style={{ marginTop: Spacing.md }}
            />
          </Card>
        ) : (
          <Card style={styles.formCard}>
            <Text style={styles.fieldLabel}>Subjek</Text>
            <TextInput
              style={styles.input}
              value={subject}
              onChangeText={setSubject}
              placeholder="Contoh: Pesanan tidak tiba"
              placeholderTextColor={Colors.textMuted}
            />
            <Text style={[styles.fieldLabel, { marginTop: Spacing.md }]}>Pesan</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={message}
              onChangeText={setMessage}
              placeholder="Ceritakan masalah Anda…"
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{message.length}/500</Text>
            <Button
              title={submitting ? 'Mengirim…' : 'Kirim Pesan'}
              onPress={handleSubmit}
              disabled={submitting}
              isLoading={submitting}
              style={{ marginTop: Spacing.md }}
            />
          </Card>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xxl * 2, gap: Spacing.md },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...Typography.h2, color: Colors.text },

  // Contact card
  contactCard: { padding: Spacing.lg },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  csIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactTitle: { ...Typography.bodyLarge, fontWeight: '800', color: Colors.text },
  contactSub: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  contactBtns: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  contactBtnText: { ...Typography.caption, fontWeight: '700', color: Colors.text },

  // FAQ
  sectionTitle: { ...Typography.h3, color: Colors.text, marginTop: Spacing.sm },
  faqCard: { padding: 0, overflow: 'hidden' },
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    gap: Spacing.sm,
  },
  faqQ: { ...Typography.body, fontWeight: '600', color: Colors.text, flex: 1 },
  faqAnswer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 14,
  },
  faqA: { ...Typography.bodySmall, color: Colors.textMuted, lineHeight: 20 },
  divider: { height: 1, backgroundColor: Colors.borderLight },

  // Form
  formCard: { padding: Spacing.lg },
  fieldLabel: { ...Typography.caption, fontWeight: '700', color: Colors.textMuted, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    ...Typography.body,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  textarea: { minHeight: 100, textAlignVertical: 'top' },
  charCount: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },

  // Success
  successCard: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  successTitle: { ...Typography.h3, color: Colors.success },
  successSub: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
