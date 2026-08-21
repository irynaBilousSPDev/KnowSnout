import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import {
  isNativeSafeImageUri,
  persistPickerAsset,
} from '@/src/lib/image';
import { brand } from '@/src/theme/brand';

type Props = {
  label: string;
  uri: string | null;
  onChange: (uri: string | null) => void;
  height?: number;
  aspect?: [number, number];
  emptyHint?: string;
  filePrefix?: string;
};

/**
 * Standard attach flow: visible preview + gallery or camera.
 * Always persists to a native-safe file:// (or data: on web).
 */
export function PhotoAttachField({
  label,
  uri,
  onChange,
  height = 200,
  aspect = [4, 3],
  emptyHint,
  filePrefix = 'photo',
}: Props) {
  const [busy, setBusy] = useState(false);
  const previewOk = isNativeSafeImageUri(uri);

  const pick = async (source: 'gallery' | 'camera') => {
    setBusy(true);
    try {
      if (source === 'camera') {
        const cam = await ImagePicker.requestCameraPermissionsAsync();
        if (!cam.granted) {
          Alert.alert(t('common.error'), t('photo.cameraPermission'));
          return;
        }
      } else {
        const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!lib.granted) {
          Alert.alert(t('common.error'), t('photo.galleryPermission'));
          return;
        }
      }

      // base64: true avoids blob: crashes after crop (ImageEditingManager).
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
        aspect,
        base64: true,
      };

      const picked =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);

      if (picked.canceled || !picked.assets[0]?.uri) return;
      const stable = await persistPickerAsset(picked.assets[0], filePrefix);
      onChange(stable);
    } catch (err) {
      Alert.alert(
        t('common.error'),
        err instanceof Error && err.message === 'IMAGE_PERSIST_FAILED'
          ? t('photo.persistFailed')
          : err instanceof Error
            ? err.message
            : t('common.error'),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <View>
      <Text style={styles.label}>{label}</Text>

      <View style={[styles.preview, { height }]}>
        {uri && previewOk ? (
          <Image
            source={{ uri }}
            style={styles.image}
            resizeMode="cover"
            accessibilityLabel={label}
          />
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {uri && !previewOk
                ? t('photo.persistFailed')
                : (emptyHint ?? t('photo.emptyHint'))}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.row}>
        <View style={styles.flex}>
          <PrimaryButton
            label={t('photo.gallery')}
            variant="secondary"
            loading={busy}
            onPress={() => void pick('gallery')}
          />
        </View>
        <View style={styles.flex}>
          <PrimaryButton
            label={t('photo.camera')}
            variant="secondary"
            loading={busy}
            onPress={() => void pick('camera')}
          />
        </View>
      </View>

      {uri ? (
        <View style={styles.remove}>
          <PrimaryButton
            label={t('photo.remove')}
            variant="ghost"
            onPress={() => onChange(null)}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: brand.navy,
  },
  preview: {
    marginTop: 8,
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: brand.mist,
    borderWidth: 1,
    borderColor: brand.mistBorder,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#5A6B7D',
  },
  row: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
  },
  flex: {
    flex: 1,
  },
  remove: {
    marginTop: 8,
  },
});
