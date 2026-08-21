import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import { createForumThread, listForumCategories } from '@/src/services/forum';
import { useToast } from '@/src/hooks/useToast';
import { brand } from '@/src/theme/brand';

export default function ForumNewScreen() {
  const { categoryId: paramCat } = useLocalSearchParams<{ categoryId?: string }>();
  const { showToast } = useToast();
  const categories = useMemo(() => listForumCategories(), []);
  const [categoryId, setCategoryId] = useState(
    paramCat || categories[0]?.id || '',
  );
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!title.trim() || !body.trim()) {
      notify(t('common.error'), t('forum.newRequired'));
      return;
    }
    setBusy(true);
    try {
      const thread = await createForumThread({ categoryId, title, body });
      showToast(t('toast.forumSaved'));
      router.replace({
        pathname: '/(app)/forum-thread',
        params: { id: thread.id },
      } as never);
    } catch {
      notify(t('common.error'), t('forum.newError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader title={t('forum.newTitle')} subtitle={t('forum.newSubtitle')} />

          <Text style={styles.label}>{t('forum.category')}</Text>
          {categories.map((c) => {
            const active = c.id === categoryId;
            return (
              <Pressable
                key={c.id}
                onPress={() => setCategoryId(c.id)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {c.title}
                </Text>
              </Pressable>
            );
          })}

          <Text style={styles.label}>{t('forum.threadTitleField')}</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={t('forum.threadTitlePlaceholder')}
            placeholderTextColor="#8AA8A0"
            style={styles.input}
          />
          <Text style={styles.label}>{t('forum.threadBody')}</Text>
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder={t('forum.threadBodyPlaceholder')}
            placeholderTextColor="#8AA8A0"
            multiline
            style={[styles.input, styles.area]}
          />
          <View style={styles.gap} />
          <PrimaryButton
            label={t('forum.publish')}
            loading={busy}
            onPress={() => void submit()}
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  label: {
    marginTop: 14,
    marginBottom: 6,
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    color: '#5A6B7D',
  },
  chip: {
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  chipActive: {
    backgroundColor: brand.mist,
    borderColor: brand.navy,
  },
  chipText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    color: brand.ink,
  },
  chipTextActive: { color: brand.navy },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: brand.ink,
  },
  area: { minHeight: 120, textAlignVertical: 'top' },
  gap: { height: 14 },
});
