import type { ReactNode } from 'react';
import { router } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { brand, fonts } from '@/src/theme/brand';

type Props = {
  headline: string;
  headlineSize?: number;
  subtitle?: string | null;
  children: ReactNode;
  footer?: ReactNode;
  badge?: string | null;
  showBack?: boolean;
  onBack?: () => void;
  /** Design kit on auth phones shows bell+badge */
  showBell?: boolean;
  bellCount?: number;
};

/**
 * Auth layout from screenshots 01.04 / 01.06 / 01.07:
 * app-hd (logo + bell) → scr-hd (back + title) → form.
 */
export function AuthShell({
  headline,
  headlineSize = 22,
  subtitle,
  children,
  footer,
  badge,
  showBack = true,
  onBack,
  showBell = true,
  bellCount = 3,
}: Props) {
  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <AppChromeHeader
          trailing={showBell ? 'bell' : 'none'}
          bellCount={bellCount}
          onBrandPress={() => undefined}
          onBellPress={() => undefined}
        />
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        >
          <View style={styles.scrHd}>
            {showBack ? (
              <Pressable
                onPress={onBack ?? (() => router.back())}
                style={styles.back}
                accessibilityRole="button"
                accessibilityLabel="Назад"
              >
                <Ionicons name="chevron-back" size={18} color={brand.ink} />
              </Pressable>
            ) : (
              <View style={styles.backSpacer} />
            )}
            <Text
              style={[styles.scrTitle, { fontSize: headlineSize }]}
              numberOfLines={1}
            >
              {headline}
            </Text>
            <View style={styles.backSpacer} />
          </View>

          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            {badge ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            ) : null}
            <View style={styles.form}>{children}</View>
            {footer ? <View style={styles.inlineFooter}>{footer}</View> : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.canvas },
  safe: { flex: 1 },
  flex: { flex: 1 },
  scrHd: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 6,
  },
  back: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backSpacer: { width: 34, height: 34 },
  scrTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.title,
    lineHeight: 28,
    color: brand.ink,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 12,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 21,
    color: brand.label,
  },
  badge: {
    alignSelf: 'flex-start',
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
  form: { gap: 12 },
  inlineFooter: { marginTop: 4, gap: 12 },
});
