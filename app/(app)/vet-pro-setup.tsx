import { router } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import { saveProProfile, type ProRoleId } from '@/src/services/vetDirectory';
import { brand, fonts } from '@/src/theme/brand';

const ROLES: {
  id: ProRoleId;
  titleKey: string;
  bodyKey: string;
  disabled?: boolean;
}[] = [
  {
    id: 'vet',
    titleKey: 'vets.proRoleVet',
    bodyKey: 'vets.proRoleVetBody',
  },
  {
    id: 'cynologist',
    titleKey: 'vets.proRoleCynologist',
    bodyKey: 'vets.proRoleCynologistBody',
  },
  {
    id: 'groomer',
    titleKey: 'vets.proRoleGroomer',
    bodyKey: 'vets.proRoleGroomerBody',
    disabled: true,
  },
];

/** 09.06 · Створити професійний профіль */
export default function VetProSetupScreen() {
  const [role, setRole] = useState<ProRoleId>('vet');
  const [fullName, setFullName] = useState('Олена Кравець');
  const [city, setCity] = useState('Варшава');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!fullName.trim()) return;
    setBusy(true);
    try {
      await saveProProfile({
        role,
        fullName: fullName.trim(),
        city: city.trim(),
        createdAt: new Date().toISOString(),
      });
      notify(t('common.ok'), t('vets.proCreated'));
      router.replace('/(app)/vet-pro-cabinet' as never);
    } catch {
      notify(t('common.error'), t('common.error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('vets.proSetupTitle')} titleSize={18} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <Text style={styles.lead}>{t('vets.proSetupLead')}</Text>

          <Text style={styles.sectionLbl}>{t('vets.proWho')}</Text>
          {ROLES.map((r) => {
            const on = role === r.id;
            const dim = r.disabled;
            return (
              <Pressable
                key={r.id}
                disabled={dim}
                onPress={() => setRole(r.id)}
                style={[
                  styles.roleCard,
                  on && styles.roleCardOn,
                  dim && styles.roleCardDim,
                ]}
              >
                <View style={[styles.radio, on && styles.radioOn]} />
                <View style={styles.roleCopy}>
                  <Text style={[styles.roleTitle, on && styles.roleTitleOn]}>
                    {t(r.titleKey)}
                  </Text>
                  <Text style={styles.roleBody}>{t(r.bodyKey)}</Text>
                </View>
              </Pressable>
            );
          })}

          <Text style={styles.label}>{t('vets.proFullName')}</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            style={styles.input}
            placeholderTextColor={brand.mutedSoft}
          />

          <Text style={styles.label}>{t('vets.proCity')}</Text>
          <TextInput
            value={city}
            onChangeText={setCity}
            style={styles.input}
            placeholderTextColor={brand.mutedSoft}
          />

          <View style={styles.info}>
            <Text style={styles.infoText}>{t('vets.proFreeNote')}</Text>
          </View>

          <PrimaryButton
            label={t('vets.proCreate')}
            loading={busy}
            onPress={() => void submit()}
            style={styles.btn}
          />
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
  lead: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 18,
    color: brand.muted,
  },
  sectionLbl: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.ink,
    marginTop: 6,
  },
  roleCard: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: brand.radius.md,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    padding: 14,
  },
  roleCardOn: {
    borderColor: brand.accentDark,
    backgroundColor: brand.accentTint,
  },
  roleCardDim: { opacity: 0.55 },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: brand.mistBorder,
    marginTop: 2,
  },
  radioOn: {
    borderColor: brand.accentDark,
    backgroundColor: brand.accentDark,
  },
  roleCopy: { flex: 1 },
  roleTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  },
  roleTitleOn: { color: brand.accentDark },
  roleBody: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: brand.muted,
    marginTop: 2,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: brand.muted,
    marginTop: 4,
  },
  input: {
    borderRadius: brand.radius.md,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.ink,
  },
  info: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.accentTint,
    padding: 14,
    marginTop: 4,
  },
  infoText: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    lineHeight: 16,
    color: brand.accentDark,
  },
  btn: { marginTop: 8 },
});
