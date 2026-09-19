import { Aurora } from "@/components/ui/Aurora";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getSettings } from "@/lib/db";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <>
      <Aurora />
      <div className="relative z-10 flex min-h-dvh flex-col">
        <Header settings={settings} />
        {settings.announcement ? (
          <div className="grad-bg relative z-10 px-4 py-2 text-center font-display text-[11px] font-extrabold tracking-[1.2px] text-white">
            {settings.announcement}
          </div>
        ) : null}
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </>
  );
}
