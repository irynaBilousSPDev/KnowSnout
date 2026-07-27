import { useFocusEffect, router } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { LoadingState } from '@/src/components/LoadingState';
import { PetAvatar } from '@/src/components/PetAvatar';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import { listDmThreads, type DmThread } from '@/src/services/dm';
import { brand } from '@/src/theme/brand';

export default function MessagesScreen() {
  const [threads, setThreads] = useState<DmThread[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setThreads(await listDmThreads());
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  if (loading) {
    return (
      <AppScreen>
        <LoadingState message={t('dm.loading')} />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <FlatList
        data={threads}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 40, flexGrow: 1 }}
        ListEmptyComponent={
          <View className="mt-16 items-center px-6">
            <Text className="text-center font-body text-forest-600">
              {t('dm.empty')}
            </Text>
            <Text className="mt-2 text-center font-body text-xs text-forest-500">
              {t('dm.emptyHint')}
            </Text>
            <View className="mt-6 w-full">
              <PrimaryButton
                label={t('dm.openFeed')}
                onPress={() => router.push('/(app)/(tabs)/stories')}
              />
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/(app)/dm/[userId]',
                params: {
                  userId: item.peer.userId,
                  name: item.peer.name,
                  avatarKey: item.peer.avatarKey ?? '',
                },
              })
            }
            className="mb-3 flex-row items-center rounded-2xl border border-forest-100 bg-white px-4 py-3 active:opacity-80"
          >
            <PetAvatar
              avatarKey={item.peer.avatarKey || 'paw'}
              species="dog"
              size={44}
              name={item.peer.name}
            />
            <View className="ml-3 flex-1">
              <Text className="font-body-bold text-sm text-forest-900">
                {item.peer.name}
              </Text>
              <Text
                numberOfLines={1}
                className="mt-0.5 font-body text-xs text-forest-500"
              >
                {item.lastBody || t('dm.noPreview')}
              </Text>
            </View>
            <Text style={{ color: brand.mistBorder, fontSize: 18 }}>›</Text>
          </Pressable>
        )}
      />
    </AppScreen>
  );
}
