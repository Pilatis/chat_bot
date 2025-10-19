import { useCallback } from 'react';
import { toaster } from '../components/ui/toaster';

export interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  closable?: boolean;
}

export const useToast = () => {
  const showSuccess = useCallback((message: string, options?: ToastOptions) => {
    toaster.create({
      title: options?.title || 'Sucesso!',
      description: message,
      type: 'success',
      duration: options?.duration || 3000,
      closable: options?.closable !== false,
    });
  }, []);

  const showError = useCallback((message: string, options?: ToastOptions) => {
    toaster.create({
      title: options?.title || 'Erro!',
      description: message,
      type: 'error',
      duration: options?.duration || 5000,
      closable: options?.closable !== false,
    });
  }, []);

  const showWarning = useCallback((message: string, options?: ToastOptions) => {
    toaster.create({
      title: options?.title || 'Atenção!',
      description: message,
      type: 'warning',
      duration: options?.duration || 4000,
      closable: options?.closable !== false,
    });
  }, []);

  const showInfo = useCallback((message: string, options?: ToastOptions) => {
    toaster.create({
      title: options?.title || 'Informação',
      description: message,
      type: 'info',
      duration: options?.duration || 3000,
      closable: options?.closable !== false,
    });
  }, []);

  const showLoading = useCallback((message: string, options?: ToastOptions) => {
    return toaster.create({
      title: options?.title || 'Carregando...',
      description: message,
      type: 'loading',
      duration: options?.duration || 0, // Loading não fecha automaticamente
      closable: options?.closable !== false,
    });
  }, []);

  const dismiss = useCallback((toastId: string) => {
    toaster.dismiss(toastId);
  }, []);

  const dismissAll = useCallback(() => {
    // O toaster do Chakra UI v3 não tem dismissAll, então vamos usar uma abordagem diferente
    // Por enquanto, vamos deixar vazio ou implementar uma lógica alternativa
  }, []);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    dismiss,
    dismissAll,
  };
};
