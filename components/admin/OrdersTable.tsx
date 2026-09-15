'use client';

import type { Order } from '@/lib/orders';
import { money } from '@/lib/format';

/** One column template, shared by the header and every row so they stay aligned. */
const COLUMNS =
  'lg:grid-cols-[120px_130px_minmax(150px,1fr)_minmax(200px,1.6fr)_100px_130px_16px]';

/** `createdAt` crosses the RSC boundary as a real Date - React revives it. */
const formatDate = (createdAt: Date) =>
  new Date(createdAt).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

const itemCount = (order: Order) => order.lines.reduce((total, line) => total + line.qty, 0);

const lineSummary = (order: Order) =>
  order.lines.map((line) => line.qty + ' \u00d7 ' + line.name).join(', ');

const HEADINGS = ['Order', 'Placed', 'Customer', 'Items', 'Total', 'Payment', ''];

export default function OrdersTable({ orders, query }: { orders: Order[]; query: string }) {
  if (orders.length === 0) {
    return (
      <p className="border-t-2 border-ink py-10 font-editorial text-lg text-copy">
        {query
          ? 'No orders match "' + query + '".'
          : 'No orders yet. They appear here the moment someone checks out.'}
      </p>
    );
  }

  return (
    <div className="border-t-2 border-ink">
      <div className={'hidden gap-4 border-b border-line py-3 lg:grid ' + COLUMNS}>
        {HEADINGS.map((heading) => (
          <p key={heading} className="label text-quiet">
            {heading}
          </p>
        ))}
      </div>

      {orders.map((order) => (
        <details key={order.number} className="group border-b border-line">
          <summary
            className={
              'grid cursor-pointer list-none gap-1 py-4 lg:items-center lg:gap-4 ' +
              'focus-visible:bg-mist [&::-webkit-details-marker]:hidden ' +
              COLUMNS
            }
          >
            <span className="text-sm font-medium">{order.number}</span>
            <span className="text-sm text-muted">{formatDate(order.createdAt)}</span>
            <span className="truncate text-sm">
              {order.first} {order.last}
            </span>
            <span className="truncate text-sm text-copy" title={lineSummary(order)}>
              {itemCount(order)} {itemCount(order) === 1 ? 'item' : 'items'} &middot; {lineSummary(order)}
            </span>
            <span className="text-sm font-medium">{money(order.total)}</span>
            <span className="text-sm text-muted">{order.payment}</span>
            <svg
              viewBox="0 0 24 24"
              width={16}
              height={16}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="hidden text-quiet transition-transform group-open:rotate-180 lg:block"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>

          <div className="border-t border-rule bg-mist px-4 py-5 lg:px-6">
            <p className="label mb-3 text-quiet">Items</p>
            {/* Snapshots, never a lookup: the product may since have changed or gone. */}
            <ul>
              {order.lines.map((line) => (
                <li
                  key={line.slug + ' ' + line.size}
                  className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-rule py-2.5 text-sm last:border-0"
                >
                  <span className="min-w-[180px] flex-1">{line.name}</span>
                  <span className="text-muted">{line.size}</span>
                  <span className="text-muted">
                    {line.qty} &times; {money(line.unitPrice)}
                  </span>
                  <span className="ml-auto font-medium">{money(line.lineTotal)}</span>
                </li>
              ))}
            </ul>

            <p className="label mb-2 mt-6 text-quiet">Ship to</p>
            <p className="text-sm leading-relaxed text-copy">
              {order.first} {order.last}
              <br />
              {order.address}, {order.city} {order.zip}
              <br />
              {order.email}
            </p>
          </div>
        </details>
      ))}
    </div>
  );
}
