import { z } from "zod";

export const packIdSchema = z.enum(["movies", "adult", "combo"]);

export const planDurationSchema = z.enum([
  "1 Month",
  "3 Months",
  "6 Months",
  "1 Year",
]);

export const createOrderSchema = z.object({
  pack: packIdSchema,
  plan: planDurationSchema,
  method: z.enum(["upi", "razorpay", "universal"]).default("upi"),
  contact: z.string().trim().max(80).optional(),
});

export const updateOrderSchema = z.object({
  status: z.enum(["pending", "paid", "active", "rejected"]).optional(),
  note: z.string().trim().max(500).optional(),
  contact: z.string().trim().max(80).optional(),
});

export const loginSchema = z.object({
  password: z.string().min(1).max(200),
});

export const trackSchema = z.object({
  path: z.string().max(200).default("/"),
  screen: z.string().max(40).default("?"),
  lang: z.string().max(40).default("?"),
  tz: z.string().max(60).default("?"),
});

export const settingsSchema = z.object({
  upiId: z.string().trim().min(3).max(80).optional(),
  upiName: z.string().trim().min(1).max(60).optional(),
  razorpayLink: z.string().trim().url().max(200).optional(),
  telegramChannel: z.string().trim().url().max(200).optional(),
  telegramSupport: z.string().trim().url().max(200).optional(),
  supportEmail: z.string().trim().email().max(120).optional(),
  maintenance: z.boolean().optional(),
  announcement: z.string().trim().max(300).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
