import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { useToast } from '@/src/hooks/useToast';
import { t } from '@/src/i18n';
import { brand, fonts } from '@/src/theme/brand';

/** 08.07 · Успішне збереження (toast demo) */
export default function PetSaveDemoScreen() {
  const { showSavedToast } = useToast();

  useEffect(() => {
    showSavedToast();
  }, [showSavedToast]);

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <Text style={styles.title}>{t('pets.profileSavedTitle')}</Text>
          <View style={styles.card}>
            <Text style={styles.row}>{t('pets.demoNameLine')}</Text>
            <Text style={styles.row}>{t('pets.demoBreedLine')}</Text>
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 120,
    gap: 12,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: 22,
    color: brand.ink,
  },
  card: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: brand.mistBorder,
  },
  row: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.ink,
  },
});
