import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { LoadingState } from '@/src/components/LoadingState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import { getUserProfile, saveUserProfile } from '@/src/services/userProfile';
import { brand } from '@/src/theme/brand';

export default function EditAccountScreen() {
  const [displayName, setDisplayName] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void getUserProfile()
        .then((p) => {
          setDisplayName(p?.display_name ?? '');
          setCity(p?.city ?? '');
        })
        .finally(() => setLoading(false));
    }, []),
  );

  const save = async () => {
    const name = displayName.trim();
    if (!name) {
      notify(t('common.error'), t('me.displayNameRequired'));
      return;
    }
    setBusy(true);
    try {
      await saveUserProfile({
        display_name: name,
        city: city.trim() || null,
      });
      notify(t('me.savedTitle'), t('editAccount.saved'));
    } catch (err) {
      notify(
        t('common.error'),
        err instanceof Error ? err.message : t('me.saveError'),
      );
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <LoadingState message={t('common.loading')} />;
  }

  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader
            title={t('editAccount.title')}
            subtitle={t('editAccount.subtitle')}
          />
          <Text style={styles.label}>{t('me.displayName')}</Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder={t('me.displayNamePlaceholder')}
            placeholderTextColor="#8AA8A0"
            autoCapitalize="words"
            style={styles.input}
          />
          <Text style={styles.label}>{t('me.city')}</Text>
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder={t('me.cityPlaceholder')}
            placeholderTextColor="#8AA8A0"
            autoCapitalize="words"
            style={styles.input}
          />
          <View style={styles.gap} />
          <PrimaryButton
            label={t('common.save')}
            loading={busy}
            onPress={() => void save()}
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  label: {
    marginTop: 12,
    marginBottom: 6,
    fontFamily: 'Figtree_500Medium',
    fontSize: 13,
    color: '#5A6B7D',
  },
  input: {
    borderWidth: 1,
    borderColor: brand.mistBorder,
    borderRadius: 14,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'Figtree_400Regular',
    fontSize: 15,
    color: brand.ink,
  },
  gap: { height: 16 },
});
