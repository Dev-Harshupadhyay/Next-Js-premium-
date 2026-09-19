import { Play, Star } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { BeamLink } from "@/components/ui/Button";
import { PACK_LIST, formatINR } from "@/lib/plans";

export function PlanCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {PACK_LIST.map((pack) => (
        <Card key={pack.id} featured={pack.featured} className="relative">
          {pack.featured ? (
            <div className="grad-bg absolute -top-2.5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 font-display text-[8.5px] font-extrabold tracking-[1.4px] text-white shadow-lg">
              <Star className="mr-1 inline size-2.5 fill-current" />
              BEST VALUE
            </div>
          ) : null}

          <div className="flex items-center gap-3">
            <span className="glass-soft grid size-11 shrink-0 place-items-center rounded-2xl border border-line text-xl">
              {pack.emoji}
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-[15px] font-extrabold">
                {pack.subtitle}
              </p>
              <p className="eyebrow mt-0.5">{pack.tagline}</p>
            </div>
          </div>

          <ul className="mt-5 space-y-0.5">
            {pack.items.map((item) => (
              <li
                key={item.n}
                className="flex items-center justify-between border-b border-line/60 py-2.5 last:border-0"
              >
                <span className="text-[12.5px] text-muted">{item.n}</span>
                <b
                  className={`font-mono text-[14px] font-bold ${
                    item.hot ? "text-lime" : "text-ink"
                  }`}
                >
                  {formatINR(item.p)}
                </b>
              </li>
            ))}
          </ul>

          <BeamLink href={`/checkout/${pack.id}`} className="mt-5">
            <Play className="size-3.5 fill-current" />
            BUY {pack.name.toUpperCase()}
          </BeamLink>
        </Card>
      ))}
    </div>
  );
}
