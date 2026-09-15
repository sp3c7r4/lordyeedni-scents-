/**
 * The WhatsApp handoff. Self-contained on purpose: it runs in a client component
 * and under `node --test`, and Node cannot resolve the `@/` alias.
 * `money` is duplicated from lib/format.ts rather than imported — sharing it
 * would drag alias resolution into the test runner for one line.
 */

export interface MessageOrder {
  number: string;
  lines: { name: string; size: string; qty: number; unitPrice: number; lineTotal: number }[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  payment: string;
  first: string;
  last: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  promoCode: string | null;
}

const money = (value: number) => '\u20A6' + Math.round(value);

/** Plain text, no emoji: the order number is already the header. */
export function buildOrderMessage(order: MessageOrder): string {
  const items = order.lines.map(
    (line, index) => `${index + 1}. ${line.name} — ${line.size} x ${line.qty} — ${money(line.lineTotal)}`,
  );

  const totals = [`Subtotal ${money(order.subtotal)}`];
  if (order.discount > 0) {
    totals.push(`Discount${order.promoCode ? ' ' + order.promoCode : ''} -${money(order.discount)}`);
  }
  totals.push(`Shipping ${order.shipping === 0 ? 'Free' : money(order.shipping)}`);
  totals.push(`Total ${money(order.total)}`);

  return [
    `New order ${order.number}`,
    '',
    ...items,
    '',
    ...totals,
    '',
    `Payment: ${order.payment}`,
    '',
    `${order.first} ${order.last}`,
    order.email,
    `${order.address}, ${order.city} ${order.zip}`,
  ].join('\n');
}

/** `number` is digits with country code, no plus sign. */
export const waLink = (number: string, text: string) =>
  `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
