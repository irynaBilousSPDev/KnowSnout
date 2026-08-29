import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import { getDirectoryPlace } from '@/src/services/directories';
import { saveDirectoryReview } from '@/src/services/directoryReviews';
import { brand, fonts } from '@/src/theme/brand';

/** 06.07 · Залишити відгук */
export default function DirectoryReviewScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [placeName, setPlaceName] = useState('');
  const [rating, setRating] = useState(5);
  const [cost, setCost] = useState('');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    void getDirectoryPlace(id).then((p) => {
      if (p) setPlaceName(p.name);
    });
  }, [id]);

  const submit = async () => {
    if (!id) return;
    if (!text.trim()) {
      notify(t('common.error'), t('directories.reviewRequired'));
      return;
    }
    setBusy(true);
    try {
      const body = cost.trim()
        ? `${text.trim()}\n\n(${t('directories.reviewCost')}: ${cost.trim()})`
        : text.trim();
      await saveDirectoryReview({ placeId: id, rating, text: body });
      notify(t('common.ok'), t('directories.reviewSaved'));
      router.back();
    } catch {
      notify(t('common.error'), t('directories.reviewError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('directories.reviewTitle')} titleSize={18} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          {placeName ? (
            <Text style={styles.placeName}>{placeName}</Text>
          ) : null}

          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} onPress={() => setRating(n)}>
                <Text style={styles.star}>{n <= rating ? '★' : '☆'}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>{t('directories.reviewCost')}</Text>
          <TextInput
            value={cost}
            onChangeText={setCost}
            placeholder={t('directories.reviewCostPlaceholder')}
            placeholderTextColor={brand.mutedSoft}
            style={styles.input}
          />

          <Text style={styles.label}>{t('directories.reviewYourText')}</Text>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={t('directories.reviewPlaceholder')}
            placeholderTextColor={brand.mutedSoft}
            multiline
            style={[styles.input, styles.area]}
          />

          <PrimaryButton
            label={t('directories.submitReview')}
            loading={busy}
            onPress={() => void submit()}
            style={styles.btn}
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 40,
    gap: 8,
  },
  placeName: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: brand.ink,
    textAlign: 'center',
    marginBottom: 4,
  },
  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },
  star: {
    fontSize: 30,
    color: brand.ink,
  },
  label: {
    marginTop: 6,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: brand.muted,
  },
  input: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.ink,
  },
  area: { minHeight: 100, textAlignVertical: 'top' },
  btn: { marginTop: 10 },
});
