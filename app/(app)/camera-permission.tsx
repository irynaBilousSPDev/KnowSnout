import { router, useLocalSearchParams } from 'expo-router';
import { useCameraPermissions } from 'expo-camera';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { SystemCenterScreen } from '@/src/components/system/SystemUi';
import { t } from '@/src/i18n';
import { brand } from '@/src/theme/brand';

/** 08.04 · Дозвіл на камеру */
export default function CameraPermissionScreen() {
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const [, requestPermission] = useCameraPermissions();

  const allow = async () => {
    const result = await requestPermission();
    if (result.granted) {
      if (returnTo === 'scan-food') {
        router.back();
        return;
      }
      router.replace('/(app)/camera-gallery' as never);
      return;
    }
    router.back();
  };

  return (
    <AppScreen edges={['top', 'bottom']}>
      <SystemCenterScreen
        icon={<Ionicons name="camera-outline" size={32} color={brand.accent} />}
        title={t('permission.cameraTitle')}
        body={t('permission.cameraBody')}
        primaryLabel={t('permission.allow')}
        onPrimary={() => void allow()}
        secondaryLabel={t('permission.notNow')}
        onSecondary={() => router.back()}
        primaryBlock
      />
    </AppScreen>
  );
}
