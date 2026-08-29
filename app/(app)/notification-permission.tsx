import { router, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { SystemCenterScreen } from '@/src/components/system/SystemUi';
import { t } from '@/src/i18n';
import { ensureNotificationPermission } from '@/src/services/vaccineReminders';
import { brand } from '@/src/theme/brand';

/** 08.05 · Дозвіл на сповіщення */
export default function NotificationPermissionScreen() {
  const { returnTo, petId } = useLocalSearchParams<{
    returnTo?: string;
    petId?: string;
  }>();

  const goBack = () => {
    if (returnTo === 'pet-vaccines' && petId) {
      router.replace({
        pathname: '/(app)/pet-vaccines',
        params: { petId },
      } as never);
      return;
    }
    router.back();
  };

  const enable = async () => {
    await ensureNotificationPermission();
    goBack();
  };

  return (
    <AppScreen edges={['top', 'bottom']}>
      <SystemCenterScreen
        icon={
          <Ionicons name="notifications-outline" size={32} color={brand.accent} />
        }
        title={t('permission.notifyTitle')}
        body={t('permission.notifyBody')}
        primaryLabel={t('permission.enableNotify')}
        onPrimary={() => void enable()}
        secondaryLabel={t('permission.later')}
        onSecondary={goBack}
        primaryBlock
      />
    </AppScreen>
  );
}
