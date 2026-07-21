import { Text, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';

type Props = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = t('common.error'),
  message,
  onRetry,
}: Props) {
  return (
    <View className="items-center justify-center px-6 py-8">
      <Text className="font-display text-xl text-forest-900">{title}</Text>
      <Text className="mt-2 text-center font-body text-base leading-6 text-forest-600">
        {message}
      </Text>
      {onRetry ? (
        <View className="mt-5 w-full max-w-xs">
          <PrimaryButton label={t('common.tryAgain')} onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
}
