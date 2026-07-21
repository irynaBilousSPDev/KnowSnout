import { Alert, Platform, Share } from 'react-native';

import { t } from '@/src/i18n';

type SharePayload = {
  title?: string;
  message: string;
};

/** Opens the system share sheet (Telegram, Instagram Stories via apps, Messages, etc.). */
export async function shareText(payload: SharePayload): Promise<boolean> {
  try {
    const result = await Share.share(
      Platform.OS === 'ios'
        ? { message: payload.message, title: payload.title }
        : { message: payload.message, title: payload.title },
      { dialogTitle: payload.title ?? t('share.dialogTitle') },
    );
    return result.action !== Share.dismissedAction;
  } catch (err) {
    Alert.alert(
      t('common.error'),
      err instanceof Error ? err.message : t('share.failed'),
    );
    return false;
  }
}

export function buildScanShareMessage(input: {
  productName: string;
  score: number;
}): string {
  return t('share.scanMessage', {
    name: input.productName,
    score: input.score,
  });
}

export function buildStoryShareMessage(input: {
  petName: string;
  caption: string;
}): string {
  return t('share.storyMessage', {
    pet: input.petName,
    caption: input.caption,
  });
}

export function buildContestShareMessage(input: {
  petName: string;
  caption: string;
}): string {
  return t('share.contestMessage', {
    pet: input.petName,
    caption: input.caption,
  });
}
