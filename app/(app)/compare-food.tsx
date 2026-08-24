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

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ListRow } from '@/src/components/ListRow';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import { isNativeSafeImageUri } from '@/src/lib/image';
import { resolveCheckImageUrl } from '@/src/services/checkImages';
import { listScans } from '@/src/services/scans';
import { brand, fonts } from '@/src/theme/brand';
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
          <Ionicons name="image-outline" size={22} color={brand.mutedSoft} />
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
      name={ok ? 'checkmark' : 'close'}
      size={16}
      color={ok ? brand.successDark : brand.mutedSoft}
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
      <AppChromeHeader />
      <ScrHeader title={t('compare.title')} titleSize={18} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
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
                    <View style={styles.pawBadge}>
                      <Text style={styles.pawBadgeText}>
                        {scoreOutOfFive(scanA.score)}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <Text style={styles.vs}>{t('compare.vs')}</Text>

                <View style={styles.col}>
                  <PickBox scan={scanB} onPress={() => setPickSlot('b')} />
                  <Text style={styles.productName} numberOfLines={2}>
                    {scanB?.product_name ?? t('compare.pickB')}
                  </Text>
                  {scanB ? (
                    <View style={styles.pawBadge}>
                      <Text style={styles.pawBadgeText}>
                        {scoreOutOfFive(scanB.score)}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>

              <View style={styles.table}>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>{t('compare.meatFirst')}</Text>
                  <View style={styles.marks}>
                    <Mark ok={scanA ? hasMeatFirst(scanA) : null} />
                    <Mark ok={scanB ? hasMeatFirst(scanB) : null} />
                  </View>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>{t('compare.noFlavor')}</Text>
                  <View style={styles.marks}>
                    <Mark ok={scanA ? noFlavor(scanA) : null} />
                    <Mark ok={scanB ? noFlavor(scanB) : null} />
                  </View>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>{t('compare.priceKg')}</Text>
                  <Text style={styles.price}>
                    {scanA || scanB
                      ? `${scanA ? priceStub(scanA) : t('compare.na')} · ${
                          scanB ? priceStub(scanB) : t('compare.na')
                        }`
                      : t('compare.na')}
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
  pad: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 12,
  },
  muted: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.mutedSoft,
  },
  empty: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    padding: 18,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  emptyTitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: brand.muted,
  },
  emptyBtn: { marginTop: 14 },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  col: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    gap: 6,
  },
  pickBox: {
    width: '100%',
    height: 80,
    borderRadius: 14,
    backgroundColor: brand.creamDeep,
    overflow: 'hidden',
  },
  pickImage: { width: '100%', height: '100%' },
  pickEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: brand.mistBorder,
    borderRadius: 14,
  },
  browse: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 11,
    color: brand.mutedSoft,
  },
  productName: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: brand.ink,
    textAlign: 'center',
  },
  pawBadge: {
    borderRadius: brand.radius.pill,
    backgroundColor: brand.accentTint,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  pawBadgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.accentDark,
  },
  vs: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: '#B0A99D',
  },
  pressed: { opacity: 0.88 },
  table: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 10,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tableLabel: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: brand.muted,
    flex: 1,
    paddingRight: 12,
  },
  marks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    minWidth: 52,
    justifyContent: 'flex-end',
  },
  price: {
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    color: brand.ink,
  },
  na: {
    minWidth: 16,
    textAlign: 'center',
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: brand.mutedSoft,
  },
  clearBtn: { marginTop: 2 },
  picker: { marginTop: 8 },
  section: {
    marginBottom: 8,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.muted,
  },
});
