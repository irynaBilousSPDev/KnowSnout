import { CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useState } from 'react';
import { Platform, Text, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { TextField } from '@/src/components/TextField';
import { t } from '@/src/i18n';

type Props = {
  onScan: (barcode: string) => void;
  disabled?: boolean;
};

export function BarcodeScanner({ onScan, disabled }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [manualCode, setManualCode] = useState('');
  const [locked, setLocked] = useState(false);
  const [scannedValue, setScannedValue] = useState<string | null>(null);

  useEffect(() => {
    setLocked(false);
    setScannedValue(null);
  }, []);

  const submit = (code: string) => {
    const cleaned = code.replace(/\s/g, '').trim();
    if (!cleaned || disabled || locked) return;
    setLocked(true);
    setScannedValue(cleaned);
    onScan(cleaned);
  };

  if (Platform.OS === 'web') {
    return (
      <View className="rounded-3xl bg-forest-900 px-4 py-5">
        <Text className="mb-3 font-body text-sm text-sand-200">
          {t('barcode.webHint')}
        </Text>
        <TextField
          label={t('barcode.label')}
          value={manualCode}
          onChangeText={setManualCode}
          placeholder="e.g. 3017620422003"
          keyboardType="default"
        />
        <PrimaryButton
          label={t('barcode.lookup')}
          onPress={() => submit(manualCode)}
          disabled={disabled || manualCode.trim().length < 6}
        />
      </View>
    );
  }

  if (!permission) {
    return (
      <View className="h-72 items-center justify-center rounded-3xl bg-forest-900">
        <Text className="font-body text-sand-100">{t('camera.checking')}</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="h-72 items-center justify-center rounded-3xl bg-forest-900 px-6">
        <Text className="mb-4 text-center font-body text-sand-100">
          {t('barcode.needPermission')}
        </Text>
        <PrimaryButton label={t('camera.allow')} onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View className="overflow-hidden rounded-3xl bg-forest-900">
      <CameraView
        style={{ height: 288, width: '100%' }}
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
      >
        <View className="flex-1 items-center justify-center">
          <View className="h-28 w-64 rounded-xl border-2 border-sand-50/80" />
        </View>
      </CameraView>
      <Text className="bg-forest-900 px-4 py-3 text-center font-body text-sm text-sand-200">
        {scannedValue
          ? t('barcode.scanned', { code: scannedValue })
          : t('barcode.align')}
      </Text>

      <View className="border-t border-forest-700 px-4 pb-4 pt-3">
        <TextField
          label={t('barcode.orType')}
          value={manualCode}
          onChangeText={setManualCode}
          placeholder="590..."
        />
        <PrimaryButton
          label={t('barcode.lookup')}
          onPress={() => submit(manualCode)}
          disabled={disabled || manualCode.trim().length < 6}
        />
        {scannedValue ? (
          <View className="mt-3">
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
    </View>
  );
}
