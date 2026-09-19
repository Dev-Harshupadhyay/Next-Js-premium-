export type PackId = "movies" | "adult" | "combo";

export type PlanDuration = "1 Month" | "3 Months" | "6 Months" | "1 Year";

export interface PlanItem {
  /** Duration label, e.g. "3 Months" */
  n: PlanDuration;
  /** Price in INR */
  p: number;
  /** Razorpay payment-button id (optional) */
  b?: string;
  /** Marks the highlighted "best value" row */
  hot?: boolean;
}

export interface Pack {
  id: PackId;
  name: string;
  emoji: string;
  subtitle: string;
  tagline: string;
  featured?: boolean;
  items: PlanItem[];
}

export type OrderStatus = "pending" | "paid" | "active" | "rejected";

export interface Order {
  id: string;
  pack: PackId;
  packName: string;
  plan: PlanDuration;
  amount: number;
  status: OrderStatus;
  method: "upi" | "razorpay" | "universal";
  contact?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
  /** Coarse metadata captured server-side */
  meta?: {
    country?: string;
    city?: string;
    device?: string;
    referer?: string;
  };
}

export interface VisitorLog {
  id: string;
  time: string;
  ip: string;
  country: string;
  region: string;
  city: string;
  device: string;
  browser: string;
  os: string;
  screen: string;
  lang: string;
  tz: string;
  path: string;
  referer: string;
}

export interface Settings {
  upiId: string;
  upiName: string;
  razorpayLink: string;
  telegramChannel: string;
  telegramSupport: string;
  supportEmail: string;
  maintenance: boolean;
  announcement: string;
}

export interface AdminStats {
  /** Actual paying customers — paid + active (pending = abhi paisa nahi aaya) */
  buyers: {
    total: number;
    today: number;
    thisMonth: number;
  };
  orders: {
    total: number;
    pending: number;
    active: number;
    rejected: number;
    today: number;
  };
  revenue: {
    total: number;
    active: number;
    today: number;
    avgOrderValue: number;
  };
  visitors: {
    total: number;
    today: number;
    mobile: number;
    desktop: number;
    uniqueCountries: number;
  };
  conversionRate: number;
  /** Last 7 days, oldest first */
  timeline: Array<{
    date: string;
    label: string;
    orders: number;
    revenue: number;
    visitors: number;
  }>;
  topPacks: Array<{ pack: string; count: number; revenue: number }>;
}
