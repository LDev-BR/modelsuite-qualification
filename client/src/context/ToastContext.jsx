/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo } from 'react';
import { Toaster, toast as sonnerToast } from 'sonner';
import { useTheme } from './ThemeContext';

const ToastContext = createContext(null);
const TOAST_TIMEOUT_MS = 4200;

const getToastMessage = (message, fallback) => {
  if (typeof message !== 'string') return fallback;

  return message.trim() || fallback;
};

export const ToastProvider = ({ children }) => {
  const { theme } = useTheme();

  const value = useMemo(
    () => ({
      dismiss: (id) => sonnerToast.dismiss(id),
      error: (message) => sonnerToast.error(getToastMessage(message, 'Something went wrong'), { duration: TOAST_TIMEOUT_MS }),
      info: (message) => sonnerToast.info(getToastMessage(message, 'Notification'), { duration: TOAST_TIMEOUT_MS }),
      success: (message) => sonnerToast.success(getToastMessage(message, 'Action completed'), { duration: TOAST_TIMEOUT_MS }),
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster
        closeButton
        expand={false}
        position="top-right"
        richColors
        theme={theme}
        visibleToasts={4}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
};
