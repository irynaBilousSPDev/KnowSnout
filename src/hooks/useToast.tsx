import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { AppToast } from '@/src/components/AppToast';
import {
  registerToastHandlers,
  showAiLoading as bridgeShowAiLoading,
  showNetworkError as bridgeShowNetworkError,
  showToast as bridgeShowToast,
  dismissNetworkError as bridgeDismissNetworkError,
} from '@/src/lib/toast';

type ToastContextValue = {
  showToast: (message: string) => void;
  showAiLoading: (visible: boolean) => void;
  showNetworkError: (onRetry?: () => void) => void;
  dismissNetworkError: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_MS = 2800;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [networkVisible, setNetworkVisible] = useState(false);
  const networkRetryRef = useRef<(() => void) | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearToastTimer = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
  }, []);

  const showToast = useCallback(
    (message: string) => {
      clearToastTimer();
      setToastMessage(message);
      toastTimerRef.current = setTimeout(() => {
        setToastMessage(null);
        toastTimerRef.current = null;
      }, TOAST_MS);
    },
    [clearToastTimer],
  );

  const showAiLoading = useCallback((visible: boolean) => {
    setAiLoading(visible);
  }, []);

  const dismissNetworkError = useCallback(() => {
    setNetworkVisible(false);
    networkRetryRef.current = null;
  }, []);

  const showNetworkError = useCallback((onRetry?: () => void) => {
    networkRetryRef.current = onRetry ?? null;
    setNetworkVisible(true);
  }, []);

  useEffect(() => {
    registerToastHandlers({
      showToast,
      showAiLoading,
      showNetworkError,
      dismissNetworkError,
    });
    return () => {
      registerToastHandlers(null);
      clearToastTimer();
    };
  }, [
    showToast,
    showAiLoading,
    showNetworkError,
    dismissNetworkError,
    clearToastTimer,
  ]);

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast,
      showAiLoading,
      showNetworkError,
      dismissNetworkError,
    }),
    [showToast, showAiLoading, showNetworkError, dismissNetworkError],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <AppToast
        toastMessage={toastMessage}
        aiLoading={aiLoading}
        networkVisible={networkVisible}
        onDismissToast={() => {
          clearToastTimer();
          setToastMessage(null);
        }}
        onRetryNetwork={() => {
          const fn = networkRetryRef.current;
          dismissNetworkError();
          fn?.();
        }}
        onDismissNetwork={dismissNetworkError}
      />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      showToast: bridgeShowToast,
      showAiLoading: bridgeShowAiLoading,
      showNetworkError: bridgeShowNetworkError,
      dismissNetworkError: bridgeDismissNetworkError,
    };
  }
  return ctx;
}
