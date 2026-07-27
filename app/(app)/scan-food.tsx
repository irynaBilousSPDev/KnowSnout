import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { BarcodeScanner } from '@/src/components/BarcodeScanner';
import { CameraCapture } from '@/src/components/CameraCapture';
import { ErrorState } from '@/src/components/ErrorState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import {
  ScanModeToggle,
  type ScanMode,
} from '@/src/components/ScanModeToggle';
import { useAnalyzeLabel } from '@/src/hooks/useAnalyzeLabel';
import { t } from '@/src/i18n';
import { env } from '@/src/lib/env';
import { persistLocalImage, persistPickerAsset } from '@/src/lib/image';
import { notify } from '@/src/lib/notify';
import {
  clearPendingBarcodeContext,
  getPendingBarcodeContext,
  setPendingAnalysis,
  setPendingBarcodeContext,
} from '@/src/lib/resultStore';
import { resolveSpecies } from '@/src/lib/species';
import { persistAiProduct, resolveBarcode } from '@/src/services/resolveBarcode';
import { brand } from '@/src/theme/brand';

export default function ScanFoodScreen() {
  const { loading, error, analyze, setError } = useAnalyzeLabel();
  const [mode, setMode] = useState<ScanMode>('barcode');
  const [pickerError, setPickerError] = useState<string | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupHint, setLookupHint] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState('');

  const busy = loading || lookupLoading;
  const barcodeContext = getPendingBarcodeContext();
  const showDevBanners = __DEV__ && (env.useMockAi || env.isDemoMode);

  const goToResult = async (imageUri?: string | null) => {
    setPickerError(null);
    try {
      let stableUri = imageUri ?? null;
      if (stableUri) {
        try {
          stableUri = await persistLocalImage(stableUri, 'scan');
        } catch {
          setPickerError(t('photo.persistFailed'));
          return;
        }
      }

      let result = await analyze(stableUri as string);

      const ctx = getPendingBarcodeContext();
      if (ctx?.preferredName) {
        result = { ...result, productName: ctx.preferredName };
      }

      const species = resolveSpecies(
        ctx?.species ?? result.species,
        result.productName,
        result.summary,
      );

      let productId: string | null = null;
      if (ctx?.barcode) {
        try {
          const saved = await persistAiProduct({
            barcode: ctx.barcode,
            preferredName: ctx.preferredName,
            analysis: result,
            species,
          });
          productId = saved?.id ?? null;
        } catch (persistErr) {
          console.warn('Failed to save product catalog entry', persistErr);
        }
      }

      setPendingAnalysis({
        result,
        imageUri: stableUri,
        saved: false,
        barcode: ctx?.barcode ?? null,
        productId,
        preferredName: ctx?.preferredName ?? null,
        species,
      });
      clearPendingBarcodeContext();
      router.push('/(app)/result');
    } catch {
      // error state handled in hook
    }
  };

  const pickFromGallery = async () => {
    setPickerError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setPickerError(t('scan.galleryPermission'));
      return;
    }

    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      base64: true,
    });

    if (picked.canceled || !picked.assets[0]?.uri) return;
    try {
      const stable = await persistPickerAsset(picked.assets[0], 'scan');
      await goToResult(stable);
    } catch {
      setPickerError(t('photo.persistFailed'));
    }
  };

  const onBarcode = async (code: string) => {
    setPickerError(null);
    setLookupHint(null);
    setLookupLoading(true);
    try {
      const resolved = await resolveBarcode(code);
      if (resolved.status === 'ready') {
        clearPendingBarcodeContext();
        const species = resolveSpecies(
          resolved.species,
          resolved.analysis.productName,
          resolved.analysis.summary,
        );
        setPendingAnalysis({
          result: resolved.analysis,
          imageUri: null,
          saved: false,
          barcode: resolved.barcode,
          species,
        });
        router.push('/(app)/result');
        return;
      }

      setPendingBarcodeContext({
        barcode: resolved.barcode,
        preferredName: resolved.preferredName,
        species: resolved.species,
      });
      setLookupHint(resolved.reason);
      // Stay on barcode tab — show next-step hint; user switches to photo when ready.
      notify(t('scan.alertPhotoTitle'), resolved.reason);
    } catch (err) {
      setPickerError(
        err instanceof Error ? err.message : t('barcode.lookupFailed'),
      );
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <AppScreen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.lead}>{t('scan.foodLead')}</Text>

        {showDevBanners ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>{t('scan.mockBanner')}</Text>
          </View>
        ) : null}

        <ScanModeToggle mode={mode} onChange={setMode} />

        {mode === 'barcode' ? (
          <>
            <Text style={styles.sectionTitle}>{t('scan.barcodeTitle')}</Text>
            <Text style={styles.sectionHelp}>{t('scan.barcodeHelp')}</Text>
            {lookupHint ? (
              <View style={styles.hint}>
                <Text style={styles.hintText}>{lookupHint}</Text>
                <View style={styles.hintAction}>
                  <PrimaryButton
                    label={t('scan.switchToPhoto')}
                    size="sm"
                    variant="secondary"
                    onPress={() => setMode('photo')}
                  />
                </View>
              </View>
            ) : null}
            <BarcodeScanner
              onScan={onBarcode}
              disabled={busy}
              manualCode={manualBarcode}
              onManualCodeChange={setManualBarcode}
            />
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>{t('scan.photoTitle')}</Text>
            <Text style={styles.sectionHelp}>{t('scan.photoHelp')}</Text>

            {(lookupHint || barcodeContext) && (
              <View style={styles.hint}>
                <Text style={styles.hintText}>
                  {lookupHint ??
                    t('scan.linkedBarcode', {
                      code: barcodeContext?.preferredName
                        ? `${barcodeContext.barcode} (${barcodeContext.preferredName})`
                        : (barcodeContext?.barcode ?? ''),
                    })}
                </Text>
              </View>
            )}

            <CameraCapture
              disabled={busy}
              onCapture={(uri) => {
                void goToResult(uri);
              }}
            />

            <View style={styles.galleryBtn}>
              <PrimaryButton
                label={t('scan.uploadGallery')}
                variant="secondary"
                onPress={() => void pickFromGallery()}
                loading={busy}
              />
            </View>
          </>
        )}

        {(error || pickerError) && (
          <View style={styles.error}>
            <ErrorState
              message={error ?? pickerError ?? t('common.error')}
              onRetry={() => {
                setError(null);
                setPickerError(null);
              }}
            />
          </View>
        )}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  lead: {
    marginBottom: 14,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#3A5A54',
  },
  banner: {
    marginBottom: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(10, 122, 110, 0.1)',
    borderWidth: 1,
    borderColor: brand.mistBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  bannerText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: brand.ink,
    lineHeight: 18,
  },
  sectionTitle: {
    marginBottom: 6,
    fontFamily: 'DMSans_700Bold',
    fontSize: 17,
    color: brand.ink,
  },
  sectionHelp: {
    marginBottom: 12,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#3A5A54',
  },
  hint: {
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: brand.mist,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  hintText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: brand.ink,
  },
  hintAction: {
    marginTop: 10,
  },
  galleryBtn: {
    marginTop: 16,
  },
  error: {
    marginTop: 16,
  },
});
