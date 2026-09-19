import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "Payment ke baad access kitni der mein milta hai?",
    a: "Payment verify hone ke baad usually kuch minute mein hi channel/access details Telegram pe mil jati hain. Support 24×7 active hai.",
  },
  {
    q: "Kaunse payment methods accept hote hain?",
    a: "UPI (QR scan ya app intent), Razorpay payment buttons aur Razorpay Universal link — sab supported hain.",
  },
  {
    q: "Order ID ka kya kaam hai?",
    a: "Har purchase pe ek order ID milti hai (जैसे TP-A7K2M9). Us ID se tum /order page pe apna status kabhi bhi check kar sakte ho.",
  },
  {
    q: "Plan expire hone ke baad renewal kaise karu?",
    a: "Expiry se pehle ya baad mein isi page se plan kharid lo — ya Telegram pe @pmharsh se ping karo, renewal instant ho jayega.",
  },
  {
    q: "Koi problem aaye toh kya karu?",
    a: "Telegram pe @pmharsh se contact karo ya official channel @TIMEPASS_BACKUP_1 join karke latest updates dekho.",
  },
];

export function Faq() {
  return (
    <div className="grid gap-2.5">
      {FAQS.map((item) => (
        <details
          key={item.q}
          className="glass group rounded-2xl px-5 py-4 transition-colors open:border-accent/40"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[13px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
            {item.q}
            <ChevronDown className="size-4 shrink-0 text-accent transition-transform group-open:rotate-180" />
          </summary>
          <p className="mt-3 border-t border-line pt-3 text-[12.5px] leading-relaxed text-muted">
            {item.a}
          </p>
        </details>
      ))}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a },
            })),
          }),
        }}
      />
    </div>
  );
}
