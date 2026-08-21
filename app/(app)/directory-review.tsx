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
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import { saveDirectoryReview } from '@/src/services/directoryReviews';
import { brand } from '@/src/theme/brand';

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
          <ScreenHeader
            title={t('directories.reviewTitle')}
            subtitle={t('directories.reviewSubtitle')}
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
            placeholderTextColor="#8AA8A0"
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
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: '#3A5A54',
  },
  row: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  chip: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.surfaceElevated,
  },
  chipActive: {
    backgroundColor: brand.tealPressed,
    borderColor: brand.tealPressed,
  },
  chipText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
    color: brand.ink,
  },
  chipTextActive: { color: brand.surface },
  input: {
    borderWidth: 1,
    borderColor: brand.mistBorder,
    borderRadius: 14,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: brand.ink,
  },
  area: { minHeight: 110, textAlignVertical: 'top' },
  gap: { height: 16 },
});
