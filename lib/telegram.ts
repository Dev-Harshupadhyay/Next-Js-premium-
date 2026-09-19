import "server-only";

export function escapeHTML(value: unknown): string {
  return String(value ?? "?")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export interface NotifyResult {
  ok: boolean;
  reason?: string;
}

/**
 * Telegram sendMessage — token sirf server pe rehta hai.
 * Config missing ho to silently skip karta hai (site crash nahi hoti).
 */
export async function notifyTelegram(text: string): Promise<NotifyResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return { ok: false, reason: "not-configured" };
  }

  const message = text.trim();
  if (!message) return { ok: false, reason: "empty" };
  if (message.length > 6000) return { ok: false, reason: "too-long" };

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
        cache: "no-store",
      },
    );

    const result = (await response.json().catch(() => ({}))) as { ok?: boolean };
    if (!response.ok || !result.ok) {
      console.error("Telegram API error", result);
      return { ok: false, reason: "api-error" };
    }
    return { ok: true };
  } catch (error) {
    console.error("Telegram notify failed", error);
    return { ok: false, reason: "network" };
  }
}

export function istTime(date: Date = new Date()): string {
  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "medium",
  });
}
