import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import {
  ServiceOfferCard,
  TopicRatingRow,
} from '@/src/components/specialists/SpecialistUi';
import { VetDashedPhoto, VetPill } from '@/src/components/vets/VetUi';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import { getSpecialist } from '@/src/services/specialistDirectory';
import { brand, fonts } from '@/src/theme/brand';

/** 10.03 · Профіль спеціаліста */
export default function SpecialistProfileScreen() {
  const { id = 'natalia-dmytruk', problem = 'separation-anxiety', petId = 'tukan' } =
    useLocalSearchParams<{ id?: string; problem?: string; petId?: string }>();
  const specialist = getSpecialist(id);

  if (!specialist) {
    return null;
  }

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader
        title={t('specialist.profileTitle')}
        titleSize={20}
        right={
          <Pressable style={styles.moreBtn}>
            <Ionicons name="ellipsis-horizontal" size={18} color={brand.ink} />
          </Pressable>
        }
      />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <View style={styles.heroRow}>
            <VetDashedPhoto label={t('specialist.photoLabel')} size={88} />
            <View style={styles.heroCopy}>
              <Text style={styles.name}>{specialist.name}</Text>
              <Text style={styles.sub}>
                {specialist.roles[0]} · {specialist.yearsPractice}{' '}
                {t('specialist.years')}
              </Text>
              <Text style={styles.rating}>
                ★ {specialist.rating.toFixed(1)} · {specialist.reviewCount}
              </Text>
              <View style={styles.langRow}>
                {specialist.languages.map((lang) => (
                  <VetPill key={lang} label={lang} />
                ))}
              </View>
            </View>
          </View>

          <Text style={styles.lbl}>{t('specialist.roleSection')}</Text>
          <View style={styles.tagRow}>
            {specialist.roles.map((role) => (
              <VetPill key={role} label={role} />
            ))}
          </View>

          <Text style={styles.lbl}>{t('specialist.worksWith')}</Text>
          <View style={styles.tagRow}>
            {specialist.problems.map((p) => (
              <VetPill key={p} label={p} tint="green" />
            ))}
          </View>

          <Text style={styles.lbl}>{t('specialist.formatSection')}</Text>
          <View style={styles.list}>
            {specialist.services.map((svc) => (
              <ServiceOfferCard
                key={svc.id}
                title={t(svc.titleKey)}
                subtitle={t(svc.subtitleKey)}
                price={`₴${svc.priceUah.toLocaleString('uk-UA')}`}
                iconTint={svc.iconTint}
              />
            ))}
          </View>

          <Text style={styles.lbl}>{t('specialist.approachSection')}</Text>
          <Text style={styles.body}>{t(specialist.approachKey)}</Text>

          <View style={styles.verifyCard}>
            <Text style={styles.verifyTitle}>{t('specialist.verifyTitle')}</Text>
            <View style={styles.tagRow}>
              {specialist.verification.map((v) => (
                <VetPill key={v} label={`✓ ${v}`} tint="green" />
              ))}
            </View>
          </View>

          <View style={styles.ratingCard}>
            <View style={styles.ratingHead}>
              <Text style={styles.ratingTitle}>{t('specialist.topicRatingTitle')}</Text>
              <Text style={styles.ratingOverall}>
                ★ {specialist.rating.toFixed(1)}
              </Text>
            </View>
            {specialist.topicRatings.map((row) => (
              <TopicRatingRow
                key={row.topicKey}
                label={t(row.topicKey)}
                count={row.count}
                rating={row.rating}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label={t('specialist.book')}
          onPress={() =>
            router.push({
              pathname: '/(app)/specialist-booking',
              params: { id: specialist.id, problem, petId },
            } as never)
          }
          style={styles.footerBtn}
        />
        <PrimaryButton
          label={t('specialist.write')}
          variant="secondary"
          onPress={() => router.push('/(app)/directory-chat' as never)}
          style={styles.footerBtn}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  moreBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pad: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100,
    gap: 10,
  },
  heroRow: { flexDirection: 'row', gap: 14 },
  heroCopy: { flex: 1, gap: 4 },
  name: {
    fontFamily: fonts.title,
    fontSize: 18,
    color: brand.ink,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: brand.muted,
  },
  rating: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.accentDark,
  },
  langRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  lbl: {
    marginTop: 6,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: brand.muted,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  list: { gap: 8 },
  body: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 20,
    color: brand.muted,
  },
  verifyCard: {
    marginTop: 6,
    borderRadius: brand.radius.md,
    backgroundColor: brand.accentTint,
    padding: 14,
    gap: 10,
  },
  verifyTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.ink,
  },
  ratingCard: {
    marginTop: 6,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    padding: 14,
    gap: 12,
  },
  ratingHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  },
  ratingOverall: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.accentDark,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
  },
  footerBtn: { flex: 1 },
});
