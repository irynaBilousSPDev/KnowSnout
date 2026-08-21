import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { HubHero } from '@/src/components/HubHero';
import { ListRow } from '@/src/components/ListRow';
import { ProfileEntry } from '@/src/components/ProfileEntry';
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
          <Ionicons name={icon} size={26} color={brand.navy} />
        </View>
        <View style={styles.cardCopy}>
          <Text style={styles.cardTitle}>{t(`check.${kind}Title`)}</Text>
          <Text style={styles.cardBody}>{t(`check.${kind}Body`)}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={brand.mistBorder} />
      </View>
    </Pressable>
  );
}

export default function CheckHubScreen() {
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
          <HubHero
            brandMark
            title={t('tabs.check')}
            lead={t('check.lead')}
            right={<ProfileEntry />}
            stats={
              statsText ? (
                <Text style={styles.stats}>{statsText}</Text>
              ) : undefined
            }
          />

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

          <Text style={styles.section}>{t('check.moreSection')}</Text>
          <ListRow
            variant="flat"
            title={t('check.journalRow')}
            subtitle={t('check.journalRowBody')}
            leading={
              <Ionicons name="journal-outline" size={22} color={brand.navy} />
            }
            onPress={() => router.push('/(app)/(tabs)/history')}
          />
          <ListRow
            variant="flat"
            title={t('check.compareRow')}
            subtitle={t('check.compareRowBody')}
            leading={
              <Ionicons
                name="git-compare-outline"
                size={22}
                color={brand.navy}
              />
            }
            onPress={() => router.push('/(app)/compare-food' as never)}
          />
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
  cardPressed: { opacity: 0.88 },
  cardIcon: {
    marginRight: 12,
    height: 48,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: brand.forestTint,
  },
  cardCopy: { flex: 1, paddingRight: 8 },
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
    color: brand.muted,
  },
  stats: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    lineHeight: 18,
    color: brand.forest,
  },
  section: {
    marginTop: 22,
    marginBottom: 4,
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: brand.mutedSoft,
  },
});
