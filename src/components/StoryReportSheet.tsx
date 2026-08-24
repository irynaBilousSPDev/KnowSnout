import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import {
  blockUser,
  reportStoryTarget,
} from '@/src/services/storyModeration';
import { brand, fonts } from '@/src/theme/brand';

type Props = {
  visible: boolean;
  onClose: () => void;
  targetUserId: string;
  postId?: string | null;
  onBlocked?: () => void;
};

/** Screenshot 04.06 — Поскаржитися / Заблокувати / Скасувати */
export function StoryReportSheet({
  visible,
  onClose,
  targetUserId,
  postId,
  onBlocked,
}: Props) {
  const onReport = async () => {
    try {
      await reportStoryTarget({
        targetUserId,
        postId,
        reason: 'other',
      });
      notify(t('common.ok'), t('stories.reportDone'));
      onClose();
    } catch (err) {
      notify(
        t('common.error'),
        err instanceof Error ? err.message : t('common.error'),
      );
    }
  };

  const onBlock = async () => {
    try {
      await blockUser(targetUserId);
      notify(t('common.ok'), t('stories.blockUser'));
      onClose();
      onBlocked?.();
    } catch (err) {
      notify(
        t('common.error'),
        err instanceof Error ? err.message : t('common.error'),
      );
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
          <Pressable onPress={() => void onReport} style={styles.row}>
            <Text style={styles.rowT}>{t('stories.reportPost')}</Text>
          </Pressable>
          <View style={styles.divider} />
          <Pressable onPress={() => void onBlock} style={styles.row}>
            <Text style={[styles.rowT, styles.danger]}>
              {t('stories.blockUser')}
            </Text>
          </Pressable>
          <View style={styles.divider} />
          <Pressable onPress={onClose} style={styles.row}>
            <Text style={styles.rowT}>{t('common.cancel')}</Text>
          </Pressable>
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
    paddingBottom: 28,
    paddingTop: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: brand.creamDeep,
    marginBottom: 8,
  },
  row: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  rowT: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: brand.ink,
  },
  danger: {
    color: brand.error,
    fontFamily: fonts.bodySemi,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: brand.divider,
    marginHorizontal: 20,
  },
});
