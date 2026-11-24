const listeners = new Set();

const emit = (payload) => {
  listeners.forEach((listener) => listener(payload));
};

export const toast = {
  show: (message, options = {}) => emit({ type: 'info', message, ...options }),
  success: (message, options = {}) =>
    emit({ type: 'success', message, ...options }),
  error: (message, options = {}) =>
    emit({ type: 'error', message, ...options }),
  warning: (message, options = {}) =>
    emit({ type: 'warning', message, ...options }),
};

export const subscribeToast = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
