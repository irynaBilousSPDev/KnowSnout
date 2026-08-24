import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AuthShell } from '@/src/components/AuthShell';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import { requestPasswordReset, verifyResetCode } from '@/src/services/auth';
import { brand, fonts } from '@/src/theme/brand';

const CODE_LEN = 6;
const RESEND_SEC = 42;

/** Screenshot 01.07 · Код із пошти. */
export default function VerifyCodeScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const email =
    typeof params.email === 'string' && params.email.trim()
      ? params.email.trim()
      : '';

  const [digits, setDigits] = useState<string[]>(Array(CODE_LEN).fill(''));
  const [focusIdx, setFocusIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(RESEND_SEC);
  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  const code = digits.join('');

  const setDigit = (index: number, raw: string) => {
    const cleaned = raw.replace(/\D/g, '');
    if (cleaned.length > 1) {
      const next = [...digits];
      const chars = cleaned.slice(0, CODE_LEN - index).split('');
      chars.forEach((ch, i) => {
        next[index + i] = ch;
      });
      setDigits(next);
      const nextFocus = Math.min(index + chars.length, CODE_LEN - 1);
      setFocusIdx(nextFocus);
      inputs.current[nextFocus]?.focus();
      return;
    }
    const next = [...digits];
    next[index] = cleaned.slice(-1);
    setDigits(next);
    if (cleaned && index < CODE_LEN - 1) {
      setFocusIdx(index + 1);
      inputs.current[index + 1]?.focus();
    }
  };

  const onConfirm = async () => {
    setError(null);
    if (code.length < CODE_LEN) {
      setError(t('auth.codeIncomplete'));
      return;
    }
    setLoading(true);
    try {
      await verifyResetCode(email, code);
      notify(t('common.ok'), t('auth.codeOk'));
      router.replace('/(auth)/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.codeError'));
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    if (seconds > 0 || !email) return;
    try {
      await requestPasswordReset(email);
      setSeconds(RESEND_SEC);
      notify(t('common.ok'), t('auth.codeResent'));
    } catch (err) {
      notify(
        t('common.error'),
        err instanceof Error ? err.message : t('auth.resetError'),
      );
    }
  };

  return (
    <AuthShell
      headline={t('auth.codeTitle')}
      headlineSize={18}
      subtitle={
        email ? t('auth.codeBody', { email }) : t('auth.codeBodyGeneric')
      }
      onBack={() => router.back()}
    >
      <View style={styles.row}>
        {digits.map((d, i) => {
          const active = focusIdx === i;
          return (
            <TextInput
              key={i}
              ref={(el) => {
                inputs.current[i] = el;
              }}
              value={d}
              onChangeText={(v) => setDigit(i, v)}
              onFocus={() => setFocusIdx(i)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace' && !digits[i] && i > 0) {
                  setFocusIdx(i - 1);
                  inputs.current[i - 1]?.focus();
                }
              }}
              keyboardType="number-pad"
              maxLength={CODE_LEN}
              selectTextOnFocus
              style={[styles.cell, active && styles.cellActive]}
            />
          );
        })}
      </View>

      <Pressable
        onPress={() => void onConfirm()}
        disabled={loading}
        style={styles.textCta}
        accessibilityRole="button"
      >
        <Text style={styles.textCtaLabel}>
          {loading ? t('common.loading') : t('auth.confirmCode')}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => void onResend()}
        disabled={seconds > 0}
        style={styles.resendWrap}
      >
        <Text style={styles.resendMuted}>
          {t('auth.noCode')}{' '}
          <Text
            style={[
              styles.resendAction,
              seconds > 0 && styles.resendDisabled,
            ]}
          >
            {seconds > 0
              ? t('auth.resendWait', {
                  time: `0:${String(seconds).padStart(2, '0')}`,
                })
              : t('auth.resendNow')}
          </Text>
        </Text>
      </Pressable>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.title,
    fontSize: 20,
    color: brand.ink,
    backgroundColor: brand.surfaceElevated,
    borderRadius: brand.radius.md,
    paddingVertical: 14,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  cellActive: {
    borderWidth: 2,
    borderColor: brand.accentSoft,
  },
  textCta: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  textCtaLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: brand.accentDark,
  },
  resendWrap: { alignItems: 'center' },
  resendMuted: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12.5,
    color: brand.muted,
    textAlign: 'center',
  },
  resendAction: {
    fontFamily: fonts.bodyBold,
    color: brand.mutedSoft,
  },
  resendDisabled: {
    color: brand.mutedSoft,
  },
  errorBox: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: brand.radius.md,
    backgroundColor: 'rgba(217, 83, 79, 0.1)',
  },
  errorText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: brand.error,
  },
});
