import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (title: string, variant?: ToastVariant, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (title: string, variant: ToastVariant = 'info', description?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, title, variant, description }]);
      setTimeout(() => {
        dismiss(id);
      }, 4200);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-[90] flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0 pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border bg-[#141515]/95 backdrop-blur-md shadow-2xl transition-all ${
              toast.variant === 'error'
                ? 'border-[#F15B5B]/50 text-[#F3F3F3]'
                : toast.variant === 'success'
                  ? 'border-[#B7F21B]/50 text-[#F3F3F3]'
                  : 'border-[#303434] text-[#F3F3F3]'
            }`}
          >
            {toast.variant === 'success' && (
              <CheckCircle2 className="w-5 h-5 text-[#B7F21B] shrink-0 mt-0.5" aria-hidden="true" />
            )}
            {toast.variant === 'error' && (
              <AlertTriangle className="w-5 h-5 text-[#F15B5B] shrink-0 mt-0.5" aria-hidden="true" />
            )}
            {toast.variant === 'info' && (
              <Info className="w-5 h-5 text-[#7CC8FF] shrink-0 mt-0.5" aria-hidden="true" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#F3F3F3] leading-snug">{toast.title}</p>
              {toast.description && (
                <p className="text-xs text-[#858989] mt-1 leading-relaxed">{toast.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Fechar notificação"
              className="p-1 text-[#858989] hover:text-[#F3F3F3] transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast deve ser utilizado dentro de ToastProvider');
  }
  return ctx;
}
