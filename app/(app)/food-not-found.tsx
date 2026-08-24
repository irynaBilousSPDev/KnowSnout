import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import { scoreOutOfFive } from '@/src/lib/relativeTime';
import {
  setPendingBarcodeContext,
} from '@/src/lib/resultStore';
import { listScans } from '@/src/services/scans';
import { brand, fonts } from '@/src/theme/brand';

type Similar = {
  id: string;
  name: string;
  reasonKey: 'foodMissing.sameBrand' | 'foodMissing.similarComposition';
  score: number;
};

const SEED_SIMILAR: Similar[] = [
  {
    id: 'seed-brit-care',
    name: 'Brit Care Adult Lamb',
    reasonKey: 'foodMissing.sameBrand',
    score: 86,
  },
  {
    id: 'seed-brit-premium',
    name: 'Brit Premium Lamb',
    reasonKey: 'foodMissing.similarComposition',
    score: 78,
  },
];

/** 02.06 — unknown barcode: add via photo/manual + similar catalog. */
export default function FoodNotFoundScreen() {
  const { barcode } = useLocalSearchParams<{ barcode?: string }>();
  const code = (barcode ?? '').replace(/\s/g, '') || '—';
  const [similar, setSimilar] = useState<Similar[]>(SEED_SIMILAR);

  useEffect(() => {
    void (async () => {
      try {
        const scans = await listScans();
        if (scans.length === 0) return;
        const mapped = scans.slice(0, 2).map((s, i) => ({
          id: s.id,
          name: s.product_name,
          reasonKey: (i === 0
            ? 'foodMissing.sameBrand'
            : 'foodMissing.similarComposition') as Similar['reasonKey'],
          score: s.score,
        }));
        setSimilar(mapped);
      } catch {
        // keep seed
      }
    })();
  }, []);

  const goPhoto = () => {
    setPendingBarcodeContext({ barcode: code === '—' ? '' : code });
    router.replace({
      pathname: '/(app)/scan-food',
      params: { mode: 'photo' },
    } as never);
  };

  const formatted = code.replace(/(\d{4})(?=\d)/g, '$1 ').trim();

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('foodMissing.title')} titleSize={18} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>{t('foodMissing.heading')}</Text>
        <Text style={styles.body}>
          Штрихкод <Text style={styles.code}>{formatted}</Text> не знайдено в
          наших і відкритих базах. Додайте його — ми розберемо склад і збережемо
          в каталог.
        </Text>

        <Pressable onPress={goPhoto} style={styles.linkRow}>
          <Text style={styles.link}>{t('scan.photoLabelLink')}</Text>
        </Pressable>
        <Pressable onPress={goPhoto} style={styles.linkRow}>
          <Text style={styles.link}>{t('scan.manualIngredients')}</Text>
        </Pressable>

        <View style={styles.orRow}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>або</Text>
          <View style={styles.orLine} />
        </View>

        <Text style={styles.section}>{t('foodMissing.similar')}</Text>
        {similar.map((item) => (
          <Pressable
            key={item.id}
            style={styles.card}
            onPress={() => {
              // open as reference — still need photo for unknown code
              goPhoto();
            }}
          >
            <View style={styles.thumb} />
            <View style={styles.cardCopy}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.cardMeta}>{t(item.reasonKey)}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {scoreOutOfFive(item.score)}
              </Text>
            </View>
          </Pressable>
        ))}

        <Pressable
          onPress={() => router.replace('/(app)/(tabs)')}
          style={styles.skip}
        >
          <Text style={styles.skipText}>{t('foodMissing.skip')}</Text>
        </Pressable>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  heading: {
    fontFamily: fonts.title,
    fontSize: 22,
    color: brand.ink,
    marginBottom: 8,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: brand.muted,
    marginBottom: 18,
  },
  code: {
    fontFamily: fonts.bodyBold,
    color: brand.ink,
  },
  linkRow: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.mistBorder,
  },
  link: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: brand.ink,
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 18,
  },
  orLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: brand.mistBorder,
  },
  orText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.mutedSoft,
  },
  section: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: brand.creamDeep,
  },
  cardCopy: { flex: 1 },
  cardTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
    color: brand.ink,
  },
  cardMeta: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
  },
  badge: {
    borderRadius: brand.radius.pill,
    backgroundColor: brand.accentTint,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.accentDark,
  },
  skip: {
    marginTop: 28,
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: brand.ink,
  },
});
