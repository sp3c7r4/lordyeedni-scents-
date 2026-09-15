/** Order domain: shapes and number minting. Imports nothing - see lib/catalog.ts's note. */

export type PaymentMethod = 'Card' | 'Bank transfer' | 'Pay on delivery';

/** The shipping fields, shared by the checkout form, the action and the order. */
export interface Customer {
  email: string;
  first: string;
  last: string;
  address: string;
  city: string;
  zip: string;
}

export interface OrderLineInput {
  productId: number;
  slug: string;
  name: string;
  size: string;
  qty: number;
  unitPrice: number;
}

export interface OrderLine extends OrderLineInput {
  lineTotal: number;
}

export interface OrderInput extends Customer {
  payment: PaymentMethod;
  lines: OrderLineInput[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  promoCode: string | null;
}

export interface Order extends Omit<OrderInput, 'lines'> {
  number: string;
  lines: OrderLine[];
  status: 'new';
  createdAt: Date;
}
