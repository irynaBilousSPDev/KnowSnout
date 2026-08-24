import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { t } from '@/src/i18n';
import { persistPickerAsset } from '@/src/lib/image';
import { notify } from '@/src/lib/notify';
import { listPets } from '@/src/services/pets';
import {
  applySpotlightEntry,
  listSpotlightContests,
} from '@/src/services/spotlight';
import { brand, fonts } from '@/src/theme/brand';
import type { PetRow } from '@/src/types/pet';

/** Screenshot 04.19 — Cancel / Заявка / Надіслати + dashed photo + pill fields */
export default function SpotlightApplyScreen() {
  const { contestId: contestIdParam } = useLocalSearchParams<{
    contestId?: string;
  }>();
  const [pets, setPets] = useState<PetRow[]>([]);
  const [petId, setPetId] = useState<string | null>(null);
  const [caption, setCaption] = useState(
    'Найкраща поза після відкриття морозива',
  );
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void listPets()
        .then((rows) => {
          setPets(rows);
          const tukan = rows.find((p) => p.name === 'Тукан');
          setPetId((cur) => cur ?? tukan?.id ?? rows[0]?.id ?? null);
        })
        .catch(() => setPets([]));
    }, []),
  );

  const contestId =
    (typeof contestIdParam === 'string' && contestIdParam) ||
    listSpotlightContests()[0]?.id ||
    '';

  const pickPhoto = async () => {
    const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!lib.granted) {
      notify(t('common.error'), t('photo.galleryPermission'));
      return;
    }
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
      base64: true,
    });
    if (picked.canceled || !picked.assets[0]?.uri) return;
    const stable = await persistPickerAsset(picked.assets[0], 'spotlight');
    setPhotoUri(stable);
  };

  const submit = async () => {
    const pet = pets.find((p) => p.id === petId);
    const name = pet?.name?.trim() || 'Тукан';
    if (!caption.trim()) {
      notify(t('common.error'), t('spotlight.captionRequired'));
      return;
    }
    setBusy(true);
    try {
      const entry = await applySpotlightEntry({
        contestId,
        petName: name,
        caption,
        photoUri,
      });
      router.replace({
        pathname: '/(app)/spotlight-entry',
        params: { id: entry.id },
      } as never);
    } catch {
      notify(t('common.error'), t('spotlight.applyError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <View style={styles.bar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={styles.barSide}
        >
          <Text style={styles.cancel}>{t('common.cancel')}</Text>
        </Pressable>
        <Text style={styles.barTitle}>{t('spotlight.applyTitle')}</Text>
        <Pressable
          onPress={() => void submit()}
          disabled={busy}
          hitSlop={8}
          style={styles.barSide}
        >
          <Text style={[styles.send, busy && styles.dim]}>
            {t('spotlight.submit')}
          </Text>
        </Pressable>
      </View>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <Pressable onPress={() => void pickPhoto()} style={styles.photoSlot}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photoImg} />
            ) : (
              <>
                <Ionicons
                  name="image-outline"
                  size={28}
                  color={brand.mutedSoft}
                />
                <Text style={styles.photoHint}>{t('spotlight.addPetPhoto')}</Text>
              </>
            )}
          </Pressable>

          <Text style={styles.label}>{t('spotlight.pickPet')}</Text>
          <View style={styles.input}>
            <Text style={styles.inputT}>
              {pets.find((p) => p.id === petId)?.name ?? 'Тукан'}
            </Text>
          </View>

          <Text style={styles.label}>{t('spotlight.photoCaption')}</Text>
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder={t('spotlight.captionPlaceholder')}
            placeholderTextColor={brand.mutedSoft}
            multiline
            style={[styles.input, styles.area]}
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  barSide: { width: 88 },
  cancel: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: brand.muted,
  },
  barTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.title,
    fontSize: 18,
    color: brand.ink,
  },
  send: {
    textAlign: 'right',
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.accent,
  },
  dim: { opacity: 0.45 },
  pad: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40, gap: 10 },
  photoSlot: {
    height: 210,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: brand.mistBorder,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
    marginBottom: 6,
  },
  photoImg: { width: '100%', height: '100%' },
  photoHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.mutedSoft,
  },
  label: {
    marginTop: 6,
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: brand.mutedSoft,
  },
  input: {
    borderRadius: brand.radius.pill,
    backgroundColor: brand.surfaceElevated,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    paddingHorizontal: 18,
    paddingVertical: 14,
    minHeight: 48,
    justifyContent: 'center',
  },
  inputT: { fontFamily: fonts.body, fontSize: 15, color: brand.ink },
  area: {
    minHeight: 88,
    borderRadius: 20,
    alignItems: 'flex-start',
    paddingTop: 14,
    textAlignVertical: 'top',
    fontFamily: fonts.body,
    fontSize: 15,
    color: brand.ink,
  },
});
