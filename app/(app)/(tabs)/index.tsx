import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { ListRow } from '@/src/components/ListRow';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { useAuth } from '@/src/hooks/useAuth';
import { t } from '@/src/i18n';
import { listPets } from '@/src/services/pets';
import { listScans } from '@/src/services/scans';
import { brand } from '@/src/theme/brand';

type CheckKind = 'food' | 'plant' | 'breed';

function CheckCard({
  kind,
  icon,
  onPress,
}: {
  kind: CheckKind;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.cardPressed}>
      <View style={styles.card}>
        <View style={styles.cardIcon}>
          <Ionicons name={icon} size={26} color={brand.tealPressed} />
        </View>
        <View style={styles.cardCopy}>
          <Text style={styles.cardTitle}>{t(`check.${kind}Title`)}</Text>
          <Text style={styles.cardBody}>{t(`check.${kind}Body`)}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#7FD9C9" />
      </View>
    </Pressable>
  );
}

export default function CheckHubScreen() {
  const { user } = useAuth();
  const [petCount, setPetCount] = useState<number | null>(null);
  const [scanCount, setScanCount] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      void (async () => {
        try {
          const [pets, scans] = await Promise.all([listPets(), listScans()]);
          if (!alive) return;
          setPetCount(pets.length);
          setScanCount(scans.length);
        } catch {
          if (!alive) return;
          setPetCount(null);
          setScanCount(null);
        }
      })();
      return () => {
        alive = false;
      };
    }, []),
  );

  const statsText =
    petCount != null && scanCount != null
      ? petCount === 0 && scanCount === 0
        ? t('check.statsEmpty')
        : t('check.statsStub', { pets: petCount, scans: scanCount })
      : null;

  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.scroll}>
          <ScreenHeader
            subtitle={`${t('scan.signedInAs')} ${user?.email ?? ''}`}
          />

          <Text style={styles.lead}>{t('check.lead')}</Text>

          <CheckCard
            kind="food"
            icon="nutrition-outline"
            onPress={() => router.push('/(app)/scan-food')}
          />
          <CheckCard
            kind="plant"
            icon="leaf-outline"
            onPress={() => router.push('/(app)/plant-safety')}
          />
          <CheckCard
            kind="breed"
            icon="paw-outline"
            onPress={() => router.push('/(app)/breed-scan')}
          />

          {statsText ? <Text style={styles.stats}>{statsText}</Text> : null}

          <Text style={styles.section}>{t('check.moreSection')}</Text>
          <ListRow
            title={t('check.journalRow')}
            subtitle={t('check.journalRowBody')}
            leading={
              <Ionicons
                name="journal-outline"
                size={22}
                color={brand.tealPressed}
              />
            }
            onPress={() => router.push('/(app)/(tabs)/history')}
          />
          <ListRow
            title={t('check.compareRow')}
            subtitle={t('check.compareRowBody')}
            leading={
              <Ionicons
                name="git-compare-outline"
                size={22}
                color={brand.tealPressed}
              />
            }
            onPress={() => router.push('/(app)/compare-food' as never)}
          />
          <ListRow
            title={t('check.onboardingRow')}
            subtitle={t('check.onboardingRowBody')}
            leading={
              <Ionicons
                name="sparkles-outline"
                size={22}
                color={brand.tealPressed}
              />
            }
            onPress={() => router.push('/(app)/onboarding' as never)}
          />

          <Text style={styles.hint}>{t('check.journalHint')}</Text>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  lead: {
    marginBottom: 16,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: '#3A5A54',
  },
  card: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  cardPressed: {
    opacity: 0.88,
  },
  cardIcon: {
    marginRight: 12,
    height: 48,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: brand.mist,
  },
  cardCopy: {
    flex: 1,
    paddingRight: 8,
  },
  cardTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 17,
    color: brand.ink,
  },
  cardBody: {
    marginTop: 4,
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: '#3A5A54',
  },
  stats: {
    marginTop: 4,
    marginBottom: 4,
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: '#5A7A72',
  },
  section: {
    marginTop: 18,
    marginBottom: 8,
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: '#5A7A72',
  },
  hint: {
    marginTop: 8,
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#7A9A92',
  },
});
