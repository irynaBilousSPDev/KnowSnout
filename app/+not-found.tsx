import { Stack, router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { SystemCenterScreen } from '@/src/components/system/SystemUi';
import { t } from '@/src/i18n';
import { brand } from '@/src/theme/brand';

/** 08.03 · Сторінка 404 */
export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: t('common.notFoundTitle') }} />
      <AppScreen edges={['top', 'bottom']}>
        <SystemCenterScreen
          icon={
            <Ionicons name="help-circle-outline" size={34} color={brand.muted} />
          }
          title={t('common.notFoundTitle')}
          body={t('common.notFoundBody')}
          primaryLabel={t('common.goHome')}
          onPrimary={() => router.replace('/(app)/(tabs)' as never)}
          primaryBlock
        />
      </AppScreen>
    </>
  );
}
