import * as ImagePicker from 'expo-image-picker';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ScrHeader } from '@/src/components/ScrHeader';
import { PhotoEmptyState } from '@/src/components/system/SystemUi';
import { t } from '@/src/i18n';
import { brand, fonts } from '@/src/theme/brand';

/** 08.06 · Порожній стан фото (уніфікований) */
export default function PetPhotosScreen() {
  const addPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(t('photo.galleryPermission'));
      return;
    }
    Alert.alert(t('photo.addTitle'), t('photo.addSoon'));
  };

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('photo.albumTitle')} titleSize={20} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <PhotoEmptyState
            hint={t('photo.albumEmptyHint')}
            actionLabel={t('photo.addPhoto')}
            onAction={() => void addPhoto()}
          />
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
  },
  title: {
    fontFamily: fonts.title,
    fontSize: 22,
    color: brand.ink,
    marginBottom: 8,
  },
});
