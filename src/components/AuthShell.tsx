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
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
  badge?: string | null;
};

/** Organic auth shell — cream, Caprasimo headline, sage footer CTA slot. */
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
    backgroundColor: brand.cream,
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
    marginTop: 22,
    fontFamily: fonts.display,
    fontSize: 30,
    lineHeight: 36,
    color: brand.ink,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 10,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: brand.muted,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: brand.radius.pill,
    backgroundColor: brand.sageTint,
  },
  badgeText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: brand.sageDeep,
  },
  form: { marginTop: 24 },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 8 : 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: brand.mistBorder,
    backgroundColor: brand.cream,
  },
});
