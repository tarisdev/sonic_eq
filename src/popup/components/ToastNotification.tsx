import { X } from 'lucide-react';
import { t } from '@/i18n';
import { dismissToast, useToasts } from '@/hooks/useToast';

export function ToastNotification() {
  const toasts = useToasts();
  if (toasts.length === 0) return null;
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.kind}`}>
          <span>{toast.message}</span>
          <button
            type="button"
            className="icon-btn"
            onClick={() => dismissToast(toast.id)}
            aria-label={t('toast.dismissAria')}
          >
            <X size={13} aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
