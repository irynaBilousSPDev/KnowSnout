import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { ListRow } from '@/src/components/ListRow';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';

const PLANS = [
  { id: 'free', priceKey: 'subscription.priceFree' as const },
  { id: 'plus', priceKey: 'subscription.pricePlus' as const },
  { id: 'pro', priceKey: 'subscription.pricePro' as const },
];

export default function SubscriptionScreen() {
  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader
            title={t('subscription.title')}
            subtitle={t('subscription.subtitle')}
          />
          <Text style={styles.lead}>{t('subscription.lead')}</Text>
          {PLANS.map((plan) => (
            <ListRow
              key={plan.id}
              title={t(`subscription.plan.${plan.id}`)}
              subtitle={t(`subscription.planBody.${plan.id}`)}
              meta={t(plan.priceKey)}
              showChevron={false}
            />
          ))}
          <View style={styles.gap} />
          <PrimaryButton
            label={t('subscription.mockSubscribe')}
            onPress={() =>
              Alert.alert(
                t('subscription.mockTitle'),
                t('subscription.mockBody'),
              )
            }
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  lead: {
    marginBottom: 12,
    fontFamily: 'Figtree_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#5A6B7D',
  },
  gap: { height: 12 },
});
