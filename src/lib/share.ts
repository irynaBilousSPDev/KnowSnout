import { Alert, Linking, Platform, Share } from 'react-native';

import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';

const WEB_ORIGIN = 'https://knowsnout.com';

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

export async function copyText(text: string): Promise<boolean> {
  try {
    if (
      Platform.OS === 'web' &&
      typeof navigator !== 'undefined' &&
      navigator.clipboard?.writeText
    ) {
      await navigator.clipboard.writeText(text);
      notify(t('share.copied'));
      return true;
    }
    return shareText({ title: t('share.copyLink'), message: text });
  } catch {
    return shareText({ title: t('share.copyLink'), message: text });
  }
}

export function buildStoryDeepLink(postId: string): string {
  return `${WEB_ORIGIN}/story/${encodeURIComponent(postId)}`;
}

export function buildContestDeepLink(entryId?: string | null): string {
  if (entryId) {
    return `${WEB_ORIGIN}/contest/${encodeURIComponent(entryId)}`;
  }
  return `${WEB_ORIGIN}/contests`;
}

/** Prefer Telegram share URL; falls back to system sheet. */
export async function shareToTelegram(message: string): Promise<boolean> {
  const url = `https://t.me/share/url?url=${encodeURIComponent(WEB_ORIGIN)}&text=${encodeURIComponent(message)}`;
  try {
    const can = await Linking.canOpenURL(url);
    if (can) {
      await Linking.openURL(url);
      return true;
    }
  } catch {
    /* fall through */
  }
  return shareText({ title: t('share.telegram'), message });
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
  petName?: string;
  author?: string;
  caption: string;
  postId?: string | null;
}): string {
  const pet = input.petName ?? input.author ?? '';
  const base = t('share.storyMessage', {
    pet,
    caption: input.caption,
  });
  if (!input.postId) return base;
  return `${base}\n${buildStoryDeepLink(input.postId)}`;
}

export function buildContestShareMessage(input: {
  petName: string;
  caption: string;
  entryId?: string | null;
}): string {
  const base = t('share.contestMessage', {
    pet: input.petName,
    caption: input.caption,
  });
  if (!input.entryId) return base;
  return `${base}\n${buildContestDeepLink(input.entryId)}`;
}
