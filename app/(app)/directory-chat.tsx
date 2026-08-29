import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ErrorState } from '@/src/components/ErrorState';
import { LoadingState } from '@/src/components/LoadingState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import {
  listDirectoryChatMessages,
  sendDirectoryChatMessage,
  type DirectoryChatMessage,
} from '@/src/services/directoryChat';
import { getDirectoryPlace } from '@/src/services/directories';
import { brand, fonts } from '@/src/theme/brand';

/** HTML kit · Чат з місцем — accent mine bubbles. */
export default function DirectoryChatScreen() {
  const params = useLocalSearchParams<{ placeId?: string }>();
  const placeId = typeof params.placeId === 'string' ? params.placeId : '';

  const [placeName, setPlaceName] = useState('');
  const [messages, setMessages] = useState<DirectoryChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!placeId) {
      setError(t('directories.chatMissing'));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const place = await getDirectoryPlace(placeId);
      if (!place) {
        setError(t('directories.missing'));
        return;
      }
      setPlaceName(place.name);
      setMessages(await listDirectoryChatMessages(placeId));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('directories.chatLoadError'),
      );
    } finally {
      setLoading(false);
    }
  }, [placeId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const send = async () => {
    if (!placeId || !draft.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      await sendDirectoryChatMessage(placeId, draft);
      setDraft('');
      setMessages(await listDirectoryChatMessages(placeId));
    } catch {
      setError(t('directories.chatSendError'));
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <LoadingState message={t('directories.chatLoading')} />;
  }

  if (error && !placeName) {
    return <ErrorState message={error} onRetry={() => void load()} />;
  }

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader
        title={placeName || t('directories.chatTitle')}
        titleSize={18}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={styles.header}>
          <Text style={styles.hint}>{t('directories.chatHint')}</Text>
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>{t('directories.chatEmpty')}</Text>
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.mine ? styles.bubbleMine : styles.bubbleTheirs,
              ]}
            >
              <Text
                style={[
                  styles.bubbleText,
                  item.mine ? styles.bubbleTextMine : null,
                ]}
              >
                {item.body}
              </Text>
            </View>
          )}
        />

        <View style={styles.composer}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={t('directories.chatPlaceholder')}
            placeholderTextColor={brand.mutedSoft}
            multiline
            style={styles.input}
          />
          <View style={styles.sendWrap}>
            <PrimaryButton
              label={t('directories.chatSend')}
              size="sm"
              loading={sending}
              disabled={!draft.trim()}
              onPress={() => void send()}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.mistBorder,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: 18,
    color: brand.ink,
  },
  hint: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
  },
  list: { padding: 16, paddingBottom: 24 },
  empty: {
    marginTop: 40,
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
  },
  bubble: {
    marginBottom: 8,
    maxWidth: '85%',
    borderRadius: brand.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMine: {
    alignSelf: 'flex-end',
    backgroundColor: brand.accent,
  },
  bubbleTheirs: {
    alignSelf: 'flex-start',
    backgroundColor: brand.surfaceElevated,
    borderWidth: 1,
    borderColor: brand.mistBorder,
  },
  bubbleText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.ink,
  },
  bubbleTextMine: { color: '#FFFFFF' },
  composer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: brand.mistBorder,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  error: {
    marginBottom: 8,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.terracotta,
  },
  input: {
    minHeight: 44,
    maxHeight: 112,
    borderRadius: brand.radius.md,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    color: brand.ink,
  },
  sendWrap: { marginTop: 10 },
});
