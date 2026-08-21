import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import {
  listModerationQueue,
  type ModerationItem,
  type ModerationItemType,
} from '@/src/services/adminModeration';
import { brand, fonts } from '@/src/theme/brand';

type FilterId = 'all' | ModerationItemType;

function typeLabel(type: ModerationItemType) {
  if (type === 'place') return t('admin.typePlace');
  if (type === 'post') return t('admin.typePost');
  if (type === 'rule') return t('admin.typeRule');
  return t('admin.typeComplaint');
}

function relativeTime(iso: string) {
  const mins = Math.max(1, Math.round((Date.now() - Date.parse(iso)) / 60_000));
  if (mins < 60) return t('admin.minsAgo', { n: mins });
  const hours = Math.round(mins / 60);
  if (hours < 24) return t('admin.hoursAgo', { n: hours });
  return t('admin.yesterday');
}

/** HTML · Єдина черга модерації. */
export default function AdminModerationScreen() {
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [filter, setFilter] = useState<FilterId>('all');

  useFocusEffect(
    useCallback(() => {
      void listModerationQueue().then(setItems);
    }, []),
  );

  const pending = useMemo(
    () => items.filter((i) => i.status === 'pending'),
    [items],
  );

  const filtered = useMemo(() => {
    if (filter === 'all') return pending;
    return pending.filter((i) => i.type === filter);
  }, [pending, filter]);

  const filters: { id: FilterId; label: string; count: number }[] = [
    { id: 'all', label: t('admin.filterAll'), count: pending.length },
    {
      id: 'place',
      label: t('admin.filterPlaces'),
      count: pending.filter((i) => i.type === 'place').length,
    },
    {
      id: 'post',
      label: t('admin.filterPosts'),
      count: pending.filter((i) => i.type === 'post').length,
    },
    {
      id: 'rule',
      label: t('admin.filterContent'),
      count: pending.filter((i) => i.type === 'rule').length,
    },
    {
      id: 'complaint',
      label: t('admin.filterComplaints'),
      count: pending.filter((i) => i.type === 'complaint').length,
    },
  ];

  return (
    <AppScreen edges={['bottom', 'top']}>
      <AppChromeHeader />
      <ScrHeader title={t('admin.moderation')} titleSize={20} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <Text style={styles.count}>
            {t('admin.queueCount', { count: pending.length })}
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            {filters.map((f) => {
              const active = filter === f.id;
              return (
                <Pressable
                  key={f.id}
                  onPress={() => setFilter(f.id)}
                  style={[styles.chip, active && styles.chipOn]}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextOn]}
                  >
                    {f.label} ({f.count})
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {filtered.map((item) => (
            <Pressable
              key={item.id}
              onPress={() =>
                router.push({
                  pathname: '/(admin)/moderation-item',
                  params: { id: item.id },
                } as never)
              }
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            >
              <Text style={styles.type}>{typeLabel(item.type)}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.summary}>{item.summary}</Text>
              <View style={styles.footer}>
                <Text style={styles.meta}>
                  {item.source ?? '—'} · {relativeTime(item.createdAt)}
                </Text>
                <Text style={styles.cta}>{t('admin.review')}</Text>
              </View>
            </Pressable>
          ))}

          {filtered.length === 0 ? (
            <Text style={styles.empty}>{t('admin.queueEmpty')}</Text>
          ) : null}
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
  count: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
  },
  chips: { flexDirection: 'row', gap: 6, paddingBottom: 2 },
  chip: {
    borderRadius: brand.radius.pill,
    backgroundColor: brand.creamDeep,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipOn: { backgroundColor: brand.successTint },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: brand.ink,
  },
  chipTextOn: {
    fontFamily: fonts.bodyBold,
    color: brand.successDark,
  },
  card: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    padding: 14,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  pressed: { opacity: 0.88 },
  type: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: brand.mutedSoft,
  },
  title: {
    marginTop: 4,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  },
  summary: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: brand.muted,
  },
  footer: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  meta: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: brand.mutedSoft,
  },
  cta: {
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    color: brand.accentDark,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
  },
});
