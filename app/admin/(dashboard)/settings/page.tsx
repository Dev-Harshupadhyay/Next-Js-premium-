import { SettingsForm } from "@/components/admin/SettingsForm";
import { getSettings, isPersistent } from "@/lib/db";
import { EnvStatus } from "@/components/admin/EnvStatus";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  const env = {
    telegramBot: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    telegramChat: Boolean(process.env.TELEGRAM_CHAT_ID),
    adminPassword: Boolean(process.env.ADMIN_PASSWORD),
    jwtSecret: Boolean(process.env.ADMIN_JWT_SECRET),
    persistent: isPersistent(),
  };

  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow text-cyan">Configuration</p>
        <h1 className="mt-1 font-display text-xl font-extrabold sm:text-2xl">
          Settings
        </h1>
        <p className="mt-1 text-[12px] text-muted">
          UPI ID, links, announcement — bina redeploy ke update karo
        </p>
      </header>

      <EnvStatus env={env} />
      <SettingsForm initial={settings} />
    </div>
  );
}
