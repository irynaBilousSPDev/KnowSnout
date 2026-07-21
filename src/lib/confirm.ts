import { Alert, Platform } from 'react-native';

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
};

/**
 * Cross-platform confirm. Alert.alert button callbacks are unreliable on web.
 */
export async function confirmAction(options: ConfirmOptions): Promise<boolean> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
      return window.confirm(`${options.title}\n\n${options.message}`);
    }
    return false;
  }

  return new Promise((resolve) => {
    Alert.alert(options.title, options.message, [
      {
        text: options.cancelLabel,
        style: 'cancel',
        onPress: () => resolve(false),
      },
      {
        text: options.confirmLabel,
        style: options.destructive ? 'destructive' : 'default',
        onPress: () => resolve(true),
      },
    ]);
  });
}
