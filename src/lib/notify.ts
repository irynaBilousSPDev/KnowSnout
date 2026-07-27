import { Alert, Platform } from 'react-native';

/**
 * Cross-platform notice. Alert.alert is unreliable / silent on web.
 */
export function notify(title: string, message?: string) {
  const text = message?.trim() ? `${title}\n\n${message}` : title;
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert(text);
      return;
    }
  }
  Alert.alert(title, message);
}
