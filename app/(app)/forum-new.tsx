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

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import { createForumThread, listForumCategories } from '@/src/services/forum';
import { useToast } from '@/src/hooks/useToast';
import { brand, fonts } from '@/src/theme/brand';

/** Screenshot 05.14 — Cancel | Нове питання | Опубл. + white fields */
export default function ForumNewScreen() {
  const { categoryId: paramCat } = useLocalSearchParams<{ categoryId?: string }>();
  const { showToast } = useToast();
  const categories = useMemo(() => listForumCategories(), []);
  const [categoryId, setCategoryId] = useState(
    paramCat || categories[0]?.id || '',
  );
  const [title, setTitle] = useState('Як привчити до нашийника?');
  const [body, setBody] = useState('Цуценя 3 місяці, боїться нашийника...');
  const [busy, setBusy] = useState(false);
  const [catOpen, setCatOpen] = useState(false);

  const selected = categories.find((c) => c.id === categoryId);

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
        <Text style={styles.barTitle}>{t('forum.newTitle')}</Text>
        <Pressable
          onPress={() => void submit()}
          disabled={busy}
          hitSlop={8}
          style={styles.barSide}
        >
          <Text style={[styles.publish, busy && styles.dim]}>
            {t('forum.publishShort')}
          </Text>
        </Pressable>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <Text style={styles.label}>{t('forum.category')}</Text>
          <Pressable
            onPress={() => setCatOpen((v) => !v)}
            style={styles.field}
          >
            <Text style={styles.fieldText}>{selected?.title ?? '—'}</Text>
          </Pressable>
          {catOpen
            ? categories.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => {
                    setCategoryId(c.id);
                    setCatOpen(false);
                  }}
                  style={[
                    styles.option,
                    c.id === categoryId && styles.optionActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      c.id === categoryId && styles.optionTextActive,
                    ]}
                  >
                    {c.title}
                  </Text>
                </Pressable>
              ))
            : null}

          <Text style={styles.label}>{t('forum.threadTitleField')}</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={t('forum.threadTitlePlaceholder')}
            placeholderTextColor={brand.mutedSoft}
            style={styles.field}
          />

          <Text style={styles.label}>{t('forum.threadBody')}</Text>
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder={t('forum.threadBodyPlaceholder')}
            placeholderTextColor={brand.mutedSoft}
            multiline
            style={[styles.field, styles.area]}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  barSide: { minWidth: 72 },
  cancel: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: brand.muted,
  },
  barTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.title,
    fontSize: 17,
    color: brand.ink,
  },
  publish: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: brand.accent,
    textAlign: 'right',
  },
  dim: { opacity: 0.5 },
  pad: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  label: {
    marginTop: 14,
    marginBottom: 8,
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
  },
  field: {
    borderRadius: 14,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: fonts.body,
    fontSize: 15,
    color: brand.ink,
  },
  fieldText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: brand.ink,
  },
  area: { minHeight: 110, textAlignVertical: 'top' },
  option: {
    marginTop: 6,
    borderRadius: 12,
    backgroundColor: brand.creamDeep,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  optionActive: { backgroundColor: brand.mist },
  optionText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: brand.ink,
  },
  optionTextActive: {
    fontFamily: fonts.bodyBold,
    color: brand.accent,
  },
});
