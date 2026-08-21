import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandLogo } from '@/src/components/BrandLogo';
import { brand, fonts } from '@/src/theme/brand';

type Props = {
  headline: string;
  subtitle?: string | null;
  children: ReactNode;
  footer: ReactNode;
  badge?: string | null;
};

/** HTML kit auth — stone canvas, Manrope headline. */
export function AuthShell({
  headline,
  subtitle,
  children,
  footer,
  badge,
}: Props) {
  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        >
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            <BrandLogo variant="full" size="hero" style={styles.logo} />
            <Text style={styles.headline}>{headline}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            {badge ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            ) : null}
            <View style={styles.form}>{children}</View>
          </ScrollView>
          <View style={styles.footer}>{footer}</View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.canvas },
  safe: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  logo: { alignSelf: 'flex-start' },
  headline: {
    marginTop: 20,
    fontFamily: fonts.title,
    fontSize: 22,
    lineHeight: 28,
    color: brand.ink,
  },
  subtitle: {
    marginTop: 8,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: brand.muted,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: brand.radius.pill,
    backgroundColor: brand.accentTint,
  },
  badgeText: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: brand.accentDark,
  },
  form: { marginTop: 20 },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 8 : 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: brand.mistBorder,
    backgroundColor: brand.canvas,
  },
});
