import { Alert, Platform } from 'react-native';
import * as Sharing from 'expo-sharing';

import { t } from '@/src/i18n';

/** Share a local image file via the system sheet (Telegram, IG, Files, etc.). */
export async function shareImageFile(
  fileUri: string,
  dialogTitle?: string,
): Promise<boolean> {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.open(fileUri, '_blank');
        return true;
      }
      Alert.alert(t('common.error'), t('share.webNoFile'));
      return false;
    }

    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert(t('common.error'), t('share.failed'));
      return false;
    }

    await Sharing.shareAsync(fileUri, {
      mimeType: 'image/jpeg',
      dialogTitle: dialogTitle ?? t('share.dialogTitle'),
      UTI: 'public.jpeg',
    });
    return true;
  } catch (err) {
    Alert.alert(
      t('common.error'),
      err instanceof Error ? err.message : t('share.failed'),
    );
    return false;
  }
}

/** Save image to the device photo library. */
export async function saveImageToLibrary(fileUri: string): Promise<boolean> {
  try {
    if (Platform.OS === 'web') {
      Alert.alert(t('share.savedTitle'), t('share.webDownloadHint'));
      if (typeof window !== 'undefined') {
        window.open(fileUri, '_blank');
      }
      return true;
    }

    // Lazy import — keeps web from loading native media-library paths.
    const MediaLibrary = await import('expo-media-library');
    const permission = await MediaLibrary.requestPermissionsAsync(true);
    if (!permission.granted) {
      Alert.alert(t('common.error'), t('share.savePermission'));
      return false;
    }

    await MediaLibrary.createAssetAsync(fileUri);
    Alert.alert(t('share.savedTitle'), t('share.savedBody'));
    return true;
  } catch (err) {
    Alert.alert(
      t('common.error'),
      err instanceof Error ? err.message : t('share.saveFailed'),
    );
    return false;
  }
}
