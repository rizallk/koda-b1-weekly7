import { useCallback, useEffect, useRef, useState } from 'react';
import ToastContainer from '../../components/customs/ToastContainer';
import { ToastContext } from './ToastContext';
import { subscribeToast, toast } from '../../lib/toast';

const MAX_TOASTS = 5;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const removeToast = useCallback((id) => {
    if (timersRef.current.has(id)) {
      clearTimeout(timersRef.current.get(id));
      timersRef.current.delete(id);
    }

    setToasts((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isClosing: true } : item,
      ),
    );

    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 200);
  }, []);

  const addToast = useCallback(
    ({ type = 'info', title, message, duration = 4000 }) => {
      if (!message) return;

      const id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;

      setToasts((prev) => {
        const next = prev.length >= MAX_TOASTS ? prev.slice(1) : prev;
        return [...next, { id, type, title, message, isClosing: false }];
      });

      if (duration > 0) {
        const timerId = setTimeout(() => {
          removeToast(id);
        }, duration);
        timersRef.current.set(id, timerId);
      }

      return id;
    },
    [removeToast],
  );

  useEffect(() => {
    const timers = timersRef.current;
    const unsubscribe = subscribeToast((payload) => {
      addToast(payload);
    });

    return () => {
      unsubscribe();
      timers.forEach((timerId) => clearTimeout(timerId));
      timers.clear();
    };
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}
