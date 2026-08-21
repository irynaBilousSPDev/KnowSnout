import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { HubHero } from '@/src/components/HubHero';
import { ListRow } from '@/src/components/ListRow';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import { brand, fonts } from '@/src/theme/brand';

const PLANS = [
  { id: 'free', priceKey: 'subscription.priceFree' as const },
  { id: 'plus', priceKey: 'subscription.pricePlus' as const },
  { id: 'pro', priceKey: 'subscription.pricePro' as const },
];

/** HTML kit · Підписка — plan cards + accent CTA. */
export default function SubscriptionScreen() {
  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <HubHero
            title={t('subscription.title')}
            lead={t('subscription.subtitle')}
          />
          <View style={styles.leadCard}>
            <Text style={styles.lead}>{t('subscription.lead')}</Text>
          </View>
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
  leadCard: {
    marginBottom: 12,
    borderRadius: brand.radius.md,
    backgroundColor: brand.accentTint,
    padding: 14,
  },
  lead: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: brand.accentDark,
  },
  gap: { height: 12 },
});
