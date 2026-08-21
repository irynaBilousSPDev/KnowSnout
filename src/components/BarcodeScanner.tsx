import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import { brand } from '@/src/theme/brand';

type Props = {
  onScan: (barcode: string) => void | Promise<void>;
  disabled?: boolean;
  /** Controlled manual input — keeps value across parent tab switches. */
  manualCode?: string;
  onManualCodeChange?: (value: string) => void;
};

export function BarcodeScanner({
  onScan,
  disabled,
  manualCode: controlledCode,
  onManualCodeChange,
}: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [internalCode, setInternalCode] = useState('');
  const [locked, setLocked] = useState(false);
  const [scannedValue, setScannedValue] = useState<string | null>(null);

  const isControlled = controlledCode !== undefined;
  const manualCode = isControlled ? controlledCode : internalCode;
  const setManualCode = (value: string) => {
    if (isControlled) onManualCodeChange?.(value);
    else setInternalCode(value);
  };

  useEffect(() => {
    setLocked(false);
    setScannedValue(null);
  }, []);

  const submit = (code: string) => {
    const cleaned = code.replace(/\s/g, '').trim();
    if (!cleaned || disabled || locked) return;
    setLocked(true);
    setScannedValue(cleaned);
    void Promise.resolve(onScan(cleaned)).finally(() => {
      setLocked(false);
    });
  };

  const manualBlock = (
    <View style={styles.manual}>
      <Text style={styles.manualLabel}>
        {Platform.OS === 'web' ? t('barcode.label') : t('barcode.orType')}
      </Text>
      <TextInput
        value={manualCode}
        onChangeText={setManualCode}
        placeholder={Platform.OS === 'web' ? 'e.g. 3017620422003' : '590...'}
        placeholderTextColor="#8A9AAB"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="number-pad"
        style={styles.input}
      />
      <PrimaryButton
        label={t('barcode.lookup')}
        onPress={() => submit(manualCode)}
        disabled={disabled || manualCode.trim().length < 6}
      />
      {scannedValue ? (
        <View style={styles.again}>
          <PrimaryButton
            label={t('barcode.again')}
            variant="ghost"
            onPress={() => {
              setLocked(false);
              setScannedValue(null);
            }}
            disabled={disabled}
          />
        </View>
      ) : null}
    </View>
  );

  if (Platform.OS === 'web') {
    return (
      <View style={styles.card}>
        <Text style={styles.help}>{t('barcode.webHint')}</Text>
        {manualBlock}
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={[styles.card, styles.center, styles.cameraH]}>
        <Text style={styles.help}>{t('camera.checking')}</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.card, styles.center, styles.cameraH, styles.pad]}>
        <Text style={[styles.help, styles.centerText]}>
          {t('barcode.needPermission')}
        </Text>
        <View style={styles.allowBtn}>
          <PrimaryButton label={t('camera.allow')} onPress={requestPermission} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.cameraBox}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'],
          }}
          onBarcodeScanned={
            disabled || locked
              ? undefined
              : ({ data }) => {
                  submit(data);
                }
          }
        />
        <View pointerEvents="none" style={styles.frameWrap}>
          <View style={styles.frame} />
        </View>
      </View>
      <Text style={styles.status}>
        {scannedValue
          ? t('barcode.scanned', { code: scannedValue })
          : t('barcode.align')}
      </Text>
      {manualBlock}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: brand.ink,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraH: { minHeight: 288 },
  pad: { paddingHorizontal: 24 },
  cameraBox: {
    height: 288,
    width: '100%',
    position: 'relative',
  },
  camera: { ...StyleSheet.absoluteFillObject },
  frameWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    height: 112,
    width: 256,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(247,250,249,0.85)',
  },
  status: {
    backgroundColor: brand.ink,
    paddingHorizontal: 16,
    paddingVertical: 12,
    textAlign: 'center',
    fontFamily: 'Figtree_400Regular',
    fontSize: 14,
    color: '#D8E8E2',
  },
  help: {
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    fontFamily: 'Figtree_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#D8E8E2',
  },
  centerText: { textAlign: 'center' },
  allowBtn: { marginTop: 16, width: '100%' },
  manual: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#2A3A48',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  manualLabel: {
    marginBottom: 8,
    fontFamily: 'Figtree_500Medium',
    fontSize: 13,
    color: '#B7D4CB',
  },
  input: {
    marginBottom: 12,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#5A6B7D',
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    fontFamily: 'Figtree_400Regular',
    fontSize: 16,
    color: brand.ink,
  },
  again: { marginTop: 12 },
});
