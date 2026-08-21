/** Imperative toast bridge — ToastProvider registers handlers on mount. */

type ToastHandlers = {
  showToast: (message: string) => void;
  showAiLoading: (visible: boolean) => void;
  showNetworkError: (onRetry?: () => void) => void;
  dismissNetworkError: () => void;
};

let handlers: ToastHandlers | null = null;

export function registerToastHandlers(next: ToastHandlers | null) {
  handlers = next;
}

export function showToast(message: string) {
  handlers?.showToast(message);
}

export function showAiLoading(visible: boolean) {
  handlers?.showAiLoading(visible);
}

export function showNetworkError(onRetry?: () => void) {
  handlers?.showNetworkError(onRetry);
}

export function dismissNetworkError() {
  handlers?.dismissNetworkError();
}
