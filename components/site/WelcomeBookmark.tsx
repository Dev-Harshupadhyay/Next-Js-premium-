"use client";

import { useEffect, useState } from "react";

/**
 * Gold "WELCOME HARSH 🚩" bookmark ribbon.
 * Hero ke neeche fade-in hota hai, phir AUTO_HIDE_MS ke baad
 * apne aap gayab ho jata hai (ya tap karne pe turant).
 */
const APPEAR_DELAY_MS = 600;
const AUTO_HIDE_MS = 5000;

export function WelcomeBookmark({ name = "HARSH" }: { name?: string }) {
  const [shown, setShown] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const appear = setTimeout(() => setShown(true), APPEAR_DELAY_MS);
    const hide = setTimeout(
      () => setShown(false),
      APPEAR_DELAY_MS + AUTO_HIDE_MS,
    );
    // Transition khatam hone ke baad DOM se hata do
    const remove = setTimeout(
      () => setGone(true),
      APPEAR_DELAY_MS + AUTO_HIDE_MS + 700,
    );

    return () => {
      clearTimeout(appear);
      clearTimeout(hide);
      clearTimeout(remove);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      aria-hidden={!shown}
      className={`pointer-events-none mt-5 flex justify-center transition-all duration-700 ease-out ${
        shown
          ? "translate-y-0 scale-100 opacity-100 blur-0"
          : "-translate-y-2 scale-95 opacity-0 blur-[2px]"
      }`}
    >
      <button
        type="button"
        onClick={() => setShown(false)}
        tabIndex={shown ? 0 : -1}
        aria-label={`Welcome ${name} — tap to dismiss`}
        className="pointer-events-auto relative cursor-pointer overflow-hidden rounded-full px-5 py-2.5 font-display text-[10.5px] font-black tracking-[1.6px] text-[#191203] shadow-[0_6px_22px_rgba(212,175,55,.38),inset_0_1px_0_rgba(255,255,255,.55)] transition-transform active:scale-[0.94]"
        style={{
          background:
            "linear-gradient(100deg,#b8860b 0%,#f5d87a 22%,#fffbe8 42%,#f5d87a 62%,#b8860b 100%)",
          backgroundSize: "220% 100%",
          animation: "goldslide 6s linear infinite",
        }}
      >
        <span className="relative z-10">WELCOME {name} 🚩</span>
      </button>

      <style>{`
        @keyframes goldslide {
          0%   { background-position: 220% 0; }
          100% { background-position: -20% 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          [aria-label^="Welcome"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
