import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useAnalyzeLabel } from '@/src/hooks/useAnalyzeLabel';
import { t } from '@/src/i18n';
import { persistLocalImage, persistPickerAsset } from '@/src/lib/image';
import {
  clearPendingBarcodeContext,
  getPendingBarcodeContext,
  setPendingAnalysis,
  setPendingBarcodeContext,
} from '@/src/lib/resultStore';
import { resolveSpecies } from '@/src/lib/species';
import { canUseAiScan, consumeAiScan } from '@/src/services/aiScanLimit';
import { persistAiProduct, resolveBarcode } from '@/src/services/resolveBarcode';
import { brand, fonts } from '@/src/theme/brand';

type Mode = 'barcode' | 'photo';

/**
 * 02.02 barcode + 02.03 label + 02.04 analyzing.
 * Unknown barcode → 02.06; AI photo quota → 02.07.
 */
export default function ScanFoodScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ mode?: string }>();
  const { loading, error, analyze, setError } = useAnalyzeLabel();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState<Mode>(
    params.mode === 'photo' ? 'photo' : 'barcode',
  );
  const [lookupLoading, setLookupLoading] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [locked, setLocked] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [pickerError, setPickerError] = useState<string | null>(null);

  const busy = loading || lookupLoading || capturing;
  const barcodeContext = getPendingBarcodeContext();

  useEffect(() => {
    if (params.mode === 'photo') setMode('photo');
    if (params.mode === 'barcode') setMode('barcode');
  }, [params.mode]);

  useEffect(() => {
    if (barcodeContext?.barcode) setMode('photo');
  }, [barcodeContext?.barcode]);

  const ensureAiQuota = async () => {
    const ok = await canUseAiScan();
    if (!ok) {
      router.push('/(app)/ai-limit' as never);
      return false;
    }
    return true;
  };

  const goToResult = async (imageUri?: string | null) => {
    setPickerError(null);
    if (!(await ensureAiQuota())) return;

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
      await consumeAiScan();

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
      router.replace('/(app)/result');
    } catch {
      // error in hook
    }
  };

  const onBarcode = async (code: string) => {
    const cleaned = code.replace(/\s/g, '').trim();
    if (!cleaned || busy || locked) return;
    setLocked(true);
    setPickerError(null);
    setLookupLoading(true);
    try {
      const resolved = await resolveBarcode(cleaned);
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
        router.replace('/(app)/result');
        return;
      }

      setPendingBarcodeContext({
        barcode: resolved.barcode,
        preferredName: resolved.preferredName,
        species: resolved.species,
      });
      router.push({
        pathname: '/(app)/food-not-found',
        params: { barcode: resolved.barcode },
      } as never);
    } catch (err) {
      setPickerError(
        err instanceof Error ? err.message : t('barcode.lookupFailed'),
      );
    } finally {
      setLookupLoading(false);
      setLocked(false);
    }
  };

  const takePhoto = async () => {
    if (!cameraRef.current || busy) return;
    if (!(await ensureAiQuota())) return;
    try {
      setCapturing(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      if (photo?.uri) await goToResult(photo.uri);
    } finally {
      setCapturing(false);
    }
  };

  const pickGallery = async () => {
    if (!(await ensureAiQuota())) return;
    const permissionLib =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionLib.granted) {
      setPickerError(t('scan.galleryPermission'));
      return;
    }
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (picked.canceled || !picked.assets[0]?.uri) return;
    try {
      const stable = await persistPickerAsset(picked.assets[0], 'scan');
      await goToResult(stable);
    } catch {
      setPickerError(t('photo.persistFailed'));
    }
  };

  if (loading) {
    return (
      <View style={[styles.analyzeRoot, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={brand.accent} />
        <Text style={styles.analyzeTitle}>{t('scan.analyzingTitle')}</Text>
        <Text style={styles.analyzeBody}>{t('scan.analyzingBody')}</Text>
      </View>
    );
  }

  const darkHeader = (
    <View style={[styles.darkHd, { paddingTop: Math.max(insets.top, 12) }]}>
      <Pressable
        onPress={() => router.back()}
        style={styles.darkBack}
        accessibilityRole="button"
        accessibilityLabel={t('common.back')}
      >
        <Ionicons name="chevron-back" size={20} color="#F4F3F1" />
      </Pressable>
      <Text style={styles.darkTitle}>
        {mode === 'barcode' ? t('scan.barcodeTitle') : t('scan.photoTitle')}
      </Text>
      <View style={styles.darkSpacer} />
    </View>
  );

  if (!permission) {
    return (
      <View style={styles.darkRoot}>
        {darkHeader}
        <Text style={styles.helpCenter}>{t('camera.checking')}</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.darkRoot}>
        {darkHeader}
        <View style={styles.permBox}>
          <Text style={styles.helpCenter}>{t('barcode.needPermission')}</Text>
          <Pressable onPress={requestPermission} style={styles.permBtn}>
            <Text style={styles.permBtnText}>{t('camera.allow')}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.darkRoot}>
      {darkHeader}

      <View style={styles.stage}>
        {Platform.OS === 'web' && mode === 'barcode' ? (
          <View style={styles.webBox}>
            <Text style={styles.helpCenter}>{t('barcode.webHint')}</Text>
            <TextInput
              value={manualBarcode}
              onChangeText={setManualBarcode}
              placeholder="5905179422086"
              placeholderTextColor="#8b96a0"
              keyboardType="number-pad"
              style={styles.webInput}
            />
            <Pressable
              onPress={() => void onBarcode(manualBarcode)}
              style={styles.permBtn}
              disabled={busy || manualBarcode.trim().length < 6}
            >
              <Text style={styles.permBtnText}>{t('barcode.lookup')}</Text>
            </Pressable>
          </View>
        ) : Platform.OS === 'web' && mode === 'photo' ? (
          <View style={styles.webBox}>
            <Text style={styles.helpCenter}>{t('scan.photoHelp')}</Text>
            <Pressable onPress={() => void pickGallery()} style={styles.permBtn}>
              <Text style={styles.permBtnText}>{t('scan.uploadGallery')}</Text>
            </Pressable>
          </View>
        ) : (
          <View
            style={[
              styles.viewfinder,
              mode === 'barcode' ? styles.vfBarcode : styles.vfLabel,
            ]}
          >
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={
                mode === 'barcode'
                  ? {
                      barcodeTypes: [
                        'ean13',
                        'ean8',
                        'upc_a',
                        'upc_e',
                        'code128',
                      ],
                    }
                  : undefined
              }
              onBarcodeScanned={
                mode === 'barcode' && !busy && !locked
                  ? ({ data }) => {
                      void onBarcode(data);
                    }
                  : undefined
              }
            />
            <View
              pointerEvents="none"
              style={[
                styles.frame,
                mode === 'barcode' ? styles.frameBarcode : styles.frameLabel,
              ]}
            >
              {mode === 'barcode' ? <View style={styles.scanLine} /> : null}
              {mode === 'photo' ? (
                <Text style={styles.frameHint}>{t('scan.photoHelp')}</Text>
              ) : null}
            </View>
          </View>
        )}

        {mode === 'barcode' ? (
          <>
            <Pressable
              onPress={() => setMode('photo')}
              style={styles.fallbackLink}
            >
              <Ionicons
                name="add"
                size={14}
                color="rgba(255,255,255,0.6)"
              />
              <Text style={styles.fallbackMuted}>
                {t('scan.notFoundInDb')}
                <Text style={styles.fallbackAccent}>
                  {t('scan.photoLabelLink')}
                </Text>
              </Text>
            </Pressable>
            <Text style={styles.footerHelp}>{t('scan.barcodeHelp')}</Text>
            {Platform.OS !== 'web' ? (
              <View style={styles.manualRow}>
                <TextInput
                  value={manualBarcode}
                  onChangeText={setManualBarcode}
                  placeholder="590…"
                  placeholderTextColor="#8b96a0"
                  keyboardType="number-pad"
                  style={styles.manualInput}
                />
                <Pressable
                  onPress={() => void onBarcode(manualBarcode)}
                  style={styles.manualGo}
                  disabled={busy || manualBarcode.trim().length < 6}
                >
                  <Text style={styles.manualGoText}>{t('barcode.lookup')}</Text>
                </Pressable>
              </View>
            ) : null}
          </>
        ) : (
          <>
            <Pressable
              onPress={() => void takePhoto()}
              disabled={busy}
              style={[styles.shutter, busy && styles.shutterDim]}
              accessibilityRole="button"
              accessibilityLabel={t('photo.camera')}
            >
              <View style={styles.shutterInner} />
            </Pressable>
            <Pressable onPress={() => void pickGallery()} style={styles.gallery}>
              <Text style={styles.galleryText}>{t('scan.uploadGallery')}</Text>
            </Pressable>
            <Pressable onPress={() => setMode('barcode')} style={styles.gallery}>
              <Text style={styles.galleryText}>{t('scan.modeBarcode')}</Text>
            </Pressable>
          </>
        )}

        {(error || pickerError) && (
          <Text style={styles.err}>
            {error ?? pickerError}
            {'  '}
            <Text
              style={styles.fallbackAccent}
              onPress={() => {
                setError(null);
                setPickerError(null);
              }}
            >
              {t('common.tryAgain')}
            </Text>
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  darkRoot: {
    flex: 1,
    backgroundColor: '#111',
  },
  analyzeRoot: {
    flex: 1,
    backgroundColor: brand.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 10,
  },
  analyzeTitle: {
    marginTop: 8,
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: brand.ink,
  },
  analyzeBody: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
    textAlign: 'center',
  },
  darkHd: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 6,
  },
  darkBack: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  darkTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.title,
    fontSize: 18,
    color: '#FFFFFF',
  },
  darkSpacer: { width: 34 },
  stage: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 34,
  },
  viewfinder: {
    marginTop: 24,
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: '#111',
  },
  vfBarcode: { width: '100%', aspectRatio: 1.4 },
  vfLabel: { width: '100%', flex: 1, minHeight: 280, maxHeight: 440 },
  frame: {
    ...StyleSheet.absoluteFillObject,
    margin: 0,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: brand.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameBarcode: {},
  frameLabel: { margin: 30, borderRadius: 16 },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#5FBBA6',
    opacity: 0.95,
  },
  frameHint: {
    paddingHorizontal: 20,
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.5)',
  },
  fallbackLink: {
    marginTop: 16,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fallbackMuted: {
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  fallbackAccent: {
    fontFamily: fonts.body,
    color: brand.accentSoft,
  },
  footerHelp: {
    marginTop: 'auto',
    marginBottom: 8,
    fontFamily: fonts.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
  },
  shutter: {
    marginTop: 18,
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 0,
    height: 0,
  },
  shutterDim: { opacity: 0.5 },
  gallery: { marginTop: 14 },
  galleryText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: brand.accentSoft,
  },
  helpCenter: {
    marginTop: 40,
    paddingHorizontal: 24,
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
  },
  permBox: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  permBtn: {
    marginTop: 16,
    alignSelf: 'center',
    borderRadius: brand.radius.pill,
    backgroundColor: brand.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 48,
    justifyContent: 'center',
  },
  permBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: '#fff',
  },
  webBox: { marginTop: 40, width: '100%', gap: 12 },
  webInput: {
    borderRadius: 14,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 16,
    color: brand.ink,
  },
  manualRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    marginTop: 12,
  },
  manualInput: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F4F3F1',
    fontFamily: fonts.body,
  },
  manualGo: {
    borderRadius: brand.radius.pill,
    backgroundColor: brand.accent,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  manualGoText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: '#fff',
  },
  err: {
    marginTop: 12,
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.error,
  },
});
