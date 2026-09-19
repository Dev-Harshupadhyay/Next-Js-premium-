import { OrdersTable } from "@/components/admin/OrdersTable";
import { listOrders } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const [orders, params] = await Promise.all([listOrders(), searchParams]);

  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow text-cyan">Order Management</p>
        <h1 className="mt-1 font-display text-xl font-extrabold sm:text-2xl">
          Orders
        </h1>
        <p className="mt-1 text-[12px] text-muted">
          Approve, reject, note add karo · CSV export available
        </p>
      </header>

      <OrdersTable
        initialOrders={orders}
        initialStatus={params.status ?? "all"}
        initialQuery={params.q ?? ""}
      />
    </div>
  );
}
