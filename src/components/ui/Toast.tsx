import { useEffect, useState, useCallback } from 'react';

type ToastKind = 'success' | 'error';

type ToastState = {
  kind: ToastKind;
  message: string;
} | null;

export function Toast({ toast }: { toast: ToastState }) {
  if (!toast) return null;

  const styles =
    toast.kind === 'success'
      ? 'p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-sm flex items-center gap-2 text-xs font-medium'
      : 'p-3 bg-red-50 border border-red-200 text-red-700 rounded-sm flex items-center gap-2 text-xs font-medium';

  return (
    <div className={styles} role="status" aria-live="polite">
      <span className="font-bold">{toast.message}</span>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(t);
  }, [toast]);

  const showSuccess = useCallback((message: string) => 
    setToast({ kind: 'success', message }), []);
    
  const showError = useCallback((message: string) => 
    setToast({ kind: 'error', message }), []);

  const clear = useCallback(() => setToast(null), []);

  return {
    toast,
    showSuccess,
    showError,
    clear,
  };
}
