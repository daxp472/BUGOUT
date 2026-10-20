import React, { useEffect } from 'react';

export interface ToastMessage {
  id: string;
  type: 'evidence' | 'objective' | 'unlock' | 'alert';
  title: string;
  description: string;
}

interface NotificationToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ toasts, onDismiss }) => {
  useEffect(() => {
    if (toasts.length === 0) return;
    const latest = toasts[toasts.length - 1];
    const timer = setTimeout(() => {
      onDismiss(latest.id);
    }, 4500);

    return () => clearTimeout(timer);
  }, [toasts, onDismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-notifications-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`sci-fi-toast-pill toast-${toast.type}`}>
          <div className="toast-icon-slot">
            {toast.type === 'evidence' && '📂'}
            {toast.type === 'objective' && '✓'}
            {toast.type === 'unlock' && '🔓'}
            {toast.type === 'alert' && '⚠'}
          </div>
          <div className="toast-content-slot">
            <span className="toast-title">{toast.title}</span>
            <span className="toast-desc">{toast.description}</span>
          </div>
          <button className="toast-dismiss-x" onClick={() => onDismiss(toast.id)}>✕</button>
        </div>
      ))}
    </div>
  );
};
