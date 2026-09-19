import type { OrderStatus } from "./types";

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  paid: "Claimed",
  active: "Active",
  rejected: "Rejected",
};

export const STATUS_TONE: Record<
  OrderStatus,
  "accent" | "cyan" | "lime" | "pink" | "amber" | "muted"
> = {
  pending: "amber",
  paid: "cyan",
  active: "lime",
  rejected: "pink",
};

export const STATUS_HELP: Record<OrderStatus, string> = {
  pending: "Order बना hai, payment ka intezaar hai.",
  paid: "User ne payment claim kiya hai — verify karke approve karo.",
  active: "Verified aur activated. Access de diya gaya.",
  rejected: "Reject kiya gaya (payment nahi mila / fraud).",
};

export const ALL_STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "active",
  "rejected",
];
