import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Order, OrderStatus, Settings, VisitorLog } from "./types";
import { DEFAULT_SETTINGS } from "./config";

/**
 * ─────────────────────────────────────────────────────────────
 *  STORAGE ADAPTER
 * ─────────────────────────────────────────────────────────────
 *  Abhi: file-backed JSON (dev) + in-memory fallback (serverless).
 *  Baad me Upstash/Vercel KV chahiye ho to sirf `Store` interface
 *  implement karke `store` export swap kar do — baaki app untouched.
 *
 *  ⚠️ Vercel serverless pe filesystem ephemeral hai: data cold
 *  start pe reset ho jata hai. Production persistence ke liye
 *  README ka "Database upgrade" section dekho.
 */

interface Shape {
  orders: Order[];
  visitors: VisitorLog[];
  settings: Settings;
}

const EMPTY: Shape = {
  orders: [],
  visitors: [],
  settings: DEFAULT_SETTINGS,
};

const MAX_VISITORS = 500;
const MAX_ORDERS = 1000;

const DATA_DIR = process.env.TP_DATA_DIR ?? path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

/** Survives HMR in dev and warm lambda invocations in prod. */
const globalStore = globalThis as unknown as {
  __tpCache?: Shape;
  __tpWritable?: boolean;
};

async function load(): Promise<Shape> {
  if (globalStore.__tpCache) return globalStore.__tpCache;

  let data: Shape = structuredClone(EMPTY);
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

async function persist(data: Shape): Promise<void> {
  globalStore.__tpCache = data;
  if (globalStore.__tpWritable === false) return;
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
    globalStore.__tpWritable = true;
  } catch {
    // Read-only filesystem (e.g. Vercel lambda) — memory cache still works.
    globalStore.__tpWritable = false;
  }
}

/* ──────────────── ID generation ──────────────── */

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

/* ──────────────── Orders ──────────────── */

export async function listOrders(): Promise<Order[]> {
  const data = await load();
  return [...data.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getOrder(id: string): Promise<Order | null> {
  const data = await load();
  return data.orders.find((order) => order.id === id) ?? null;
}

export async function createOrder(
  input: Omit<Order, "id" | "createdAt" | "updatedAt" | "status"> &
    Partial<Pick<Order, "status">>,
): Promise<Order> {
  const data = await load();
  const now = new Date().toISOString();
  const order: Order = {
    ...input,
    id: newOrderId(),
    status: input.status ?? "pending",
    createdAt: now,
    updatedAt: now,
  };
  data.orders.unshift(order);
  if (data.orders.length > MAX_ORDERS) data.orders.length = MAX_ORDERS;
  await persist(data);
  return order;
}

export async function updateOrder(
  id: string,
  patch: { status?: OrderStatus; note?: string; contact?: string },
): Promise<Order | null> {
  const data = await load();
  const order = data.orders.find((candidate) => candidate.id === id);
  if (!order) return null;
  if (patch.status) order.status = patch.status;
  if (patch.note !== undefined) order.note = patch.note;
  if (patch.contact !== undefined) order.contact = patch.contact;
  order.updatedAt = new Date().toISOString();
  await persist(data);
  return order;
}

export async function deleteOrder(id: string): Promise<boolean> {
  const data = await load();
  const before = data.orders.length;
  data.orders = data.orders.filter((order) => order.id !== id);
  if (data.orders.length === before) return false;
  await persist(data);
  return true;
}

/* ──────────────── Visitors ──────────────── */

export async function listVisitors(): Promise<VisitorLog[]> {
  const data = await load();
  return [...data.visitors].sort((a, b) => b.time.localeCompare(a.time));
}

export async function addVisitor(
  input: Omit<VisitorLog, "id">,
): Promise<VisitorLog> {
  const data = await load();
  const log: VisitorLog = { ...input, id: randomCode(10) };
  data.visitors.unshift(log);
  if (data.visitors.length > MAX_VISITORS) data.visitors.length = MAX_VISITORS;
  await persist(data);
  return log;
}

export async function clearVisitors(): Promise<void> {
  const data = await load();
  data.visitors = [];
  await persist(data);
}

/* ──────────────── Settings ──────────────── */

export async function getSettings(): Promise<Settings> {
  const data = await load();
  return data.settings;
}

export async function saveSettings(patch: Partial<Settings>): Promise<Settings> {
  const data = await load();
  data.settings = { ...data.settings, ...patch };
  await persist(data);
  return data.settings;
}

/** True when writes land on disk (dev) vs memory only (serverless). */
export function isPersistent(): boolean {
  return globalStore.__tpWritable !== false;
}
