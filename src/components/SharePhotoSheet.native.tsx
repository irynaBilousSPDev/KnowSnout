import { useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { t } from '@/src/i18n';
import { copyText, shareText } from '@/src/lib/share';
import { brand, fonts } from '@/src/theme/brand';

type Props = {
  visible: boolean;
  onClose: () => void;
  imageUri?: string | null;
  message: string;
  title?: string;
  linkUrl?: string | null;
};

/** Screenshot 04.05 — Поділитися: Друзям · Instagram · Копіювати */
export function SharePhotoSheet({
  visible,
  onClose,
  message,
  title,
  linkUrl,
}: Props) {
  const [busy, setBusy] = useState<string | null>(null);

  const run = async (action: 'friends' | 'instagram' | 'copy') => {
    if (busy) return;
    setBusy(action);
    try {
      if (action === 'copy') {
        await copyText(linkUrl?.trim() || message);
        onClose();
        return;
      }
      if (action === 'instagram') {
        const url = 'instagram://app';
        const can = await Linking.canOpenURL(url).catch(() => false);
        if (can) await Linking.openURL(url);
        else await shareText({ title: title ?? t('share.sheetTitle'), message });
        onClose();
        return;
      }
      await shareText({ title: title ?? t('share.sheetTitle'), message });
      onClose();
    } finally {
      setBusy(null);
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
          <Text style={styles.title}>{t('share.sheetTitle')}</Text>
          <View style={styles.row}>
            <Action
              label={t('share.toFriends')}
              icon="share-social"
              tint={brand.accentTint}
              iconColor={brand.accent}
              busy={busy === 'friends'}
              onPress={() => void run('friends')}
            />
            <Action
              label={t('share.instagram')}
              icon="logo-instagram"
              tint={brand.creamDeep}
              iconColor={brand.ink}
              busy={busy === 'instagram'}
              onPress={() => void run('instagram')}
            />
            <Action
              label={t('share.copy')}
              icon="link-outline"
              tint={brand.creamDeep}
              iconColor={brand.ink}
              busy={busy === 'copy'}
              onPress={() => void run('copy')}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Action({
  label,
  icon,
  tint,
  iconColor,
  busy,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  iconColor: string;
  busy: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.action} disabled={busy}>
      <View style={[styles.circle, { backgroundColor: tint }]}>
        {busy ? (
          <ActivityIndicator color={iconColor} />
        ) : (
          <Ionicons name={icon} size={22} color={iconColor} />
        )}
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 36,
  },
  title: {
    textAlign: 'center',
    fontFamily: fonts.title,
    fontSize: 18,
    color: brand.ink,
    marginBottom: 22,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },
  action: { alignItems: 'center', width: 96, gap: 8 },
  circle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: brand.ink,
    textAlign: 'center',
  },
});
