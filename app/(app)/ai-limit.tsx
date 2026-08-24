import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import {
  AI_SCAN_DAILY_LIMIT,
  getAiScanUsage,
} from '@/src/services/aiScanLimit';
import { brand, fonts } from '@/src/theme/brand';

/** 02.07 — daily AI photo limit + Plus upsell; barcode stays free. */
export default function AiLimitScreen() {
  const [used, setUsed] = useState(AI_SCAN_DAILY_LIMIT);

  useEffect(() => {
    void getAiScanUsage().then((u) => setUsed(u.used));
  }, []);

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader trailing="bell" bellCount={3} />
      <ScrHeader title={t('aiLimit.title')} titleSize={18} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.usageCard}>
          <View style={styles.usageRow}>
            <Text style={styles.usageLabel}>{t('aiLimit.usedLabel')}</Text>
            <Text style={styles.usageValue}>
              {t('aiLimit.usedValue', {
                used,
                limit: AI_SCAN_DAILY_LIMIT,
              })}
            </Text>
          </View>
          <Text style={styles.usageBody}>{t('aiLimit.body')}</Text>
        </View>

        <View style={styles.plusBox}>
          <Text style={styles.plusTitle}>{t('aiLimit.plusTitle')}</Text>
          <Text style={styles.plusPrice}>{t('aiLimit.plusPrice')}</Text>
          {(
            [
              'aiLimit.plusAi',
              'aiLimit.plusPets',
              'aiLimit.plusTravel',
            ] as const
          ).map((key) => (
            <View key={key} style={styles.checkRow}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={brand.successDark}
              />
              <Text style={styles.checkText}>{t(key)}</Text>
            </View>
          ))}
          <Pressable
            onPress={() => router.push('/(app)/subscription' as never)}
            style={styles.trial}
          >
            <Text style={styles.trialText}>{t('aiLimit.trial')}</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() =>
            router.replace({
              pathname: '/(app)/scan-food',
              params: { mode: 'barcode' },
            })
          }
          style={styles.alt}
        >
          <Text style={styles.altText}>{t('aiLimit.barcodeUnlimited')}</Text>
        </Pressable>

        <Pressable
          onPress={() => router.replace('/(app)/(tabs)')}
          style={styles.remind}
        >
          <Text style={styles.remindText}>{t('aiLimit.remind')}</Text>
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
  usageCard: {
    borderRadius: 16,
    backgroundColor: brand.surfaceElevated,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    padding: 16,
    marginBottom: 14,
  },
  usageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  usageLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: brand.ink,
  },
  usageValue: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  },
  usageBody: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: brand.muted,
  },
  plusBox: {
    borderRadius: 16,
    backgroundColor: brand.successTint,
    padding: 16,
    gap: 8,
  },
  plusTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: brand.ink,
  },
  plusPrice: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: brand.successDark,
    marginBottom: 4,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.ink,
  },
  trial: { marginTop: 10, paddingVertical: 4 },
  trialText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.accentDark,
  },
  alt: {
    marginTop: 22,
    alignItems: 'center',
    paddingVertical: 10,
  },
  altText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: brand.ink,
  },
  remind: {
    marginTop: 8,
    alignItems: 'center',
    paddingVertical: 10,
  },
  remindText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
  },
});
