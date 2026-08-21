import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { LoadingState } from '@/src/components/LoadingState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import {
  decideModerationItem,
  getModerationItem,
  type ModerationItem,
} from '@/src/services/adminModeration';
import { brand, fonts } from '@/src/theme/brand';

/** HTML · Картка заявки — рішення. */
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
        status === 'approved' ? t('admin.approved') : t('admin.rejected'),
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
      <AppScreen edges={['bottom', 'top']}>
        <AppChromeHeader />
        <ScrHeader title={t('admin.missing')} titleSize={18} />
      </AppScreen>
    );
  }

  return (
    <AppScreen edges={['bottom', 'top']}>
      <AppChromeHeader />
      <ScrHeader title={item.title} titleSize={18} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <Text style={styles.kicker}>{item.summary}</Text>
          {item.source ? (
            <View style={styles.row}>
              <Text style={styles.lbl}>{t('admin.source')}</Text>
              <Text style={styles.val}>{item.source}</Text>
            </View>
          ) : null}
          <View style={styles.row}>
            <Text style={styles.lbl}>{t('admin.statusLabel')}</Text>
            <Text style={styles.val}>{t(`admin.status.${item.status}`)}</Text>
          </View>

          <View style={styles.check}>
            <Text style={styles.checkTitle}>{t('admin.checklistTitle')}</Text>
            <Text style={styles.checkLine}>{t('admin.checklistBody')}</Text>
          </View>

          {item.status === 'pending' ? (
            <>
              <PrimaryButton
                label={t('admin.approveVerified')}
                loading={busy}
                onPress={() => void decide('approved')}
              />
              <PrimaryButton
                label={t('admin.publishNoBadge')}
                variant="secondary"
                loading={busy}
                onPress={() => void decide('approved')}
              />
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
  pad: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 12,
  },
  kicker: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
  },
  row: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    padding: 12,
  },
  lbl: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: brand.mutedSoft,
  },
  val: {
    marginTop: 4,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  },
  check: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.accentTint,
    padding: 14,
  },
  checkTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.accentDark,
  },
  checkLine: {
    marginTop: 6,
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 18,
    color: brand.accentDark,
  },
});
