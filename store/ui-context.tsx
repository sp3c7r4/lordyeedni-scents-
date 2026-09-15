'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

type Overlay = 'cart' | 'search' | 'auth' | null;

interface Toast {
  message: string;
  actionLabel?: string;
  action?: () => void;
}

interface UIValue {
  overlay: Overlay;
  mobileNavOpen: boolean;
  toast: Toast | null;
  openCart: () => void;
  openSearch: () => void;
  openAuth: () => void;
  closeOverlay: () => void;
  toggleMobileNav: () => void;
  closeMobileNav: () => void;
  notify: (toast: Toast) => void;
  dismissToast: () => void;
}

const UIContext = createContext<UIValue | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = useCallback((next: Toast) => {
    if (timer.current) clearTimeout(timer.current);
    setToast(next);
    timer.current = setTimeout(() => setToast(null), 4200);
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);
  const closeOverlay = useCallback(() => setOverlay(null), []);

  /* Escape closes whatever is on top; body scroll locks behind overlays. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOverlay(null);
        setMobileNavOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = overlay ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [overlay]);

  const value: UIValue = {
    overlay, mobileNavOpen, toast,
    openCart: () => { setMobileNavOpen(false); setOverlay('cart'); },
    openSearch: () => { setMobileNavOpen(false); setOverlay('search'); },
    openAuth: () => { setMobileNavOpen(false); setOverlay('auth'); },
    closeOverlay,
    toggleMobileNav: () => setMobileNavOpen((v) => !v),
    closeMobileNav: () => setMobileNavOpen(false),
    notify, dismissToast,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used inside UIProvider');
  return ctx;
}
