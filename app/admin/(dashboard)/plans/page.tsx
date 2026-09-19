import { Info } from "lucide-react";
import { Badge } from "@/components/ui/Card";
import { PACK_LIST, formatINR, MONTHS, savingsPercent } from "@/lib/plans";

export const dynamic = "force-dynamic";

export default function AdminPlansPage() {
  return (
    <div className="space-y-5">
      <header>
        <p className="eyebrow text-cyan">Catalogue</p>
        <h1 className="mt-1 font-display text-xl font-extrabold sm:text-2xl">
          Plans &amp; Pricing
        </h1>
        <p className="mt-1 text-[12px] text-muted">
          Live pricing jo site pe dikh raha hai
        </p>
      </header>

      <div className="flex items-start gap-2.5 rounded-2xl border border-cyan/25 bg-cyan/8 px-4 py-3 text-[11.5px] leading-relaxed text-cyan">
        <Info className="mt-0.5 size-4 shrink-0" />
        <span>
          Prices <code className="font-mono">lib/plans.ts</code> me define hain
          — single source of truth. Rate change karne ke liye wahan edit karke
          push kar do, Vercel auto-deploy kar dega. (Runtime editing ke liye
          pehle persistent DB chahiye — README dekho.)
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {PACK_LIST.map((pack) => {
          const total = pack.items.reduce((sum, item) => sum + item.p, 0);
          return (
            <div key={pack.id} className="glass rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <span className="glass-soft grid size-10 place-items-center rounded-xl border border-line text-lg">
                  {pack.emoji}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display text-[14px] font-extrabold">
                    {pack.name}
                  </p>
                  <p className="eyebrow mt-0.5">{pack.tagline}</p>
                </div>
                {pack.featured ? <Badge tone="accent">FEATURED</Badge> : null}
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-[11.5px]">
                  <thead>
                    <tr className="border-b border-line">
                      <th className="pb-2 font-display text-[9px] tracking-[1.3px] text-faint">
                        DURATION
                      </th>
                      <th className="pb-2 text-right font-display text-[9px] tracking-[1.3px] text-faint">
                        PRICE
                      </th>
                      <th className="pb-2 text-right font-display text-[9px] tracking-[1.3px] text-faint">
                        /MO
                      </th>
                      <th className="pb-2 text-right font-display text-[9px] tracking-[1.3px] text-faint">
                        SAVE
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pack.items.map((item) => {
                      const save = savingsPercent(pack, item);
                      return (
                        <tr
                          key={item.n}
                          className="border-b border-line/50 last:border-0"
                        >
                          <td className="py-2.5 text-muted">{item.n}</td>
                          <td className="py-2.5 text-right font-mono font-bold">
                            {formatINR(item.p)}
                          </td>
                          <td className="py-2.5 text-right font-mono text-faint">
                            ₹{Math.round(item.p / MONTHS[item.n])}
                          </td>
                          <td className="py-2.5 text-right font-mono text-lime">
                            {save > 0 ? `${save}%` : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-[11px]">
                <span className="text-faint">
                  {pack.items.filter((item) => item.b).length}/
                  {pack.items.length} Razorpay buttons
                </span>
                <span className="font-mono font-bold text-accent-soft">
                  {formatINR(total)} total
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
