import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { brand, fonts } from '@/src/theme/brand';

type SystemCenterProps = {
  icon: ReactNode;
  title: string;
  body: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  primaryBlock?: boolean;
};

/** Centered system state — network error, 404, permissions (08.02–08.05). */
export function SystemCenterScreen({
  icon,
  title,
  body,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  primaryBlock = false,
}: SystemCenterProps) {
  return (
    <View style={styles.centerRoot}>
      <View style={styles.iconWrap}>{icon}</View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      <PrimaryButton
        label={primaryLabel}
        onPress={onPrimary}
        style={primaryBlock ? styles.primaryBlock : styles.primary}
      />
      {secondaryLabel && onSecondary ? (
        <Pressable onPress={onSecondary} hitSlop={8}>
          <Text style={styles.secondary}>{secondaryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

type PhotoEmptyProps = {
  hint: string;
  actionLabel: string;
  onAction: () => void;
};

/** 08.06 · unified photo empty placeholder */
export function PhotoEmptyState({ hint, actionLabel, onAction }: PhotoEmptyProps) {
  return (
    <View style={styles.photoEmpty}>
      <View style={styles.photoSlot}>
        <Ionicons name="image-outline" size={32} color={brand.mutedSoft} />
      </View>
      <Text style={styles.photoHint}>{hint}</Text>
      <PrimaryButton
        label={actionLabel}
        variant="secondary"
        onPress={onAction}
        style={styles.photoBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centerRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: 48,
    gap: 10,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: brand.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: 20,
    color: brand.ink,
    textAlign: 'center',
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: brand.muted,
    textAlign: 'center',
    marginBottom: 8,
  },
  primary: { marginTop: 8, minWidth: 160 },
  primaryBlock: { marginTop: 8, alignSelf: 'stretch' },
  secondary: {
    marginTop: 14,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: brand.muted,
  },
  photoEmpty: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 14,
  },
  photoSlot: {
    width: 120,
    height: 120,
    borderRadius: brand.radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: brand.mistBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.surfaceElevated,
  },
  photoHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.mutedSoft,
    textAlign: 'center',
  },
  photoBtn: { minWidth: 180 },
});
