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

import { AppScreen } from '@/src/components/AppScreen';
import { ErrorState } from '@/src/components/ErrorState';
import { LoadingState } from '@/src/components/LoadingState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import {
  listDmMessages,
  openDmThread,
  sendDmMessage,
  type DmMessage,
  type DmThread,
} from '@/src/services/dm';
import { brand, fonts } from '@/src/theme/brand';

/** HTML kit · Чат — розмова. Accent bubbles, soft canvas. */
export default function DmThreadScreen() {
  const params = useLocalSearchParams<{
    userId?: string;
    name?: string;
    avatarKey?: string;
  }>();
  const peerId = typeof params.userId === 'string' ? params.userId : '';
  const peerName =
    typeof params.name === 'string' && params.name.trim()
      ? params.name
      : t('dm.unknownPeer');
  const avatarKey =
    typeof params.avatarKey === 'string' ? params.avatarKey : 'paw';

  const [thread, setThread] = useState<DmThread | null>(null);
  const [messages, setMessages] = useState<DmMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!peerId) {
      setError(t('dm.invalidPeer'));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const nextThread = await openDmThread({
        userId: peerId,
        name: peerName,
        avatarKey,
      });
      setThread(nextThread);
      setMessages(await listDmMessages(nextThread.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('dm.loadError'));
    } finally {
      setLoading(false);
    }
  }, [peerId, peerName, avatarKey]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const send = async () => {
    if (!thread || !draft.trim() || sending) return;
    setSending(true);
    try {
      const msg = await sendDmMessage(thread.id, draft);
      setMessages((prev) => [...prev, msg]);
      setDraft('');
    } catch {
      setError(t('dm.sendError'));
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <AppScreen>
        <LoadingState message={t('dm.loading')} />
      </AppScreen>
    );
  }

  if (error && !thread) {
    return (
      <AppScreen>
        <ErrorState message={error} onRetry={() => void load()} />
      </AppScreen>
    );
  }

  return (
    <AppScreen edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{peerName}</Text>
          <Text style={styles.hint}>{t('dm.threadHint')}</Text>
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>{t('dm.threadEmpty')}</Text>
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.mine ? styles.bubbleMine : styles.bubblePeer,
              ]}
            >
              <Text
                style={[
                  styles.bubbleText,
                  item.mine ? styles.bubbleTextMine : styles.bubbleTextPeer,
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
            placeholder={t('dm.placeholder')}
            placeholderTextColor={brand.mutedSoft}
            multiline
            style={styles.input}
          />
          <View style={styles.sendBtn}>
            <PrimaryButton
              label={t('dm.send')}
              size="sm"
              loading={sending}
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.mistBorder,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: 22,
    lineHeight: 28,
    color: brand.ink,
  },
  hint: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
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
  bubblePeer: {
    alignSelf: 'flex-start',
    backgroundColor: brand.surfaceElevated,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  bubbleText: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleTextMine: { color: '#FFFFFF' },
  bubbleTextPeer: { color: brand.ink },
  composer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: brand.mistBorder,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: brand.canvas,
  },
  error: {
    marginBottom: 8,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.score.poor,
  },
  input: {
    minHeight: 44,
    maxHeight: 112,
    borderRadius: brand.radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: fonts.body,
    fontSize: 15,
    color: brand.ink,
    textAlignVertical: 'top',
  },
  sendBtn: { marginTop: 10 },
});
