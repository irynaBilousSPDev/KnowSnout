import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import { brand, fonts } from '@/src/theme/brand';

const HISTORY = ['12.07.2026', '12.06.2026'];

/** 07.02 · Платежі */
export default function PaymentsScreen() {
  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('payments.title')} titleSize={20} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <View style={styles.activeCard}>
            <View style={styles.activeTop}>
              <Text style={styles.planName}>{t('subscription.plan.plus')}</Text>
              <Text style={styles.activeBadge}>{t('payments.active')}</Text>
            </View>
            <Text style={styles.activeMeta}>{t('payments.activeMeta')}</Text>
            <PrimaryButton
              label={t('payments.cancelSub')}
              variant="secondary"
              onPress={() =>
                Alert.alert(t('payments.cancelSub'), t('subscription.mockBody'))
              }
              style={styles.cancelBtn}
            />
          </View>

          <Text style={styles.historyLbl}>{t('payments.history')}</Text>
          {HISTORY.map((date) => (
            <View key={date} style={styles.historyRow}>
              <Text style={styles.historyDate}>{date}</Text>
              <Text style={styles.historyAmount}>₴149</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 10,
  },
  activeCard: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.accentTint,
    padding: 16,
    gap: 8,
  },
  activeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: brand.accentDark,
  },
  activeBadge: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: brand.successDark,
  },
  activeMeta: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: brand.accentDark,
  },
  cancelBtn: { marginTop: 4 },
  historyLbl: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: brand.muted,
    marginTop: 8,
    marginBottom: 2,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: brand.mistBorder,
  },
  historyDate: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: brand.ink,
  },
  historyAmount: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  },
});
