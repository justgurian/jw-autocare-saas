import { X } from 'lucide-react';
import FocusTrap from './FocusTrap';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  const confirmStyles = {
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-retro-mustard hover:bg-yellow-600 text-black',
    default: 'bg-retro-navy hover:bg-retro-navy/90 text-white',
  }[variant];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <FocusTrap>
        <div className="relative bg-white border-2 border-black shadow-retro max-w-sm w-full p-6">
          <button
            onClick={onCancel}
            className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
          <h3 id="confirm-title" className="font-heading text-lg uppercase mb-2">{title}</h3>
          <p className="text-gray-600 text-sm mb-6">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2 border-2 border-gray-300 text-gray-700 font-heading uppercase text-sm hover:bg-gray-50"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-2 border-2 border-black font-heading uppercase text-sm shadow-retro hover:shadow-none transition-all ${confirmStyles}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </FocusTrap>
    </div>
  );
}
