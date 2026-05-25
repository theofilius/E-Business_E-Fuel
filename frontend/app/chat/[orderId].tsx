import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { chatService } from '../../services/chatService';
import { getSocket } from '../../services/socket';
import { useAuthStore } from '../../store/useAuthStore';
import { ChatMessage } from '../../types';

export default function ChatScreen() {
  const { orderId, driverName } = useLocalSearchParams<{ orderId: string; driverName?: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { width } = useWindowDimensions();
  const isMobile = width <= 480;
  const imageSize = Math.min(Math.max(width * (isMobile ? 0.58 : 0.28), 160), 220);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [failedImageIds, setFailedImageIds] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');

  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  // ─── Load messages on mount ───────────────────────────────────────────────
  useEffect(() => {
    if (!orderId) return;

    let mounted = true;
    chatService
      .getMessages(orderId)
      .then((data) => {
        if (!mounted) return;
        setMessages(data.messages);
        setLoading(false);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e.message);
        setLoading(false);
      });

    // ─── Socket: listen for incoming messages ─────────────────────────────
    const socket = getSocket();
    socket.emit('join_order', orderId);

    const onChatMessage = (msg: ChatMessage) => {
      setMessages((prev) => {
        // Deduplicate by _id
        if (prev.find((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      // Auto-scroll
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    };
    socket.on('chat_message', onChatMessage);

    return () => {
      mounted = false;
      socket.off('chat_message', onChatMessage);
      // Don't leave_order here — order tracking screen might still be mounted
    };
  }, [orderId]);

  // ─── Scroll to bottom when messages load ─────────────────────────────────
  useEffect(() => {
    if (!loading && messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 150);
    }
  }, [loading, messages.length]);

  // ─── Send text ────────────────────────────────────────────────────────────
  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || !orderId || sending) return;

    setSending(true);
    const draft = text;
    setText('');
    try {
      await chatService.sendMessage(orderId, trimmed);
      // Server emits back via socket — message will appear via onChatMessage
    } catch (e: any) {
      setText(draft); // restore on failure
      Alert.alert('Gagal kirim', e.message);
    } finally {
      setSending(false);
    }
  };

  // ─── Pick & upload image ──────────────────────────────────────────────────
  const handlePickImage = async () => {
    if (!orderId) return;

    // On native, ask for library permission first
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin ditolak', 'Aplikasi membutuhkan akses galeri untuk mengirim foto.');
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: false,
    });

    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    const uri  = asset.uri;
    const name = asset.fileName || uri.split('/').pop() || `photo_${Date.now()}.jpg`;
    const type = asset.mimeType || 'image/jpeg';

    setUploadingImage(true);
    setUploadError('');
    try {
      await chatService.uploadImage(orderId, uri, name, type);
      // Message arrives via socket
    } catch (e: any) {
      const message = e.message || 'Gagal upload gambar';
      setUploadError(message);
      Alert.alert('Gagal upload', message);
    } finally {
      setUploadingImage(false);
    }
  };

  // ─── Render each bubble ───────────────────────────────────────────────────
  const renderItem = useCallback(
    ({ item }: { item: ChatMessage }) => {
      const senderId =
        typeof item.senderId === 'object' ? item.senderId._id : item.senderId;
      const isMe = senderId === user?._id;
      const senderName =
        typeof item.senderId === 'object' ? item.senderId.name : '';
      const imageUri = item.imageUrl ? chatService.resolveImageUrl(item.imageUrl) : '';
      const imageFailed = failedImageIds[item._id];
      const time = new Date(item.createdAt).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      });

      return (
        <View style={[styles.bubbleRow, isMe && styles.bubbleRowMe]}>
          {!isMe && (
            <View style={styles.avatarSmall}>
              <Text style={styles.avatarSmallText}>
                {senderName ? senderName.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
          )}
          <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
            {!isMe && senderName ? (
              <Text style={styles.senderName}>{senderName}</Text>
            ) : null}

            {item.type === 'image' ? (
              imageUri && !imageFailed ? (
                <View style={[styles.chatImageWrap, { width: imageSize, height: imageSize }]}>
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.chatImage}
                    resizeMode="cover"
                    onError={() => {
                      setFailedImageIds((prev) => ({ ...prev, [item._id]: true }));
                    }}
                  />
                </View>
              ) : (
                <View style={[styles.imageFallback, { width: imageSize }]}>
                  <Ionicons
                    name="image-outline"
                    size={20}
                    color={isMe ? Colors.textInverse : Colors.textMuted}
                  />
                  <Text style={[styles.imageFallbackText, isMe && styles.bubbleTextMe]}>
                    Foto tidak dapat dimuat
                  </Text>
                </View>
              )
            ) : (
              <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>
                {item.text}
              </Text>
            )}

            <Text style={[styles.bubbleTime, isMe && styles.bubbleTimeMe]}>
              {time}
            </Text>
          </View>
        </View>
      );
    },
    [failedImageIds, imageSize, user?._id]
  );

  // ─── Header title ─────────────────────────────────────────────────────────
  const headerTitle = driverName
    ? `Chat dengan ${driverName}`
    : user?.role === 'driver'
    ? 'Chat dengan Pelanggan'
    : 'Chat dengan Driver';

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, isMobile && styles.headerMobile]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerAvatar}>
            <Ionicons name="person" size={18} color={Colors.textInverse} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {headerTitle}
            </Text>
            <Text style={styles.headerSub}>
              Pesanan #{orderId?.slice(-6).toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Body */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.muted}>Memuat pesan…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
          <Text style={styles.muted}>{error}</Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="chatbubbles-outline" size={48} color={Colors.border} />
                <Text style={styles.emptyText}>
                  Belum ada pesan. Mulai percakapan!
                </Text>
              </View>
            }
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
          />

          {uploadError ? (
            <View style={styles.inlineError}>
              <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
              <Text style={styles.inlineErrorText}>{uploadError}</Text>
            </View>
          ) : null}

          {/* Input bar */}
          <View style={styles.inputBar}>
            <TouchableOpacity
              style={styles.attachBtn}
              onPress={handlePickImage}
              disabled={uploadingImage || sending}
            >
              {uploadingImage ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Ionicons name="image-outline" size={22} color={Colors.primary} />
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="Ketik pesan…"
              placeholderTextColor={Colors.textMuted}
              multiline
              maxLength={500}
              returnKeyType="default"
            />

            <TouchableOpacity
              style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!text.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={18} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
    ...Shadows.small,
  },
  headerMobile: {
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
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
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Typography.body,
    fontWeight: '700',
    color: Colors.text,
  },
  headerSub: {
    ...Typography.caption,
    color: Colors.textMuted,
  },

  // Center states
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  muted: { ...Typography.bodySmall, color: Colors.textMuted, textAlign: 'center' },

  // List
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    flexGrow: 1,
  },

  // Empty state
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: Spacing.md,
  },
  emptyText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
  },

  // Bubble row
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  bubbleRowMe: { flexDirection: 'row-reverse' },

  // Small avatar for "them"
  avatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  avatarSmallText: { fontSize: 12, fontWeight: '700', color: Colors.textInverse },

  // Bubble
  bubble: {
    maxWidth: '75%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    paddingHorizontal: 12,
    ...Shadows.small,
  },
  bubbleMe: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  senderName: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 2,
  },
  bubbleText: { ...Typography.body, color: Colors.text, flexShrink: 1 },
  bubbleTextMe: { color: Colors.textInverse },
  bubbleTime: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  bubbleTimeMe: { color: 'rgba(255,255,255,0.7)' },

  // Image message
  chatImageWrap: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: Colors.background,
  },
  chatImage: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    minHeight: 92,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
  },
  imageFallbackText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  inlineError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  inlineErrorText: {
    ...Typography.caption,
    color: Colors.error,
    flex: 1,
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  attachBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    ...Typography.body,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.border },
});
