import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ErrorState } from '@/src/components/ErrorState';
import { LoadingState } from '@/src/components/LoadingState';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import {
  listDmMessages,
  openDmThread,
  sendDmMessage,
  type DmMessage,
  type DmThread,
} from '@/src/services/dm';
import { brand, fonts } from '@/src/theme/brand';

/** HTML · Чат — розмова. */
export default function DmThreadScreen() {
  const params = useLocalSearchParams<{
    userId?: string;
    name?: string;
    avatarKey?: string;
  }>();
  const peerId = typeof params.userId === 'string' ? params.userId : '';
  const paramName =
    typeof params.name === 'string' && params.name.trim()
      ? params.name.trim()
      : '';
  const avatarKey =
    typeof params.avatarKey === 'string' ? params.avatarKey : 'paw';
  const seedName =
    peerId === 'fu-1' ? 'Оксана' : peerId === 'fu-2' ? 'Ігор' : '';

  const [thread, setThread] = useState<DmThread | null>(null);
  const [messages, setMessages] = useState<DmMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walkOpen, setWalkOpen] = useState(true);

  const peerName =
    thread?.peer.name || paramName || seedName || t('dm.unknownPeer');

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
        name: paramName || seedName || t('dm.unknownPeer'),
        avatarKey,
      });
      setThread(nextThread);
      setMessages(await listDmMessages(nextThread.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('dm.loadError'));
    } finally {
      setLoading(false);
    }
  }, [peerId, paramName, seedName, avatarKey]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const showWalkInvite = peerId === 'fu-1' && walkOpen;

  const onWalkReply = async (coming: boolean) => {
    setWalkOpen(false);
    notify(
      t('common.ok'),
      coming ? t('walks.comingDone') : t('walks.cantDone'),
    );
  };
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
      <AppScreen edges={['bottom']}>
        <AppChromeHeader />
        <LoadingState message={t('dm.loading')} />
      </AppScreen>
    );
  }

  if (error && !thread) {
    return (
      <AppScreen>
        <AppChromeHeader />
        <ErrorState message={error} onRetry={() => void load()} />
      </AppScreen>
    );
  }

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={peerName} titleSize={18} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={88}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            showWalkInvite ? (
              <View style={styles.walkCard}>
                <View style={styles.walkKickerRow}>
                  <Ionicons name="calendar-outline" size={15} color={brand.accent} />
                  <Text style={styles.walkKicker}>{t('walks.kindWalk')}</Text>
                </View>
                <Text style={styles.walkTitle}>{t('walks.invitePlace')}</Text>
                <Text style={styles.walkMeta}>{t('walks.inviteWhen')}</Text>
                <View style={styles.walkRow}>
                  <Pressable
                    onPress={() => void onWalkReply(true)}
                    style={styles.walkOk}
                  >
                    <Text style={styles.walkOkT}>{t('walks.coming')}</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => void onWalkReply(false)}
                    style={styles.walkGhost}
                  >
                    <Text style={styles.walkGhostT}>{t('walks.cant')}</Text>
                  </Pressable>
                </View>
              </View>
            ) : null
          }
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
          <Pressable
            onPress={() => void send()}
            disabled={sending || !draft.trim()}
            style={[
              styles.sendIcon,
              (!draft.trim() || sending) && styles.sendIconDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t('dm.send')}
          >
            {sending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="send" size={18} color="#FFFFFF" />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    flexGrow: 1,
    gap: 8,
  },
  empty: {
    marginTop: 40,
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMine: {
    alignSelf: 'flex-end',
    backgroundColor: brand.accent,
    borderRadius: 16,
    borderBottomRightRadius: 4,
  },
  bubblePeer: {
    alignSelf: 'flex-start',
    backgroundColor: brand.surfaceElevated,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  bubbleText: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
  bubbleTextMine: { color: '#FFFFFF' },
  bubbleTextPeer: { color: brand.ink },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: brand.canvas,
  },
  error: {
    position: 'absolute',
    top: -18,
    left: 20,
    fontFamily: fonts.body,
    fontSize: 11,
    color: brand.score.poor,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 112,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.ink,
    textAlignVertical: 'top',
  },
  sendIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: brand.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIconDisabled: {
    opacity: 0.45,
  },
  walkCard: {
    alignSelf: 'flex-start',
    width: '82%',
    backgroundColor: brand.surfaceElevated,
    borderRadius: 16,
    padding: 14,
    gap: 8,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 2,
  },
  walkKickerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  walkKicker: {
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    color: brand.accent,
  },
  walkTitle: { fontFamily: fonts.bodyBold, fontSize: 13.5, color: brand.ink },
  walkMeta: { fontFamily: fonts.body, fontSize: 12, color: brand.muted },
  walkRow: { flexDirection: 'row', gap: 8, marginTop: 2 },
  walkOk: {
    flex: 1,
    backgroundColor: brand.accent,
    borderRadius: 12,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walkOkT: { fontFamily: fonts.bodySemi, fontSize: 12, color: '#fff' },
  walkGhost: {
    flex: 1,
    borderRadius: 12,
    height: 34,
    borderWidth: 1,
    borderColor: brand.divider,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.creamDeep,
  },
  walkGhostT: { fontFamily: fonts.bodySemi, fontSize: 12, color: brand.ink },
});
