import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import { brand } from '@/src/theme/brand';

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
      <View style={[styles.card, styles.center, styles.cameraH]}>
        <Text style={styles.hint}>{t('camera.checking')}</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.card, styles.center, styles.cameraH, styles.pad]}>
        <Text style={[styles.hint, styles.centerText]}>
          {t('camera.needPermission')}
        </Text>
        <View style={styles.allowBtn}>
          <PrimaryButton label={t('camera.allow')} onPress={requestPermission} />
        </View>
      </View>
    );
  }

  if (previewUri) {
    return (
      <View style={styles.card}>
        <Image source={{ uri: previewUri }} style={styles.preview} />
        <View style={styles.previewActions}>
          <View style={styles.flex}>
            <PrimaryButton
              label={t('camera.retake')}
              variant="secondary"
              onPress={() => setPreviewUri(null)}
              disabled={disabled}
            />
          </View>
          <View style={styles.flex}>
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
    <View style={styles.card}>
      <View style={styles.cameraBox}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
        />
        <View style={styles.shutterWrap} pointerEvents="box-none">
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
            style={[
              styles.shutter,
              (disabled || capturing) && styles.shutterDim,
            ]}
          >
            <View style={styles.shutterInner} />
          </Pressable>
        </View>
      </View>
      <Text style={styles.hintBar}>{t('camera.hint')}</Text>
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
  preview: { height: 288, width: '100%' },
  previewActions: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: brand.ink,
    padding: 16,
  },
  flex: { flex: 1 },
  shutterWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  shutter: {
    height: 64,
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 4,
    borderColor: brand.surface,
    backgroundColor: brand.forest,
  },
  shutterDim: { opacity: 0.5 },
  shutterInner: {
    height: 48,
    width: 48,
    borderRadius: 999,
    backgroundColor: brand.surface,
  },
  hint: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 14,
    color: '#D8E8E2',
  },
  centerText: { textAlign: 'center', marginBottom: 16 },
  allowBtn: { width: '100%' },
  hintBar: {
    backgroundColor: brand.ink,
    paddingHorizontal: 16,
    paddingVertical: 12,
    textAlign: 'center',
    fontFamily: 'Figtree_400Regular',
    fontSize: 14,
    color: '#D8E8E2',
  },
});
