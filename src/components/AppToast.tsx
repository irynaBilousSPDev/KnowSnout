import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { t } from '@/src/i18n';
import { brand } from '@/src/theme/brand';

type Props = {
  toastMessage: string | null;
  aiLoading: boolean;
  networkVisible: boolean;
  onDismissToast: () => void;
  onRetryNetwork: () => void;
  onDismissNetwork: () => void;
};

export function AppToast({
  toastMessage,
  aiLoading,
  networkVisible,
  onDismissToast,
  onRetryNetwork,
  onDismissNetwork,
}: Props) {
  return (
    <>
      {toastMessage ? (
        <Pressable
          style={styles.toastWrap}
          onPress={onDismissToast}
          accessibilityRole="alert"
        >
          <View style={styles.toast}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </Pressable>
      ) : null}

      {networkVisible ? (
        <View style={styles.networkWrap} accessibilityRole="alert">
          <View style={styles.networkBanner}>
            <Text style={styles.networkText}>{t('toast.networkError')}</Text>
            <View style={styles.networkActions}>
              <Pressable
                onPress={onRetryNetwork}
                style={styles.networkBtn}
                accessibilityRole="button"
                accessibilityLabel={t('common.tryAgain')}
              >
                <Text style={styles.networkBtnText}>{t('common.tryAgain')}</Text>
              </Pressable>
              <Pressable
                onPress={onDismissNetwork}
                style={styles.networkBtnGhost}
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
              >
                <Text style={styles.networkBtnGhostText}>{t('common.close')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}

      <Modal visible={aiLoading} transparent animationType="fade">
        <View style={styles.aiOverlay}>
          <ActivityIndicator size="large" color={brand.surface} />
          <Text style={styles.aiText}>{t('toast.aiLoading')}</Text>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  toastWrap: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 36,
    zIndex: 1000,
  },
  toast: {
    borderRadius: 14,
    backgroundColor: brand.navy,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: brand.navyDeep,
  },
  toastText: {
    fontFamily: 'Figtree_500Medium',
    fontSize: 14,
    lineHeight: 20,
    color: brand.surface,
    textAlign: 'center',
  },
  networkWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 56,
    zIndex: 1001,
  },
  networkBanner: {
    borderRadius: 14,
    backgroundColor: brand.score.poor,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  networkText: {
    fontFamily: 'Figtree_700Bold',
    fontSize: 14,
    color: brand.surface,
  },
  networkActions: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  networkBtn: {
    borderRadius: 10,
    backgroundColor: brand.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  networkBtnText: {
    fontFamily: 'Figtree_700Bold',
    fontSize: 13,
    color: brand.score.poor,
  },
  networkBtnGhost: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  networkBtnGhostText: {
    fontFamily: 'Figtree_500Medium',
    fontSize: 13,
    color: brand.surface,
  },
  aiOverlay: {
    flex: 1,
    backgroundColor: 'rgba(12, 28, 51, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  aiText: {
    marginTop: 16,
    fontFamily: 'Figtree_500Medium',
    fontSize: 16,
    color: brand.surface,
    textAlign: 'center',
  },
});
