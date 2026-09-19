import { SectionLabel } from "@/components/ui/Card";
import { Hero } from "@/components/site/Hero";
import { PlanCards } from "@/components/site/PlanCards";
import { Steps } from "@/components/site/Steps";
import { Faq } from "@/components/site/Faq";
import { TelegramGate } from "@/components/site/TelegramGate";
import { VisitTracker } from "@/components/site/VisitTracker";
import { getSettings } from "@/lib/db";
import { qrDataUrl } from "@/lib/qr";
import { PACK_LIST } from "@/lib/plans";
import { SITE } from "@/lib/config";

export default async function HomePage() {
  const settings = await getSettings();
  const channelQr = await qrDataUrl(settings.telegramChannel);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: SITE.name,
    description: SITE.description,
    image: SITE.heroImage,
    brand: { "@type": "Brand", name: SITE.shortName },
    offers: PACK_LIST.flatMap((pack) =>
      pack.items.map((item) => ({
        "@type": "Offer",
        name: `${pack.name} · ${item.n}`,
        price: item.p,
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
        url: `${SITE.url}/checkout/${pack.id}`,
      })),
    ),
  };

  return (
    <>
      <VisitTracker path="/" />
      <TelegramGate
        channelUrl={settings.telegramChannel}
        qrDataUrl={channelQr}
      />

      <div className="mx-auto w-[min(100%-28px,1080px)]">
        <Hero />

        <SectionLabel hint="Premium Rates">Plans &amp; Pricing</SectionLabel>
        <PlanCards />

        <SectionLabel hint="4 Simple Steps">How It Works</SectionLabel>
        <Steps />

        <SectionLabel hint="Common Questions">FAQ</SectionLabel>
        <Faq />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
    </>
  );
}
