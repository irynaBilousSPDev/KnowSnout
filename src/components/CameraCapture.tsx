import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';

type Props = {
  onCapture: (uri: string) => void;
  disabled?: boolean;
};

export function CameraCapture({ onCapture, disabled }: Props) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);

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
          {t('camera.needPermission')}
        </Text>
        <PrimaryButton label={t('camera.allow')} onPress={requestPermission} />
      </View>
    );
  }

  if (previewUri) {
    return (
      <View className="overflow-hidden rounded-3xl">
        <Image source={{ uri: previewUri }} className="h-72 w-full" />
        <View className="flex-row gap-3 bg-forest-900/90 p-4">
          <View className="flex-1">
            <PrimaryButton
              label={t('camera.retake')}
              variant="secondary"
              onPress={() => setPreviewUri(null)}
              disabled={disabled}
            />
          </View>
          <View className="flex-1">
            <PrimaryButton
              label={t('camera.usePhoto')}
              onPress={() => onCapture(previewUri)}
              disabled={disabled}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="overflow-hidden rounded-3xl bg-forest-900">
      <CameraView ref={cameraRef} style={{ height: 288, width: '100%' }} facing="back">
        <View className="flex-1 items-center justify-end pb-5">
          <Pressable
            disabled={disabled || capturing}
            onPress={async () => {
              if (!cameraRef.current) return;
              try {
                setCapturing(true);
                const photo = await cameraRef.current.takePictureAsync({
                  quality: 0.7,
                });
                if (photo?.uri) setPreviewUri(photo.uri);
              } finally {
                setCapturing(false);
              }
            }}
            className="h-16 w-16 items-center justify-center rounded-full border-4 border-sand-50 bg-forest-500"
          >
            <View className="h-12 w-12 rounded-full bg-sand-50" />
          </Pressable>
        </View>
      </CameraView>
      <Text className="bg-forest-900 px-4 py-3 text-center font-body text-sm text-sand-200">
        {t('camera.hint')}
      </Text>
    </View>
  );
}
