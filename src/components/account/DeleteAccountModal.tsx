import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import { brand, fonts } from '@/src/theme/brand';

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm?: () => void;
};

/** 07.12 — modal «Видалити акаунт назавжди?» */
export function DeleteAccountModal({ visible, onClose, onConfirm }: Props) {
  const confirm = () => {
    onConfirm?.();
    notify(t('deleteAccount.doneTitle'), t('deleteAccount.doneBody'));
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.iconWrap}>
            <Ionicons name="warning-outline" size={28} color={brand.terracotta} />
          </View>
          <Text style={styles.title}>{t('deleteAccount.modalTitle')}</Text>
          <Text style={styles.body}>{t('deleteAccount.modalBody')}</Text>
          <View style={styles.actions}>
            <PrimaryButton
              label={t('common.cancel')}
              variant="secondary"
              onPress={onClose}
              style={styles.btn}
            />
            <PrimaryButton
              label={t('deleteAccount.confirmAction')}
              variant="danger"
              onPress={confirm}
              style={styles.btn}
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
    backgroundColor: 'rgba(21,34,51,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    width: '100%',
    maxWidth: 340,
    borderRadius: brand.radius.lg,
    backgroundColor: brand.surfaceElevated,
    padding: 22,
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FCEEE8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: 18,
    color: brand.ink,
    textAlign: 'center',
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 18,
    color: brand.muted,
    textAlign: 'center',
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  btn: { flex: 1 },
});
