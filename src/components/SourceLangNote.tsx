import { Text, View } from 'react-native';

import { t } from '@/src/i18n';

type Props = {
  value?: string | null;
  className?: string;
};

/** Shows external English catalog text with an explicit “original in English” cue. */
export function SourceLangNote({ value, className }: Props) {
  const text = value?.trim();
  if (!text) return null;
  return (
    <View className={className}>
      <Text className="mb-0.5 font-body text-[11px] uppercase tracking-wide text-forest-500">
        {t('common.sourceEn')}
      </Text>
      <Text className="font-body text-sm leading-5 text-forest-700">{text}</Text>
    </View>
  );
}
