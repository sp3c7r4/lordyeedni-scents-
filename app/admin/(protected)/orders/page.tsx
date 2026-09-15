import { ordersCollection } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import OrdersTable from '@/components/admin/OrdersTable';

export const dynamic = 'force-dynamic';

/** `q` reaches a RegExp, so metacharacters in it must be inert. */
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  await requireAdmin();
  const { q } = await searchParams;
  /* A repeated parameter (`?q=a&q=b`) arrives as an array; take the first value
   * rather than letting `.trim()` blow up the route. */
  const query = (Array.isArray(q) ? q[0] ?? '' : q ?? '').trim();

  const col = await ordersCollection();
  const filter = query
    ? {
        $or: [
          { number: new RegExp(escapeRegex(query), 'i') },
          { email: new RegExp(escapeRegex(query), 'i') },
          { first: new RegExp(escapeRegex(query), 'i') },
          { last: new RegExp(escapeRegex(query), 'i') },
        ],
      }
    : {};

  /* `{ _id: 0 }` is required, not tidiness: `orders` is handed to a client
   * component and an ObjectId does not survive that boundary. */
  const orders = await col
    .find(filter, { projection: { _id: 0 } })
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray();

  return (
    <>
      <h1 className="mb-6 font-display text-[clamp(28px,3.4vw,40px)] font-medium">Orders</h1>
      <form className="mb-6 flex gap-3">
        <input
          name="q"
          defaultValue={query}
          aria-label="Search orders"
          placeholder="Order number, name or email"
          className="w-full max-w-[360px] border border-line px-3 py-2.5 text-sm focus:border-ink focus:outline-none"
        />
        <button
          type="submit"
          className="border-2 border-ink px-5 text-[11px] uppercase tracking-label hover:bg-ink hover:text-paper"
        >
          Search
        </button>
      </form>
      <OrdersTable orders={orders} query={query} />
    </>
  );
}
