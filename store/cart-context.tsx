'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  FLAT_SHIPPING, FREE_SHIPPING_OVER, PROMO_CODE, PROMO_RATE,
  priceFor, type Product, type Size,
} from '@/lib/catalog';

export interface CartLine {
  /** productId + '-' + size, unique per row. */
  key: string;
  productId: number;
  /** Display snapshot, so the cart renders without the catalogue. */
  slug: string;
  name: string;
  image: string;
  size: Size;
  qty: number;
  /** Unit price snapshot, so a price change upstream cannot rewrite a live cart. */
  unitPrice: number;
}

export interface Order {
  id: string;
  total: number;
  email: string;
}

interface CartValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  promoCode: string;
  promoApplied: boolean;
  promoMessage: string;
  order: Order | null;
  add: (product: Product, size: Size, qty?: number) => void;
  setQty: (key: string, delta: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  applyPromo: (code: string) => boolean;
  placeOrder: (email: string) => Order;
}

const CartContext = createContext<CartValue | null>(null);
const STORAGE_KEY = 'lordyeedni.cart.v1';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoMessage, setPromoMessage] = useState('');
  const [order, setOrder] = useState<Order | null>(null);

  /* Persist locally until a real cart service exists. */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const stored = JSON.parse(raw) as CartLine[];
      /* Drop lines written before snapshots existed. */
      setLines(stored.filter((l) => l.key && l.name && l.image && l.slug));
    } catch {
      /* ignore malformed storage */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* storage full or blocked */
    }
  }, [lines]);

  const add = useCallback((product: Product, size: Size, qty = 1) => {
    const key = product.id + '-' + size;
    setLines((current) => {
      const found = current.find((l) => l.key === key);
      if (found) return current.map((l) => (l.key === key ? { ...l, qty: l.qty + qty } : l));
      return [...current, {
        key, productId: product.id, slug: product.slug, name: product.name,
        image: product.images[0], size, qty, unitPrice: priceFor(product, size),
      }];
    });
  }, []);

  const setQty = useCallback((key: string, delta: number) => {
    setLines((current) => current.map((l) => (l.key === key ? { ...l, qty: Math.max(1, l.qty + delta) } : l)));
  }, []);

  const remove = useCallback((key: string) => {
    setLines((current) => current.filter((l) => l.key !== key));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const subtotal = useMemo(() => lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0), [lines]);
  const discount = promoApplied ? Math.round(subtotal * PROMO_RATE) : 0;
  const shipping = subtotal === 0 || subtotal - discount >= FREE_SHIPPING_OVER ? 0 : FLAT_SHIPPING;
  const total = subtotal - discount + shipping;
  const count = lines.reduce((n, l) => n + l.qty, 0);

  const applyPromo = useCallback((code: string) => {
    const ok = code.trim().toUpperCase() === PROMO_CODE;
    setPromoCode(code);
    setPromoApplied(ok);
    setPromoMessage(ok ? '10% applied to your subtotal.' : 'That code is not recognised. Try ' + PROMO_CODE + '.');
    return ok;
  }, []);

  /** Mock order creation. Replace with a POST to your orders endpoint. */
  const placeOrder = useCallback(
    (email: string) => {
      const created: Order = { id: 'LS-' + Math.floor(100000 + Math.random() * 899999), total, email };
      setOrder(created);
      setLines([]);
      setPromoApplied(false);
      setPromoCode('');
      setPromoMessage('');
      return created;
    },
    [total],
  );

  const value: CartValue = {
    lines, count, subtotal, discount, shipping, total,
    promoCode, promoApplied, promoMessage, order,
    add, setQty, remove, clear, applyPromo, placeOrder,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
