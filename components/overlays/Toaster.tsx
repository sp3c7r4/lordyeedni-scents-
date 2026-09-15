'use client';

import { useUI } from '@/store/ui-context';

/** Single-slot toast, bottom centre. */
export default function Toaster() {
  const { toast, dismissToast } = useUI();
  if (!toast) return null;

  return (
    <div
      role="status" aria-live="polite"
      className="fixed bottom-7 left-1/2 z-[100] flex max-w-[92vw] -translate-x-1/2 animate-toast-in items-center gap-4 bg-ink px-6 py-4 text-paper"
    >
      <span className="h-2 w-2 flex-none bg-accent" />
      <span className="text-sm">{toast.message}</span>
      <button
        type="button"
        onClick={() => { if (toast.action) toast.action(); dismissToast(); }}
        className="label whitespace-nowrap text-accent"
      >
        {toast.actionLabel ?? 'Dismiss'}
      </button>
    </div>
  );
}
