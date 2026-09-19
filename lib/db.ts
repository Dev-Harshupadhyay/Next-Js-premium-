import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { Redis } from "@upstash/redis";
import type { Order, OrderStatus, Settings, VisitorLog } from "./types";
import { DEFAULT_SETTINGS } from "./config";

/**
 * ─────────────────────────────────────────────────────────────
 *  STORAGE — auto-detecting adapter
 * ─────────────────────────────────────────────────────────────
 *  Upstash Redis env vars mile → Redis use hota hai (permanent ✅)
 *  Nahi mile → file JSON / memory fallback (local dev ke liye)
 *
 *  Koi code change nahi karna — bas Vercel pe 2 env variables
 *  daalo aur redeploy:
 *    UPSTASH_REDIS_REST_URL   (ya KV_REST_API_URL)
 *    UPSTASH_REDIS_REST_TOKEN (ya KV_REST_API_TOKEN)
 */

const MAX_VISITORS = 500;
const MAX_ORDERS = 1000;

const KEY = {
  orders: "tp:orders",
  visitors: "tp:visitors",
  settings: "tp:settings",
} as const;

/* ═══════════════ Redis client (lazy) ═══════════════ */

const redisUrl =
  process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const redisToken =
  process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

const globalRedis = globalThis as unknown as { __tpRedis?: Redis | null };

function redis(): Redis | null {
  if (globalRedis.__tpRedis !== undefined) return globalRedis.__tpRedis;
  globalRedis.__tpRedis =
    redisUrl && redisToken
      ? new Redis({ url: redisUrl, token: redisToken })
      : null;
  return globalRedis.__tpRedis;
}

/** True jab Upstash configured hai. */
export function isRedis(): boolean {
  return redis() !== null;
}

/* ═══════════════ File / memory fallback ═══════════════ */

interface Shape {
  orders: Order[];
  visitors: VisitorLog[];
  settings: Settings;
}

const DATA_DIR = process.env.TP_DATA_DIR ?? path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

const globalStore = globalThis as unknown as {
  __tpCache?: Shape;
  __tpWritable?: boolean;
};

async function loadFile(): Promise<Shape> {
  if (globalStore.__tpCache) return globalStore.__tpCache;

  let data: Shape = {
    orders: [],
    visitors: [],
    settings: { ...DEFAULT_SETTINGS },
  };

  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<Shape>;
    data = {
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      visitors: Array.isArray(parsed.visitors) ? parsed.visitors : [],
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
    };
  } catch {
    // First run or read-only FS — start clean.
  }

  globalStore.__tpCache = data;
  return data;
}

async function persistFile(data: Shape): Promise<void> {
  globalStore.__tpCache = data;
  if (globalStore.__tpWritable === false) return;
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
    globalStore.__tpWritable = true;
  } catch {
    globalStore.__tpWritable = false;
  }
}

/** Data permanently save ho raha hai ya nahi. */
export function isPersistent(): boolean {
  if (isRedis()) return true;
  return globalStore.__tpWritable !== false;
}

/** Konsa backend active hai — admin panel me dikhane ke liye. */
export function storageLabel(): string {
  if (isRedis()) return "Upstash Redis";
  return globalStore.__tpWritable === false
    ? "Memory (ephemeral)"
    : "Local file";
}

/* ═══════════════ ID generation ═══════════════ */

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function randomCode(length: number): string {
  let out = "";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < length; i += 1) {
    out += ALPHABET[bytes[i]! % ALPHABET.length];
  }
  return out;
}

export function newOrderId(): string {
  return `TP-${randomCode(6)}`;
}

/* ═══════════════ Orders ═══════════════ */

export async function listOrders(): Promise<Order[]> {
  const client = redis();
  if (client) {
    const orders = (await client.get<Order[]>(KEY.orders)) ?? [];
    return [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  const data = await loadFile();
  return [...data.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getOrder(id: string): Promise<Order | null> {
  const orders = await listOrders();
  return orders.find((order) => order.id === id) ?? null;
}

export async function createOrder(
  input: Omit<Order, "id" | "createdAt" | "updatedAt" | "status"> &
    Partial<Pick<Order, "status">>,
): Promise<Order> {
  const now = new Date().toISOString();
  const order: Order = {
    ...input,
    id: newOrderId(),
    status: input.status ?? "pending",
    createdAt: now,
    updatedAt: now,
  };

  const client = redis();
  if (client) {
    const orders = (await client.get<Order[]>(KEY.orders)) ?? [];
    await client.set(KEY.orders, [order, ...orders].slice(0, MAX_ORDERS));
    return order;
  }

  const data = await loadFile();
  data.orders.unshift(order);
  if (data.orders.length > MAX_ORDERS) data.orders.length = MAX_ORDERS;
  await persistFile(data);
  return order;
}

export async function updateOrder(
  id: string,
  patch: { status?: OrderStatus; note?: string; contact?: string },
): Promise<Order | null> {
  const apply = (order: Order): Order => ({
    ...order,
    ...(patch.status ? { status: patch.status } : {}),
    ...(patch.note !== undefined ? { note: patch.note } : {}),
    ...(patch.contact !== undefined ? { contact: patch.contact } : {}),
    updatedAt: new Date().toISOString(),
  });

  const client = redis();
  if (client) {
    const orders = (await client.get<Order[]>(KEY.orders)) ?? [];
    const index = orders.findIndex((order) => order.id === id);
    if (index === -1) return null;
    const updated = apply(orders[index]!);
    orders[index] = updated;
    await client.set(KEY.orders, orders);
    return updated;
  }

  const data = await loadFile();
  const index = data.orders.findIndex((order) => order.id === id);
  if (index === -1) return null;
  const updated = apply(data.orders[index]!);
  data.orders[index] = updated;
  await persistFile(data);
  return updated;
}

export async function deleteOrder(id: string): Promise<boolean> {
  const client = redis();
  if (client) {
    const orders = (await client.get<Order[]>(KEY.orders)) ?? [];
    const next = orders.filter((order) => order.id !== id);
    if (next.length === orders.length) return false;
    await client.set(KEY.orders, next);
    return true;
  }

  const data = await loadFile();
  const before = data.orders.length;
  data.orders = data.orders.filter((order) => order.id !== id);
  if (data.orders.length === before) return false;
  await persistFile(data);
  return true;
}

/* ═══════════════ Visitors ═══════════════ */

export async function listVisitors(): Promise<VisitorLog[]> {
  const client = redis();
  if (client) {
    const visitors = (await client.get<VisitorLog[]>(KEY.visitors)) ?? [];
    return [...visitors].sort((a, b) => b.time.localeCompare(a.time));
  }
  const data = await loadFile();
  return [...data.visitors].sort((a, b) => b.time.localeCompare(a.time));
}

export async function addVisitor(
  input: Omit<VisitorLog, "id">,
): Promise<VisitorLog> {
  const log: VisitorLog = { ...input, id: randomCode(10) };

  const client = redis();
  if (client) {
    const visitors = (await client.get<VisitorLog[]>(KEY.visitors)) ?? [];
    await client.set(KEY.visitors, [log, ...visitors].slice(0, MAX_VISITORS));
    return log;
  }

  const data = await loadFile();
  data.visitors.unshift(log);
  if (data.visitors.length > MAX_VISITORS) data.visitors.length = MAX_VISITORS;
  await persistFile(data);
  return log;
}

export async function clearVisitors(): Promise<void> {
  const client = redis();
  if (client) {
    await client.set(KEY.visitors, []);
    return;
  }
  const data = await loadFile();
  data.visitors = [];
  await persistFile(data);
}

/* ═══════════════ Settings ═══════════════ */

export async function getSettings(): Promise<Settings> {
  const client = redis();
  if (client) {
    const stored = await client.get<Partial<Settings>>(KEY.settings);
    return { ...DEFAULT_SETTINGS, ...(stored ?? {}) };
  }
  const data = await loadFile();
  return data.settings;
}

export async function saveSettings(patch: Partial<Settings>): Promise<Settings> {
  const client = redis();
  if (client) {
    const current = await getSettings();
    const next = { ...current, ...patch };
    await client.set(KEY.settings, next);
    return next;
  }

  const data = await loadFile();
  data.settings = { ...data.settings, ...patch };
  await persistFile(data);
  return data.settings;
}
