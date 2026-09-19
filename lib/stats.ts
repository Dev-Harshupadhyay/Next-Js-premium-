import "server-only";
import { listOrders, listVisitors } from "./db";
import type { AdminStats, Order, VisitorLog } from "./types";

function istDateKey(iso: string): string {
  // en-CA gives YYYY-MM-DD
  return new Date(iso).toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
}

function todayKey(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

export async function computeStats(): Promise<AdminStats> {
  const [orders, visitors] = await Promise.all([listOrders(), listVisitors()]);
  const today = todayKey();

  const active = orders.filter((order) => order.status === "active");
  const pending = orders.filter((order) => order.status === "pending");
  const rejected = orders.filter((order) => order.status === "rejected");
  const todayOrders = orders.filter(
    (order) => istDateKey(order.createdAt) === today,
  );

  const activeRevenue = sum(active.map((order) => order.amount));
  const todayRevenue = sum(
    todayOrders
      .filter((order) => order.status === "active" || order.status === "paid")
      .map((order) => order.amount),
  );
  const bookedRevenue = sum(
    orders
      .filter((order) => order.status !== "rejected")
      .map((order) => order.amount),
  );

  const todayVisitors = visitors.filter(
    (visitor) => istDateKey(visitor.time) === today,
  );

  // "Kitne logo ne purchase kiya" — sirf wo jinka paisa aaya
  // (paid = claim kiya, active = verify ho gaya). Pending count nahi hota.
  const buyers = orders.filter(
    (order) => order.status === "paid" || order.status === "active",
  );
  const monthPrefix = today.slice(0, 7); // YYYY-MM

  return {
    buyers: {
      total: buyers.length,
      today: buyers.filter((order) => istDateKey(order.createdAt) === today)
        .length,
      thisMonth: buyers.filter((order) =>
        istDateKey(order.createdAt).startsWith(monthPrefix),
      ).length,
    },
    orders: {
      total: orders.length,
      pending: pending.length,
      active: active.length,
      rejected: rejected.length,
      today: todayOrders.length,
    },
    revenue: {
      total: bookedRevenue,
      active: activeRevenue,
      today: todayRevenue,
      avgOrderValue: orders.length
        ? Math.round(bookedRevenue / orders.length)
        : 0,
    },
    visitors: {
      total: visitors.length,
      today: todayVisitors.length,
      mobile: visitors.filter((visitor) => visitor.device.includes("Mobile"))
        .length,
      desktop: visitors.filter((visitor) => visitor.device.includes("Desktop"))
        .length,
      uniqueCountries: new Set(
        visitors.map((visitor) => visitor.country).filter((c) => c && c !== "?"),
      ).size,
    },
    conversionRate: visitors.length
      ? Math.round((orders.length / visitors.length) * 1000) / 10
      : 0,
    timeline: buildTimeline(orders, visitors),
    topPacks: buildTopPacks(orders),
  };
}

function buildTimeline(orders: Order[], visitors: VisitorLog[]) {
  const days: AdminStats["timeline"] = [];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(Date.now() - offset * 86_400_000);
    const key = date.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    const label = date.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      weekday: "short",
    });

    const dayOrders = orders.filter(
      (order) => istDateKey(order.createdAt) === key,
    );

    days.push({
      date: key,
      label,
      orders: dayOrders.length,
      revenue: sum(
        dayOrders
          .filter((order) => order.status !== "rejected")
          .map((order) => order.amount),
      ),
      visitors: visitors.filter((visitor) => istDateKey(visitor.time) === key)
        .length,
    });
  }

  return days;
}

function buildTopPacks(orders: Order[]) {
  const map = new Map<string, { count: number; revenue: number }>();
  for (const order of orders) {
    const entry = map.get(order.packName) ?? { count: 0, revenue: 0 };
    entry.count += 1;
    if (order.status !== "rejected") entry.revenue += order.amount;
    map.set(order.packName, entry);
  }
  return [...map.entries()]
    .map(([pack, value]) => ({ pack, ...value }))
    .sort((a, b) => b.revenue - a.revenue);
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
