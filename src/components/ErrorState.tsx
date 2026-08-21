import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import { brand } from '@/src/theme/brand';

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
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <View style={styles.btn}>
          <PrimaryButton label={t('common.tryAgain')} onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  title: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 20,
    color: brand.ink,
  },
  message: {
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: brand.muted,
  },
  btn: { marginTop: 20, width: '100%', maxWidth: 280 },
});
