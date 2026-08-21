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
import { brand } from '@/src/theme/brand';

type Props = {
  headline: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
  badge?: string | null;
};

/** Minimal auth layout: logo, copy, form, sticky footer CTA. */
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
            <Text style={styles.subtitle}>{subtitle}</Text>
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
  root: {
    flex: 1,
    backgroundColor: brand.surface,
  },
  safe: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 16,
  },
  logo: { alignSelf: 'flex-start' },
  headline: {
    marginTop: 20,
    fontFamily: 'DMSans_700Bold',
    fontSize: 26,
    lineHeight: 32,
    color: brand.ink,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 8,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: brand.muted,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: brand.forestTint,
  },
  badgeText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: brand.forest,
  },
  form: { marginTop: 24 },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 8 : 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: brand.mistBorder,
    backgroundColor: brand.surface,
  },
});
