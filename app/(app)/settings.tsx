import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import {
  getSettingsPrefs,
  saveSettingsPrefs,
  type AppLanguage,
  type SettingsPrefs,
} from '@/src/services/settingsPrefs';
import { saveUserProfile } from '@/src/services/userProfile';
import { brand, fonts } from '@/src/theme/brand';
import type { MarketCountryPref } from '@/src/types/marketOffer';

const LANGS: {
  id: AppLanguage | 'de' | 'es';
  label: string;
  soon?: boolean;
}[] = [
  { id: 'uk', label: 'Українська' },
  { id: 'pl', label: 'Polski' },
  { id: 'en', label: 'English' },
  { id: 'de', label: 'Deutsch', soon: true },
  { id: 'es', label: 'Español', soon: true },
];

/** HTML phone “44 · Мова та підписка”. */
export default function SettingsScreen() {
  const [prefs, setPrefs] = useState<SettingsPrefs | null>(null);

  useFocusEffect(
    useCallback(() => {
      void getSettingsPrefs().then(setPrefs);
    }, []),
  );

  const setLanguage = async (language: AppLanguage) => {
    const next = await saveSettingsPrefs({ language });
    setPrefs(next);
  };

  const setCountry = async (country: MarketCountryPref) => {
    const next = await saveSettingsPrefs({ country });
    setPrefs(next);
  };

  const persistCity = async (city: string) => {
    const next = await saveSettingsPrefs({ city });
    setPrefs(next);
    try {
      await saveUserProfile({ city: city.trim() || null });
    } catch {
      // demo / unsigned
    }
  };

  const toggleGeo = async () => {
    if (!prefs) return;
    const next = await saveSettingsPrefs({
      geoOffersAllowed: !prefs.geoOffersAllowed,
    });
    setPrefs(next);
  };

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('settings.langAndPlan')} titleSize={20} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <Text style={styles.fieldLbl}>{t('settings.languageUi')}</Text>
          <View style={styles.langCard}>
            {LANGS.map((lang, i) => {
              const active =
                !lang.soon && prefs?.language === (lang.id as AppLanguage);
              return (
                <Pressable
                  key={lang.id}
                  disabled={lang.soon}
                  onPress={() => {
                    if (!lang.soon) void setLanguage(lang.id as AppLanguage);
                  }}
                  style={[
                    styles.langRow,
                    i < LANGS.length - 1 && styles.langRowBorder,
                  ]}
                >
                  <Text
                    style={[
                      styles.langLabel,
                      lang.soon && styles.langSoon,
                    ]}
                  >
                    {lang.label}
                  </Text>
                  {lang.soon ? (
                    <View style={styles.chip}>
                      <Text style={styles.chipText}>{t('settings.soon')}</Text>
                    </View>
                  ) : active ? (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={brand.successDark}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.fieldLbl}>{t('settings.regionTitle')}</Text>
          <Text style={styles.regionHint}>{t('settings.regionHint')}</Text>
          <View style={styles.langCard}>
            {(
              [
                ['auto', t('settings.countryAuto')],
                ['UA', t('settings.countryUA')],
                ['PL', t('settings.countryPL')],
              ] as const
            ).map(([id, label], i, arr) => {
              const active = prefs?.country === id;
              return (
                <Pressable
                  key={id}
                  onPress={() => void setCountry(id)}
                  style={[
                    styles.langRow,
                    i < arr.length - 1 && styles.langRowBorder,
                  ]}
                >
                  <Text style={styles.langLabel}>{label}</Text>
                  {active ? (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={brand.successDark}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.fieldLbl}>{t('me.city')}</Text>
          <TextInput
            value={prefs?.city ?? ''}
            onChangeText={(city) => setPrefs((p) => (p ? { ...p, city } : p))}
            onEndEditing={(e) => {
              void persistCity(e.nativeEvent.text);
            }}
            placeholder={t('me.cityPlaceholder')}
            placeholderTextColor={brand.mutedSoft}
            style={styles.cityInput}
          />

          <Pressable onPress={() => void toggleGeo()} style={styles.geoRow}>
            <View style={styles.geoCopy}>
              <Text style={styles.langLabel}>{t('settings.geoOffers')}</Text>
              <Text style={styles.regionHint}>{t('settings.geoOffersHint')}</Text>
            </View>
            <Text style={styles.geoState}>
              {prefs?.geoOffersAllowed
                ? t('settings.geoOn')
                : t('settings.geoOff')}
            </Text>
          </Pressable>

          <View style={styles.plusCard}>
            <Text style={styles.plusTitle}>{t('subscription.plan.plus')}</Text>
            <Text style={styles.plusBody}>
              {t('subscription.plusPitch')}
            </Text>
            <PrimaryButton
              label={t('subscription.getPlus')}
              onPress={() =>
                Alert.alert(
                  t('subscription.mockTitle'),
                  t('subscription.mockBody'),
                )
              }
            />
          </View>

          <View style={styles.planRow}>
            <Text style={styles.planLabel}>{t('subscription.currentPlan')}</Text>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{t('subscription.plan.free')}</Text>
            </View>
          </View>
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
    gap: 14,
  },
  fieldLbl: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: brand.muted,
    marginBottom: -4,
  },
  langCard: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    overflow: 'hidden',
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  langRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.mistBorder,
  },
  langLabel: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: brand.ink,
  },
  langSoon: { color: brand.mutedSoft },
  regionHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: brand.muted,
    marginTop: -8,
  },
  cityInput: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    color: brand.ink,
  },
  geoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  geoCopy: { flex: 1 },
  geoState: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: brand.accentDark,
  },
  chip: {
    borderRadius: brand.radius.pill,
    backgroundColor: brand.creamDeep,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10.5,
    color: brand.ink,
  },
  plusCard: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.accentTint,
    padding: 14,
    gap: 6,
  },
  plusTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: brand.accentDark,
  },
  plusBody: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: brand.accentDark,
    marginBottom: 6,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  planLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
  },
});
