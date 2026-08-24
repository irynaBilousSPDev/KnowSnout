import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ErrorState } from '@/src/components/ErrorState';
import { ScrHeader } from '@/src/components/ScrHeader';
import { WhereToBuyBlock } from '@/src/components/WhereToBuyBlock';
import {
  buildFoodResultView,
  scoreHeadline,
  type Tone,
} from '@/src/lib/foodResultView';
import { t } from '@/src/i18n';
import { isNativeSafeImageUri } from '@/src/lib/image';
import { getPendingAnalysis, setPendingAnalysis } from '@/src/lib/resultStore';
import { scoreOutOfFive } from '@/src/lib/relativeTime';
import { buildScanShareMessage, shareText } from '@/src/lib/share';
import { resolveSpecies } from '@/src/lib/species';
import { matchFoodToPet } from '@/src/services/foodMatch';
import { fetchWhereToBuy } from '@/src/services/marketOffers';
import { listPets } from '@/src/services/pets';
import { saveScan } from '@/src/services/scans';
import { getSettingsPrefs } from '@/src/services/settingsPrefs';
import { brand, fonts } from '@/src/theme/brand';
import type { PetRow } from '@/src/types/pet';
import type { PetSpecies } from '@/src/types/scan';
import type { WhereToBuyResult } from '@/src/types/marketOffer';

function toneColor(tone: Tone) {
  if (tone === 'caution') return brand.warning;
  if (tone === 'good') return brand.successDark;
  return brand.success;
}

/** 02.05 — food found result with score /5, indicators, ingredients, store. */
export default function ResultScreen() {
  const pending = getPendingAnalysis();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(Boolean(pending?.saved));
  const [error, setError] = useState<string | null>(null);
  const [pets, setPets] = useState<PetRow[]>([]);
  const [buy, setBuy] = useState<WhereToBuyResult | null>(null);
  const [buyLoading, setBuyLoading] = useState(false);
  const [species, setSpecies] = useState<PetSpecies>(() =>
    resolveSpecies(
      pending?.species,
      pending?.result?.productName,
      pending?.result?.summary,
    ),
  );

  useFocusEffect(
    useCallback(() => {
      void listPets()
        .then(setPets)
        .catch(() => setPets([]));

      const name = pending?.result?.productName;
      if (!name) {
        setBuy(null);
        return;
      }
      let cancelled = false;
      setBuyLoading(true);
      void (async () => {
        const prefs = await getSettingsPrefs();
        try {
          const next = await fetchWhereToBuy({
            productName: name,
            barcode: pending?.barcode,
            geoAllowed: prefs.geoOffersAllowed,
          });
          if (!cancelled) setBuy(next);
        } catch {
          if (!cancelled) setBuy(null);
        } finally {
          if (!cancelled) setBuyLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [pending?.result?.productName, pending?.barcode]),
  );

  const view = useMemo(
    () => (pending?.result ? buildFoodResultView(pending.result) : null),
    [pending?.result],
  );

  if (!pending?.result || !view) {
    return (
      <AppScreen>
        <AppChromeHeader />
        <ErrorState
          title={t('result.noResultTitle')}
          message={t('result.noResultBody')}
          onRetry={() => router.replace('/(app)/(tabs)')}
        />
      </AppScreen>
    );
  }

  const { result, imageUri } = pending;
  const score5 = scoreOutOfFive(result.score);
  const headline = scoreHeadline(result.score);
  const fitPet =
    pets.find((p) => {
      const m = matchFoodToPet(p, {
        productName: result.productName,
        summary: result.summary,
        pros: result.pros,
        cons: result.cons,
        species,
      });
      return m.level === 'ok' || m.level === 'caution';
    }) ?? pets[0];

  const speciesLabel =
    species === 'cat' ? t('result.speciesCats') : t('result.speciesDogs');

  const onSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const row = await saveScan(result, imageUri, {
        barcode: pending.barcode,
        productId: pending.productId,
        species,
      });
      setSaved(true);
      setPendingAnalysis({
        ...pending,
        scanId: row.id,
        saved: true,
        species,
      });
      Alert.alert(t('result.saved'), t('result.savedBody'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('result.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const uri = imageUri && isNativeSafeImageUri(imageUri) ? imageUri : null;

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader
        title={t('result.navTitle')}
        titleSize={18}
        right={
          <Pressable
            onPress={() =>
              void shareText({
                title: t('share.dialogTitle'),
                message: buildScanShareMessage({
                  productName: result.productName,
                  score: result.score,
                }),
              })
            }
            style={styles.shareBtn}
            accessibilityRole="button"
            accessibilityLabel={t('result.share')}
          >
            <Ionicons name="share-outline" size={18} color={brand.ink} />
          </Pressable>
        }
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.heroRow}>
          {uri ? (
            <Image source={{ uri }} style={styles.pack} resizeMode="cover" />
          ) : (
            <View style={styles.packEmpty}>
              <Ionicons name="bag-outline" size={28} color={brand.mutedSoft} />
              <Text style={styles.packHint}>{t('result.packagePlaceholder')}</Text>
            </View>
          )}
          <View style={styles.heroCopy}>
            <Text style={styles.productName}>{result.productName}</Text>
            <Text style={styles.meta}>
              {t('result.metaLine', {
                form: t('result.formDry'),
                species: speciesLabel,
                weight: t('result.weightStub'),
              })}
            </Text>
            {fitPet ? (
              <View style={styles.fitRow}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={brand.successDark}
                />
                <Text style={styles.fitText}>
                  {t('result.fitOk', { name: fitPet.name })}
                </Text>
              </View>
            ) : (
              <Text style={styles.fitMuted}>{t('result.fitUnknown')}</Text>
            )}
          </View>
        </View>

        <View style={styles.scoreCard}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreNum}>
              {t('result.scoreOf5', { score: score5 })}
            </Text>
          </View>
          <View style={styles.scoreCopy}>
            <Text style={styles.scoreTitle}>{headline.title}</Text>
            <Text style={styles.scoreBody}>{headline.body}</Text>
          </View>
        </View>

        <Text style={styles.section}>{t('result.indicators')}</Text>
        {view.indicators.map((row) => (
          <View key={row.label} style={styles.indRow}>
            <Text style={styles.indLabel}>{row.label}</Text>
            <Text style={[styles.indTone, { color: toneColor(row.tone) }]}>
              {row.toneLabel}
            </Text>
          </View>
        ))}

        <Text style={[styles.section, styles.sectionGap]}>
          {t('result.ingredients')}
        </Text>
        {view.ingredients.map((row, i) => (
          <View key={`${row.label}-${i}`} style={styles.indRow}>
            <View style={styles.ingLeft}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: toneColor(row.tone) },
                ]}
              />
              <Text style={styles.indLabel}>{row.label}</Text>
            </View>
            <Text style={[styles.indTone, { color: toneColor(row.tone) }]}>
              {row.toneLabel}
            </Text>
          </View>
        ))}

        <WhereToBuyBlock
          data={buy}
          loading={buyLoading}
          onOpenSettings={() => router.push('/(app)/settings' as never)}
        />

        <Text style={styles.disclaimer}>{t('result.disclaimer')}</Text>

        {error ? (
          <Text style={styles.err}>{error}</Text>
        ) : null}

        <View style={styles.actions}>
          <Pressable
            onPress={() => void onSave()}
            disabled={saving || saved}
            style={styles.actionTextBtn}
          >
            <Text style={styles.actionText}>
              {saved ? t('result.saved') : t('result.saveShort')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/(app)/compare-food' as never)}
            style={styles.actionTextBtn}
          >
            <Text style={styles.actionText}>{t('result.compare')}</Text>
          </Pressable>
        </View>

        {/* Species tweak for save accuracy */}
        <View style={styles.speciesRow}>
          {(['dog', 'cat'] as PetSpecies[]).map((id) => {
            const active = species === id;
            return (
              <Pressable
                key={id}
                onPress={() => setSpecies(id)}
                disabled={saved}
                style={[styles.speciesChip, active && styles.speciesActive]}
              >
                <Text
                  style={[
                    styles.speciesText,
                    active && styles.speciesTextActive,
                  ]}
                >
                  {id === 'cat'
                    ? t('history.speciesCat')
                    : t('history.speciesDog')}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 36,
  },
  shareBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16,
  },
  pack: {
    width: 88,
    height: 88,
    borderRadius: 14,
    backgroundColor: brand.creamDeep,
  },
  packEmpty: {
    width: 88,
    height: 88,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: brand.mistBorder,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  packHint: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: brand.mutedSoft,
  },
  heroCopy: { flex: 1, justifyContent: 'center' },
  productName: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: brand.ink,
  },
  meta: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
  },
  fitRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fitText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: brand.successDark,
  },
  fitMuted: {
    marginTop: 8,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
  },
  scoreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: brand.radius.md,
    backgroundColor: brand.successTint,
    padding: 14,
    marginBottom: 18,
  },
  scoreCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  scoreNum: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.successDark,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  scoreCopy: { flex: 1 },
  scoreTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: brand.successDark,
  },
  scoreBody: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 17,
    color: brand.ink,
  },
  section: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
    marginBottom: 8,
  },
  sectionGap: { marginTop: 14 },
  indRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.mistBorder,
  },
  indLabel: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.ink,
    paddingRight: 8,
  },
  indTone: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
  ingLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  storeCard: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    backgroundColor: brand.creamDeep,
    padding: 12,
  },
  storeIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: brand.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeCopy: { flex: 1 },
  storeTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.ink,
  },
  storeMeta: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 11,
    color: brand.muted,
  },
  open: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.accent,
  },
  disclaimer: {
    marginTop: 16,
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 15,
    color: brand.mutedSoft,
  },
  actions: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionTextBtn: { paddingVertical: 10, paddingHorizontal: 16 },
  actionText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: brand.ink,
  },
  err: {
    marginTop: 8,
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.error,
  },
  speciesRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  speciesChip: {
    borderRadius: brand.radius.pill,
    backgroundColor: brand.creamDeep,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  speciesActive: { backgroundColor: brand.successTint },
  speciesText: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: brand.ink,
  },
  speciesTextActive: { color: brand.successDark },
});
