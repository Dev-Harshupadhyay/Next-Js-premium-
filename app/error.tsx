"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-dvh place-items-center bg-bg p-6 text-center">
      <div>
        <p className="text-grad font-display text-5xl font-extrabold">Oops</p>
        <h1 className="mt-3 font-display text-lg font-extrabold text-ink">
          Kuch galat ho gaya
        </h1>
        <p className="mt-2 max-w-sm text-[12.5px] text-muted">
          Ek unexpected error aa gayi. Page reload karke dekho.
        </p>
        <button
          type="button"
          onClick={reset}
          className="grad-bg mt-6 cursor-pointer rounded-2xl px-6 py-3 font-display text-[12px] font-extrabold tracking-[1.4px] text-white transition hover:brightness-110"
        >
          TRY AGAIN
        </button>
      </div>
    </main>
  );
}
