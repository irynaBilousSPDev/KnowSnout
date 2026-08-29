import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { SystemCenterScreen } from '@/src/components/system/SystemUi';
import { t } from '@/src/i18n';
import { brand } from '@/src/theme/brand';

/** 08.02 · Помилка мережі */
export default function NetworkErrorScreen() {
  return (
    <AppScreen edges={['top', 'bottom']}>
      <SystemCenterScreen
        icon={
          <Ionicons name="cloud-offline-outline" size={32} color={brand.accent} />
        }
        title={t('network.title')}
        body={t('network.body')}
        primaryLabel={t('network.retry')}
        onPrimary={() => router.back()}
        primaryBlock
      />
    </AppScreen>
  );
}
