import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { HubHero } from '@/src/components/HubHero';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import { saveDirectoryReview } from '@/src/services/directoryReviews';
import { brand, fonts } from '@/src/theme/brand';

/** HTML kit · Відгук. */
export default function DirectoryReviewScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!id) return;
    if (!text.trim()) {
      notify(t('common.error'), t('directories.reviewRequired'));
      return;
    }
    setBusy(true);
    try {
      await saveDirectoryReview({ placeId: id, rating, text });
      notify(t('common.ok'), t('directories.reviewSaved'));
      router.back();
    } catch {
      notify(t('common.error'), t('directories.reviewError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <HubHero
            title={t('directories.reviewTitle')}
            lead={t('directories.reviewSubtitle')}
          />
          <Text style={styles.label}>{t('directories.rating')}</Text>
          <View style={styles.row}>
            {[1, 2, 3, 4, 5].map((n) => {
              const active = rating === n;
              return (
                <Pressable
                  key={n}
                  onPress={() => setRating(n)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {n}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.label}>{t('directories.reviewText')}</Text>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={t('directories.reviewPlaceholder')}
            placeholderTextColor={brand.mutedSoft}
            multiline
            style={[styles.input, styles.area]}
          />
          <View style={styles.gap} />
          <PrimaryButton
            label={t('directories.submitReview')}
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
    marginTop: 12,
    marginBottom: 6,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: brand.muted,
  },
  row: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  chip: {
    width: 44,
    height: 44,
    borderRadius: brand.radius.md,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.surfaceElevated,
  },
  chipActive: {
    backgroundColor: brand.accent,
    borderColor: brand.accent,
  },
  chipText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: brand.ink,
  },
  chipTextActive: { color: '#FFFFFF' },
  input: {
    borderWidth: 1,
    borderColor: brand.mistBorder,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    color: brand.ink,
  },
  area: { minHeight: 110, textAlignVertical: 'top' },
  gap: { height: 16 },
});
