import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
import { brand } from '@/src/theme/brand';

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
    return <LoadingState message={t('dm.loading')} />;
  }

  if (error && !thread) {
    return <ErrorState message={error} onRetry={() => void load()} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: brand.surface }} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <View className="border-b border-forest-100 px-5 py-3">
          <Text className="font-display text-xl text-forest-900">{peerName}</Text>
          <Text className="mt-0.5 font-body text-xs text-forest-500">
            {t('dm.threadHint')}
          </Text>
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          ListEmptyComponent={
            <Text className="mt-10 text-center font-body text-sm text-forest-500">
              {t('dm.threadEmpty')}
            </Text>
          }
          renderItem={({ item }) => (
            <View
              style={{
                marginBottom: 8,
                maxWidth: '85%',
                borderRadius: 16,
                paddingHorizontal: 14,
                paddingVertical: 10,
                alignSelf: item.mine ? 'flex-end' : 'flex-start',
                backgroundColor: item.mine
                  ? brand.navy
                  : brand.surfaceElevated,
                borderWidth: item.mine ? 0 : 1,
                borderColor: brand.mistBorder,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 14,
                  color: item.mine ? brand.surface : brand.ink,
                }}
              >
                {item.body}
              </Text>
            </View>
          )}
        />

        <View className="border-t border-forest-100 px-4 pb-4 pt-3">
          {error ? (
            <Text className="mb-2 font-body text-xs text-score-poor">{error}</Text>
          ) : null}
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={t('dm.placeholder')}
            placeholderTextColor="#C8D2C4"
            multiline
            className="min-h-[44px] max-h-28 rounded-2xl border border-forest-200 bg-white px-4 py-3 font-body text-base text-forest-900"
          />
          <View className="mt-3">
            <PrimaryButton
              label={t('dm.send')}
              size="sm"
              loading={sending}
              onPress={() => void send()}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
