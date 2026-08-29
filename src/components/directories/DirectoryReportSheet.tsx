import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import { queueFraudReport } from '@/src/services/directoryReviews';
import { brand, fonts } from '@/src/theme/brand';

const REASONS = [
  'directories.reportReasonFalse',
  'directories.reportReasonFraud',
  'directories.reportReasonAnimal',
] as const;

type Props = {
  visible: boolean;
  onClose: () => void;
  placeId: string;
  /** e.g. «Перевізник · «Домовились…»» */
  contextLine?: string;
};

/** 06.08 — bottom sheet «Повідомити про проблему». */
export function DirectoryReportSheet({
  visible,
  onClose,
  placeId,
  contextLine,
}: Props) {
  const [reasonKey, setReasonKey] = useState<string>(REASONS[0]);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await queueFraudReport({
        placeId,
        reason: t(reasonKey),
        details: contextLine ?? '',
      });
      notify(t('common.ok'), t('directories.reportSaved'));
      onClose();
    } catch {
      notify(t('common.error'), t('directories.reportError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>{t('directories.reportProblem')}</Text>
          {contextLine ? (
            <Text style={styles.context}>{contextLine}</Text>
          ) : null}

          {REASONS.map((key) => {
            const active = reasonKey === key;
            return (
              <Pressable
                key={key}
                onPress={() => setReasonKey(key)}
                style={[styles.option, active && styles.optionActive]}
              >
                <Text style={[styles.optionText, active && styles.optionTextActive]}>
                  {t(key)}
                </Text>
              </Pressable>
            );
          })}

          <View style={styles.btnWrap}>
            <PrimaryButton
              label={t('directories.submitReport')}
              loading={busy}
              onPress={() => void submit()}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(21,34,51,0.35)',
  },
  sheet: {
    backgroundColor: brand.surfaceElevated,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: brand.creamDeep,
    marginBottom: 14,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: 18,
    color: brand.ink,
    textAlign: 'center',
    marginBottom: 6,
  },
  context: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: brand.muted,
    textAlign: 'center',
    marginBottom: 14,
  },
  option: {
    borderRadius: brand.radius.md,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 8,
  },
  optionActive: {
    borderColor: brand.accentDark,
    backgroundColor: brand.accentTint,
  },
  optionText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.ink,
    textAlign: 'center',
  },
  optionTextActive: {
    fontFamily: fonts.bodyBold,
    color: brand.accentDark,
  },
  btnWrap: { marginTop: 6 },
});
