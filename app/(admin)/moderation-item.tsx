import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { LoadingState } from '@/src/components/LoadingState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import {
  decideModerationItem,
  getModerationItem,
  type ModerationItem,
} from '@/src/services/adminModeration';
import { brand } from '@/src/theme/brand';

export default function AdminModerationItemScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [item, setItem] = useState<ModerationItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!id) {
        setItem(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      void getModerationItem(id)
        .then(setItem)
        .finally(() => setLoading(false));
    }, [id]),
  );

  const decide = async (status: 'approved' | 'rejected') => {
    if (!id) return;
    setBusy(true);
    try {
      const next = await decideModerationItem(id, status);
      setItem(next);
      notify(
        t('common.ok'),
        status === 'approved'
          ? t('admin.approved')
          : t('admin.rejected'),
      );
      router.back();
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <LoadingState message={t('common.loading')} />;
  }

  if (!item) {
    return (
      <AppScreen edges={['bottom']}>
        <View style={styles.pad}>
          <ScreenHeader title={t('admin.missing')} />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen edges={['bottom']}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader title={item.title} subtitle={item.type} />
          <Text style={styles.body}>{item.summary}</Text>
          <Text style={styles.meta}>
            {t(`admin.status.${item.status}`)}
          </Text>
          {item.status === 'pending' ? (
            <>
              <View style={styles.gap} />
              <PrimaryButton
                label={t('admin.approve')}
                loading={busy}
                onPress={() => void decide('approved')}
              />
              <View style={styles.gapSm} />
              <PrimaryButton
                label={t('admin.reject')}
                variant="danger"
                loading={busy}
                onPress={() => void decide('rejected')}
              />
            </>
          ) : null}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  body: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: brand.ink,
  },
  meta: {
    marginTop: 10,
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: brand.tealPressed,
  },
  gap: { height: 16 },
  gapSm: { height: 10 },
});
