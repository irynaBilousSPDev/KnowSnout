import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import {
  applySpotlightEntry,
  listSpotlightContests,
  type SpotlightContest,
} from '@/src/services/spotlight';
import { brand, fonts } from '@/src/theme/brand';

export default function SpotlightApplyScreen() {
  const [contests, setContests] = useState<SpotlightContest[]>([]);
  const [contestId, setContestId] = useState<string | null>(null);
  const [petName, setPetName] = useState('');
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const list = listSpotlightContests().filter((c) => c.status === 'active');
      setContests(list);
      setContestId(list[0]?.id ?? null);
    }, []),
  );

  const submit = async () => {
    if (!contestId) return;
    if (!petName.trim()) {
      notify(t('common.error'), t('spotlight.petRequired'));
      return;
    }
    if (!caption.trim()) {
      notify(t('common.error'), t('spotlight.captionRequired'));
      return;
    }
    setBusy(true);
    try {
      await applySpotlightEntry({ contestId, petName, caption });
      notify(t('common.ok'), t('spotlight.applyDone'));
      router.replace({
        pathname: '/(app)/spotlight-won',
        params: { contestId },
      } as never);
    } catch {
      notify(t('common.error'), t('spotlight.applyError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader
            title={t('spotlight.applyTitle')}
            subtitle={t('spotlight.applySubtitle')}
          />

          <Text style={styles.label}>{t('spotlight.pickContest')}</Text>
          {contests.map((c) => {
            const active = c.id === contestId;
            return (
              <Pressable
                key={c.id}
                onPress={() => setContestId(c.id)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {c.title}
                </Text>
              </Pressable>
            );
          })}

          <Text style={styles.label}>{t('spotlight.petName')}</Text>
          <TextInput
            value={petName}
            onChangeText={setPetName}
            placeholder={t('spotlight.petPlaceholder')}
            placeholderTextColor={brand.mutedSoft}
            style={styles.input}
          />

          <Text style={styles.label}>{t('spotlight.caption')}</Text>
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder={t('spotlight.captionPlaceholder')}
            placeholderTextColor={brand.mutedSoft}
            multiline
            style={[styles.input, styles.area]}
          />

          <View style={styles.gap} />
          <PrimaryButton
            label={t('spotlight.submit')}
            loading={busy}
            onPress={() => void submit()}
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  label: {
    marginTop: 14,
    marginBottom: 6,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.muted,
  },
  chip: {
    marginBottom: 8,
    borderRadius: 14,
        backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  chipActive: {
    backgroundColor: brand.mist,
    borderColor: brand.navy,
  },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: brand.ink,
  },
  chipTextActive: { color: brand.navy },
  input: {
    borderRadius: 14,
        backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    color: brand.ink,
  },
  area: { minHeight: 96, textAlignVertical: 'top' },
  gap: { height: 16 },
});
