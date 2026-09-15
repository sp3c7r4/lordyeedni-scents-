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

/**
 * Six random digits. `ponytail:` a random draw can collide; the unique index on
 * `number` turns a collision into a failed insert rather than a duplicate record.
 * Move to a counters collection if that ever actually fires.
 */
export const mintOrderNumber = (): string => 'LS-' + Math.floor(100000 + Math.random() * 899999);

/** Snapshot each line: an order must still render after the product is renamed or deleted. */
export const withLineTotals = (lines: OrderLineInput[]): OrderLine[] =>
  lines.map((line) => ({ ...line, lineTotal: line.unitPrice * line.qty }));

export function buildOrder(input: OrderInput): Order {
  return {
    ...input,
    number: mintOrderNumber(),
    lines: withLineTotals(input.lines),
    status: 'new',
    createdAt: new Date(),
  };
}
