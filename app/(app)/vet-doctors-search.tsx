import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { VetDashedPhoto, VetPill } from '@/src/components/vets/VetUi';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import { listVetDoctors } from '@/src/services/vetDirectory';
import { brand, fonts } from '@/src/theme/brand';

/** 09.02 · Пошук лікарів (кардіологи) */
export default function VetDoctorsSearchScreen() {
  const { spec } = useLocalSearchParams<{ spec?: string }>();
  const title = spec?.trim() || t('vets.cardiologistsTitle');
  const doctors = listVetDoctors({
    specialization: spec?.trim() || 'Кардіологія',
  });

  const filters = [
    { label: `${spec?.trim() || 'Кардіологія'} ✕`, active: true },
    { label: `${t('vets.filterPet')} ✕`, active: true },
    { label: 'Варшава', active: false },
    { label: t('vets.filterLangUk'), active: false },
  ];

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader
        title={title}
        titleSize={20}
        right={
          <Pressable style={styles.moreBtn}>
            <Ionicons name="ellipsis-horizontal" size={18} color={brand.ink} />
          </Pressable>
        }
      />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filters}
          >
            {filters.map((f) => (
              <View
                key={f.label}
                style={[styles.filterChip, f.active && styles.filterChipOn]}
              >
                <Text
                  style={[styles.filterText, f.active && styles.filterTextOn]}
                >
                  {f.label}
                </Text>
              </View>
            ))}
          </ScrollView>

          {doctors.map((doc) => (
            <Pressable
              key={doc.id}
              onPress={() =>
                router.push({
                  pathname: '/(app)/vet-doctor-profile',
                  params: { id: doc.id },
                } as never)
              }
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            >
              {doc.promoted ? (
                <Text style={styles.adBadge}>{t('vets.adBadge')}</Text>
              ) : null}
              <View style={styles.cardRow}>
                <VetDashedPhoto label="Фото" browse="or browse" size={56} />
                <View style={styles.cardCopy}>
                  <Text style={styles.name}>{doc.name}</Text>
                  <Text style={styles.sub}>{doc.listSubtitle}</Text>
                  <View style={styles.metaRow}>
                    {!doc.noReviewsYet ? (
                      <Text style={styles.rating}>
                        ★ {doc.rating.toFixed(1)} · {doc.reviewCount}{' '}
                        {t('vets.reviewsShort')}
                      </Text>
                    ) : (
                      <Text style={styles.noRev}>{t('vets.noReviewsYet')}</Text>
                    )}
                  </View>
                  <View style={styles.tagRow}>
                    {doc.verificationTags?.map((tag) => (
                      <VetPill key={tag} label={`✓ ${tag}`} tint="green" />
                    ))}
                    {doc.languages.length ? (
                      <VetPill label={doc.languages.join(' · ')} />
                    ) : null}
                  </View>
                </View>
              </View>
            </Pressable>
          ))}

          <Text style={styles.disclaimer}>{t('vets.adsDisclaimer')}</Text>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 40,
    gap: 10,
  },
  moreBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filters: { flexDirection: 'row', gap: 6, paddingBottom: 4 },
  filterChip: {
    borderRadius: brand.radius.pill,
    backgroundColor: brand.creamDeep,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterChipOn: { backgroundColor: brand.successTint },
  filterText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: brand.ink,
  },
  filterTextOn: {
    fontFamily: fonts.bodyBold,
    color: brand.successDark,
  },
  card: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    padding: 12,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  pressed: { opacity: 0.88 },
  adBadge: {
    position: 'absolute',
    top: 10,
    right: 12,
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 0.5,
    color: brand.terracotta,
  },
  cardRow: { flexDirection: 'row', gap: 12 },
  cardCopy: { flex: 1, gap: 4 },
  name: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
    paddingRight: 48,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: brand.muted,
  },
  metaRow: { marginTop: 2 },
  rating: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: brand.successDark,
  },
  noRev: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: brand.mutedSoft,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  disclaimer: {
    marginTop: 8,
    fontFamily: fonts.body,
    fontSize: 10.5,
    lineHeight: 15,
    color: brand.mutedSoft,
  },
});
