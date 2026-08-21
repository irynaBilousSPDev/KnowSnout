import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ScrHeader } from '@/src/components/ScrHeader';
import { brand, fonts } from '@/src/theme/brand';

type Props = {
  title?: string;
  subtitle?: string;
  /** @deprecated logo row replaced by AppChromeHeader */
  logo?: 'full' | 'icon' | 'none';
  /** @deprecated use AppChromeHeader avatar */
  showProfile?: boolean;
  right?: ReactNode;
  showBack?: boolean;
  titleSize?: number;
};

/**
 * Compatibility wrapper → HTML `.scr-hd` (ScrHeader).
 * Prefer importing ScrHeader directly on new screens.
 */
export function ScreenHeader({
  title,
  subtitle,
  right,
  showBack = true,
  titleSize = 20,
}: Props) {
  if (!title) {
    if (!subtitle) return null;
    return (
      <View style={styles.subOnly}>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    );
  }

  return (
    <View>
      <ScrHeader
        title={title}
        titleSize={titleSize}
        showBack={showBack}
        right={right}
      />
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  subOnly: {
    paddingHorizontal: 20,
    paddingBottom: 6,
  },
  subtitle: {
    paddingHorizontal: 20,
    marginTop: 2,
    marginBottom: 8,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: brand.muted,
    textAlign: 'center',
  },
});
