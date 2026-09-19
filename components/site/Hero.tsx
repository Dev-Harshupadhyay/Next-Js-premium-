import Image from "next/image";
import { Zap, Lock, Headset } from "lucide-react";
import { SITE } from "@/lib/config";

export function Hero() {
  return (
    <section className="pt-10 text-center sm:pt-14">
      <div className="animate-(--animate-rise)">
        <div className="relative mx-auto size-[120px] sm:size-[132px]">
          <div
            aria-hidden
            className="grad-bg absolute inset-0 rounded-[34px] opacity-60 blur-xl"
          />
          <Image
            src={SITE.heroImage}
            alt={SITE.name}
            width={264}
            height={264}
            priority
            className="relative size-full rounded-[30px] border border-line-hi object-cover shadow-[0_18px_50px_rgba(0,0,0,.55)]"
          />
        </div>

        <h1 className="mt-6 font-display text-[34px] font-extrabold leading-[1.1] tracking-[-0.5px] sm:text-5xl">
          <span className="text-grad">Timepass Premium</span>
        </h1>

        <p className="mt-2.5 text-[14px] font-semibold text-muted sm:text-base">
          {SITE.tagline}
        </p>

        <div className="glass-soft mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-lime/30 px-4 py-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-lime opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-lime" />
          </span>
          <span className="font-display text-[9.5px] font-extrabold tracking-[1.6px] text-lime">
            LIVE · INSTANT VERIFICATION
          </span>
        </div>
      </div>

      <div className="mt-9 grid grid-cols-3 gap-2.5 sm:gap-3">
        <TrustItem
          icon={<Zap className="size-4" />}
          title="Instant"
          sub="FAST ACCESS"
          tone="text-amber"
        />
        <TrustItem
          icon={<Lock className="size-4" />}
          title="Secure"
          sub="UPI & RAZORPAY"
          tone="text-cyan"
        />
        <TrustItem
          icon={<Headset className="size-4" />}
          title="24×7"
          sub="TG SUPPORT"
          tone="text-accent-soft"
        />
      </div>
    </section>
  );
}

function TrustItem({
  icon,
  title,
  sub,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  tone: string;
}) {
  return (
    <div className="glass flex flex-col items-center gap-1.5 rounded-2xl px-2 py-4">
      <span className={tone}>{icon}</span>
      <b className="font-display text-[13px] font-extrabold">{title}</b>
      <small className="text-[8.5px] font-extrabold tracking-[1.1px] text-faint">
        {sub}
      </small>
    </div>
  );
}
