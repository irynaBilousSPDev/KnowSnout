import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { ListRow } from '@/src/components/ListRow';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import { isNativeSafeImageUri } from '@/src/lib/image';
import { resolveCheckImageUrl } from '@/src/services/checkImages';
import { listScans } from '@/src/services/scans';
import { brand } from '@/src/theme/brand';
import type { ScanRow } from '@/src/types/scan';

type Slot = 'a' | 'b';

function scoreOutOfFive(score: number) {
  return (Math.max(0, Math.min(100, score)) / 20).toFixed(1);
}

function hasMeatFirst(scan: ScanRow) {
  const blob = `${scan.summary} ${scan.pros.join(' ')}`.toLowerCase();
  return (
    blob.includes('м’яс') ||
    blob.includes("м'яс") ||
    blob.includes('meat') ||
    scan.score >= 70
  );
}

function noFlavor(scan: ScanRow) {
  const blob = `${scan.summary} ${scan.cons.join(' ')}`.toLowerCase();
  if (blob.includes('ароматиз') || blob.includes('flavor')) return false;
  return scan.score >= 60;
}

function priceStub(scan: ScanRow) {
  const base = 160 + (scan.score % 40);
  return `₴${base}`;
}

function PickBox({
  scan,
  onPress,
}: {
  scan: ScanRow | null;
  onPress: () => void;
}) {
  const uri =
    scan?.image_path && isNativeSafeImageUri(scan.image_path)
      ? scan.image_path
      : null;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.pickBox, pressed && styles.pressed]}
    >
      {uri ? (
        <Image source={{ uri }} style={styles.pickImage} resizeMode="cover" />
      ) : (
        <View style={styles.pickEmpty}>
          <Ionicons name="image-outline" size={28} color={brand.mutedSoft} />
          <Text style={styles.browse}>{t('compare.browseFiles')}</Text>
        </View>
      )}
    </Pressable>
  );
}

function Mark({ ok }: { ok: boolean | null }) {
  if (ok == null) {
    return <Text style={styles.na}>{t('compare.na')}</Text>;
  }
  return (
    <Ionicons
      name={ok ? 'checkmark-circle' : 'close-circle'}
      size={22}
      color={ok ? brand.forest : brand.score.poor}
    />
  );
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
      const list = await listScans();
      const resolved = await Promise.all(
        list.map(async (s) => {
          if (!s.image_path) return s;
          const url = await resolveCheckImageUrl(s.image_path);
          return { ...s, image_path: url ?? s.image_path };
        }),
      );
      setScans(resolved);
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

  return (
    <AppScreen edges={['bottom']}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <Text style={styles.title}>{t('compare.title')}</Text>

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
                <View style={styles.col}>
                  <PickBox scan={scanA} onPress={() => setPickSlot('a')} />
                  <Text style={styles.productName} numberOfLines={2}>
                    {scanA?.product_name ?? t('compare.pickA')}
                  </Text>
                  {scanA ? (
                    <Text style={styles.score}>
                      {scoreOutOfFive(scanA.score)}
                    </Text>
                  ) : null}
                </View>

                <Text style={styles.vs}>{t('compare.vs')}</Text>

                <View style={styles.col}>
                  <PickBox scan={scanB} onPress={() => setPickSlot('b')} />
                  <Text style={styles.productName} numberOfLines={2}>
                    {scanB?.product_name ?? t('compare.pickB')}
                  </Text>
                  {scanB ? (
                    <Text style={styles.score}>
                      {scoreOutOfFive(scanB.score)}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.table}>
                <View style={styles.tableRow}>
                  <Mark ok={scanA ? hasMeatFirst(scanA) : null} />
                  <Text style={styles.tableLabel}>{t('compare.meatFirst')}</Text>
                  <Mark ok={scanB ? hasMeatFirst(scanB) : null} />
                </View>
                <View style={styles.tableRow}>
                  <Mark ok={scanA ? noFlavor(scanA) : null} />
                  <Text style={styles.tableLabel}>{t('compare.noFlavor')}</Text>
                  <Mark ok={scanB ? noFlavor(scanB) : null} />
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.price}>
                    {scanA ? priceStub(scanA) : t('compare.na')}
                  </Text>
                  <Text style={styles.tableLabel}>{t('compare.priceKg')}</Text>
                  <Text style={styles.price}>
                    {scanB ? priceStub(scanB) : t('compare.na')}
                  </Text>
                </View>
              </View>

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
                      meta={scoreOutOfFive(scan.score)}
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
  title: {
    marginBottom: 18,
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: brand.ink,
    letterSpacing: -0.4,
  },
  muted: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: brand.mutedSoft,
  },
  empty: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.mist,
    padding: 18,
  },
  emptyTitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: brand.muted,
  },
  emptyBtn: { marginTop: 14 },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  col: { flex: 1, minWidth: 0, alignItems: 'center' },
  pickBox: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    overflow: 'hidden',
  },
  pickImage: { width: '100%', height: '100%' },
  pickEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  browse: {
    marginTop: 6,
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: brand.mutedSoft,
  },
  productName: {
    marginTop: 10,
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: brand.ink,
    textAlign: 'center',
  },
  score: {
    marginTop: 4,
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: brand.forest,
  },
  vs: {
    marginTop: 56,
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: brand.mutedSoft,
  },
  pressed: { opacity: 0.88 },
  table: {
    marginTop: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.mistBorder,
  },
  tableLabel: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: brand.muted,
    paddingHorizontal: 8,
  },
  price: {
    minWidth: 52,
    textAlign: 'center',
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: brand.ink,
  },
  na: {
    minWidth: 22,
    textAlign: 'center',
    fontFamily: 'Inter_700Bold',
    color: brand.mutedSoft,
  },
  clearBtn: { marginTop: 14 },
  picker: { marginTop: 20 },
  section: {
    marginBottom: 8,
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: brand.mutedSoft,
  },
});
