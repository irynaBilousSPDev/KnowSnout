import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';
import ViewShot, { captureRef } from 'react-native-view-shot';
import Ionicons from '@expo/vector-icons/Ionicons';

import { WatermarkCapture } from '@/src/components/WatermarkCapture.native';
import { t } from '@/src/i18n';
import { copyText, shareText, shareToTelegram } from '@/src/lib/share';
import { saveImageToLibrary, shareImageFile } from '@/src/lib/shareMedia';
import { brand } from '@/src/theme/brand';

type Props = {
  visible: boolean;
  onClose: () => void;
  imageUri?: string | null;
  message: string;
  title?: string;
  /** Optional deep link for copy / Telegram */
  linkUrl?: string | null;
};

type Action = 'social' | 'link' | 'download' | 'copy' | 'telegram';

export function SharePhotoSheet({
  visible,
  onClose,
  imageUri,
  message,
  title,
  linkUrl,
}: Props) {
  const shotRef = useRef<ViewShot>(null);
  const [captureReady, setCaptureReady] = useState(false);
  const [busy, setBusy] = useState<Action | null>(null);

  useEffect(() => {
    if (!visible) {
      setCaptureReady(false);
      setBusy(null);
    }
  }, [visible]);

  const captureWatermarked = useCallback(async (): Promise<string | null> => {
    if (!imageUri || !shotRef.current) return null;
    await new Promise((r) => setTimeout(r, captureReady ? 100 : 350));
    try {
      return await captureRef(shotRef, {
        format: 'jpg',
        quality: 0.92,
        result: 'tmpfile',
        fileName: 'knowsnout-share',
      });
    } catch {
      return imageUri;
    }
  }, [captureReady, imageUri]);

  const run = async (action: Action) => {
    if (busy) return;
    setBusy(action);
    try {
      if (action === 'copy') {
        await copyText(linkUrl?.trim() || message);
        onClose();
        return;
      }
      if (action === 'telegram') {
        await shareToTelegram(message);
        onClose();
        return;
      }
      if (action === 'link' || !imageUri) {
        await shareText({ title: title ?? t('share.dialogTitle'), message });
        onClose();
        return;
      }

      const uri = (await captureWatermarked()) ?? imageUri;

      if (action === 'social') {
        const ok = await shareImageFile(uri, title ?? t('share.dialogTitle'));
        if (ok) onClose();
        return;
      }

      const saved = await saveImageToLibrary(uri);
      if (saved) onClose();
    } finally {
      setBusy(null);
    }
  };

  const hasPhoto = Boolean(imageUri);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      {hasPhoto && imageUri ? (
        <WatermarkCapture
          ref={shotRef}
          imageUri={imageUri}
          onReadyChange={setCaptureReady}
        />
      ) : null}

      <SheetBody
        hasPhoto={hasPhoto}
        busy={busy}
        onClose={onClose}
        onAction={(a) => void run(a)}
        socialHint={t('share.toSocialsHint')}
        downloadHint={t('share.downloadHint')}
      />
    </Modal>
  );
}

function SheetBody({
  hasPhoto,
  busy,
  onClose,
  onAction,
  socialHint,
  downloadHint,
}: {
  hasPhoto: boolean;
  busy: Action | null;
  onClose: () => void;
  onAction: (action: Action) => void;
  socialHint: string;
  downloadHint: string;
}) {
  return (
    <Pressable className="flex-1 justify-end bg-black/45" onPress={onClose}>
      <Pressable
        className="rounded-t-3xl bg-sand-50 px-5 pb-10 pt-4"
        onPress={(e) => e.stopPropagation()}
      >
        <View className="mb-4 items-center">
          <View className="h-1.5 w-10 rounded-full bg-forest-200" />
        </View>

        <Text className="font-display text-2xl text-forest-900">
          {t('share.sheetTitle')}
        </Text>
        <Text className="mt-1 font-body text-sm text-forest-600">
          {hasPhoto ? t('share.sheetHintPhoto') : t('share.sheetHintText')}
        </Text>

        <View className="mt-5 gap-2">
          {hasPhoto ? (
            <ActionRow
              icon="share-social-outline"
              label={t('share.toSocials')}
              hint={socialHint}
              busy={busy === 'social'}
              disabled={Boolean(busy)}
              onPress={() => onAction('social')}
            />
          ) : null}

          <ActionRow
            icon="paper-plane-outline"
            label={t('share.telegram')}
            hint={t('share.telegramHint')}
            busy={busy === 'telegram'}
            disabled={Boolean(busy)}
            onPress={() => onAction('telegram')}
          />

          <ActionRow
            icon="copy-outline"
            label={t('share.copyLink')}
            hint={t('share.copyLinkHint')}
            busy={busy === 'copy'}
            disabled={Boolean(busy)}
            onPress={() => onAction('copy')}
          />

          <ActionRow
            icon="link-outline"
            label={t('share.sendLink')}
            hint={t('share.sendLinkHint')}
            busy={busy === 'link'}
            disabled={Boolean(busy)}
            onPress={() => onAction('link')}
          />

          {hasPhoto ? (
            <ActionRow
              icon="download-outline"
              label={t('share.download')}
              hint={downloadHint}
              busy={busy === 'download'}
              disabled={Boolean(busy)}
              onPress={() => onAction('download')}
            />
          ) : null}
        </View>

        <Pressable
          onPress={onClose}
          disabled={Boolean(busy)}
          className="mt-4 items-center py-3 active:opacity-70"
        >
          <Text className="font-body-medium text-base text-forest-600">
            {t('share.cancel')}
          </Text>
        </Pressable>
      </Pressable>
    </Pressable>
  );
}

function ActionRow({
  icon,
  label,
  hint,
  busy,
  disabled,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  hint: string;
  busy: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="flex-row items-center rounded-2xl border border-forest-100 bg-white px-4 py-3.5 active:opacity-80"
      style={{ opacity: disabled && !busy ? 0.55 : 1 }}
    >
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-mist">
        {busy ? (
          <ActivityIndicator color={brand.navy} />
        ) : (
          <Ionicons name={icon} size={22} color={brand.navy} />
        )}
      </View>
      <View className="flex-1">
        <Text className="font-body-bold text-sm text-forest-900">{label}</Text>
        <Text className="mt-0.5 font-body text-xs text-forest-500">{hint}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={brand.mistBorder} />
    </Pressable>
  );
}

export { SheetBody, ActionRow };
export type { Action, Props as SharePhotoSheetProps };
