import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { ListRow } from '@/src/components/ListRow';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { DIRECTORY_CATEGORIES } from '@/src/services/directories';
import { t } from '@/src/i18n';
import { brand } from '@/src/theme/brand';

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  vets: 'medkit-outline',
  breeders: 'ribbon-outline',
  transport: 'car-outline',
  sitters: 'home-outline',
  insurance: 'shield-checkmark-outline',
  lodging: 'bed-outline',
};

export default function DirectoriesHubScreen() {
  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader title={t('tabs.directories')} subtitle={t('directories.lead')} />
          <Text style={styles.hint}>{t('directories.hint')}</Text>
          <ListRow
            title={t('directories.carriersTitle')}
            subtitle={t('directories.carriersHubBody')}
            leading={
              <Ionicons
                name="bus-outline"
                size={22}
                color={brand.tealPressed}
              />
            }
            onPress={() =>
              router.push('/(app)/directory-carriers' as never)
            }
          />
          {DIRECTORY_CATEGORIES.map((cat) => (
            <ListRow
              key={cat.id}
              title={t(`directories.cat.${cat.id}`)}
              subtitle={t(`directories.catBody.${cat.id}`)}
              leading={
                <Ionicons
                  name={ICONS[cat.id] ?? 'location-outline'}
                  size={22}
                  color={brand.tealPressed}
                />
              }
              onPress={() =>
                router.push({
                  pathname: '/(app)/directory-list',
                  params: { category: cat.id },
                } as never)
              }
            />
          ))}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  hint: {
    marginBottom: 12,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#3A5A54',
  },
});
