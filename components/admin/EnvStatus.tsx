import { CheckCircle2, XCircle, HardDrive } from "lucide-react";

export function EnvStatus({
  env,
}: {
  env: {
    telegramBot: boolean;
    telegramChat: boolean;
    adminPassword: boolean;
    jwtSecret: boolean;
    redis: boolean;
    persistent: boolean;
    storage: string;
  };
}) {
  const rows = [
    {
      key: "TELEGRAM_BOT_TOKEN",
      ok: env.telegramBot,
      hint: "Notifications bhejne ke liye",
    },
    {
      key: "TELEGRAM_CHAT_ID",
      ok: env.telegramChat,
      hint: "Kahan notification jaye",
    },
    {
      key: "ADMIN_PASSWORD",
      ok: env.adminPassword,
      hint: "Admin login password",
    },
    {
      key: "ADMIN_JWT_SECRET",
      ok: env.jwtSecret,
      hint: "Session sign karne ke liye (fallback: ADMIN_PASSWORD)",
    },
    {
      key: "UPSTASH_REDIS_REST_URL",
      ok: env.redis,
      hint: "Orders/visitors permanently save karne ke liye",
    },
  ];

  return (
    <div className="glass rounded-2xl p-5">
      <p className="eyebrow">Environment Health</p>
      <div className="mt-4 space-y-2.5">
        {rows.map((row) => (
          <div
            key={row.key}
            className="flex items-start justify-between gap-3 border-b border-line/60 pb-2.5 last:border-0 last:pb-0"
          >
            <div className="min-w-0">
              <code className="font-mono text-[11.5px] font-bold">
                {row.key}
              </code>
              <p className="mt-0.5 text-[10.5px] text-faint">{row.hint}</p>
            </div>
            {row.ok ? (
              <span className="flex shrink-0 items-center gap-1 text-[10px] font-extrabold tracking-[1.1px] text-lime">
                <CheckCircle2 className="size-3.5" /> SET
              </span>
            ) : (
              <span className="flex shrink-0 items-center gap-1 text-[10px] font-extrabold tracking-[1.1px] text-pink">
                <XCircle className="size-3.5" /> MISSING
              </span>
            )}
          </div>
        ))}

        <div className="flex items-start justify-between gap-3 border-t border-line pt-3">
          <div className="min-w-0">
            <span className="flex items-center gap-1.5 font-display text-[11.5px] font-bold">
              <HardDrive className="size-3.5 text-muted" /> Storage
            </span>
            <p className="mt-0.5 text-[10.5px] text-faint">
              Orders &amp; visitor logs kahan save ho rahe hain
            </p>
          </div>
          <span
            className={`shrink-0 text-right text-[10px] font-extrabold uppercase tracking-[1.1px] ${
              env.persistent ? "text-lime" : "text-amber"
            }`}
          >
            {env.storage}
            <span className="mt-0.5 block text-[9px] font-bold tracking-[1px] opacity-70">
              {env.persistent ? "persistent" : "ephemeral"}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
