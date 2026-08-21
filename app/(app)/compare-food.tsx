import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { ListRow } from '@/src/components/ListRow';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import { listScans } from '@/src/services/scans';
import { brand } from '@/src/theme/brand';
import type { ScanRow } from '@/src/types/scan';

type Slot = 'a' | 'b';

function scoreColor(score: number) {
  if (score >= 70) return brand.score.good;
  if (score >= 40) return brand.score.fair;
  return brand.score.poor;
}

export default function CompareFoodScreen() {
  const [scans, setScans] = useState<ScanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickSlot, setPickSlot] = useState<Slot | null>(null);
  const [scanA, setScanA] = useState<ScanRow | null>(null);
  const [scanB, setScanB] = useState<ScanRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setScans(await listScans());
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const available = useMemo(() => {
    if (!pickSlot) return scans;
    const otherId = pickSlot === 'a' ? scanB?.id : scanA?.id;
    return scans.filter((s) => s.id !== otherId);
  }, [pickSlot, scans, scanA, scanB]);

  const onPick = (scan: ScanRow) => {
    if (pickSlot === 'a') setScanA(scan);
    if (pickSlot === 'b') setScanB(scan);
    setPickSlot(null);
  };

  const renderColumn = (slot: Slot, scan: ScanRow | null) => (
    <View style={styles.col}>
      <Text style={styles.colLabel}>
        {slot === 'a' ? t('compare.pickA') : t('compare.pickB')}
      </Text>
      {scan ? (
        <View style={styles.colCard}>
          <Text style={styles.productName} numberOfLines={3}>
            {scan.product_name}
          </Text>
          <Text style={[styles.score, { color: scoreColor(scan.score) }]}>
            {t('compare.score', { score: scan.score })}
          </Text>
          {scan.summary ? (
            <Text style={styles.summary} numberOfLines={4}>
              {scan.summary}
            </Text>
          ) : null}
        </View>
      ) : (
        <Pressable
          onPress={() => setPickSlot(slot)}
          style={({ pressed }) => [styles.pickBox, pressed && styles.pressed]}
        >
          <Text style={styles.pickText}>
            {slot === 'a' ? t('compare.pickA') : t('compare.pickB')}
          </Text>
        </Pressable>
      )}
      {scan ? (
        <PrimaryButton
          label={t('compare.change')}
          variant="ghost"
          size="sm"
          onPress={() => setPickSlot(slot)}
          style={styles.repick}
        />
      ) : null}
    </View>
  );

  return (
    <AppScreen edges={['bottom']}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <Text style={styles.lead}>{t('compare.subtitle')}</Text>

          {loading ? (
            <Text style={styles.muted}>{t('common.loading')}</Text>
          ) : scans.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>{t('compare.empty')}</Text>
              <PrimaryButton
                label={t('compare.goScan')}
                onPress={() => router.push('/(app)/scan-food')}
                style={styles.emptyBtn}
              />
            </View>
          ) : (
            <>
              <View style={styles.compareRow}>
                {renderColumn('a', scanA)}
                <Text style={styles.vs}>{t('compare.vs')}</Text>
                {renderColumn('b', scanB)}
              </View>

              {scanA && scanB ? (
                <View style={styles.resultBanner}>
                  <Text style={styles.resultText}>
                    {scanA.score === scanB.score
                      ? `${scanA.product_name} = ${scanB.product_name}`
                      : scanA.score > scanB.score
                        ? `${scanA.product_name} · ${scanA.score}`
                        : `${scanB.product_name} · ${scanB.score}`}
                  </Text>
                </View>
              ) : scans.length < 2 ? (
                <Text style={styles.muted}>{t('compare.needTwo')}</Text>
              ) : null}

              {(scanA || scanB) && (
                <PrimaryButton
                  label={t('compare.clear')}
                  variant="ghost"
                  onPress={() => {
                    setScanA(null);
                    setScanB(null);
                    setPickSlot(null);
                  }}
                  style={styles.clearBtn}
                />
              )}

              {pickSlot ? (
                <View style={styles.picker}>
                  <Text style={styles.section}>
                    {pickSlot === 'a' ? t('compare.pickA') : t('compare.pickB')}
                  </Text>
                  {available.map((scan) => (
                    <ListRow
                      key={scan.id}
                      title={scan.product_name}
                      meta={t('compare.score', { score: scan.score })}
                      onPress={() => onPick(scan)}
                    />
                  ))}
                  <PrimaryButton
                    label={t('common.cancel')}
                    variant="ghost"
                    onPress={() => setPickSlot(null)}
                  />
                </View>
              ) : null}
            </>
          )}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  lead: {
    marginBottom: 16,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#5A6B7D',
  },
  muted: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#8A9AAB',
  },
  empty: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.mist,
    padding: 18,
  },
  emptyTitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: '#5A6B7D',
  },
  emptyBtn: { marginTop: 14 },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  col: { flex: 1, minWidth: 0 },
  colLabel: {
    marginBottom: 8,
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    color: '#5A6B7D',
  },
  colCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    padding: 12,
    minHeight: 140,
  },
  productName: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
    color: brand.ink,
  },
  score: {
    marginTop: 10,
    fontFamily: 'Fraunces_700Bold',
    fontSize: 22,
  },
  summary: {
    marginTop: 8,
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 17,
    color: '#5A6B7D',
  },
  pickBox: {
    minHeight: 140,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  pickText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: brand.navy,
    textAlign: 'center',
  },
  pressed: { opacity: 0.85 },
  vs: {
    marginTop: 72,
    fontFamily: 'DMSans_700Bold',
    fontSize: 11,
    color: '#8A9AAB',
  },
  repick: { marginTop: 8 },
  resultBanner: {
    marginTop: 16,
    borderRadius: 14,
    backgroundColor: brand.mist,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  resultText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: brand.ink,
  },
  clearBtn: { marginTop: 12 },
  picker: { marginTop: 20 },
  section: {
    marginBottom: 8,
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: '#5A6B7D',
  },
});
