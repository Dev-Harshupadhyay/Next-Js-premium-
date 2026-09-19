import Link from "next/link";
import { Aurora } from "@/components/ui/Aurora";

export default function NotFound() {
  return (
    <>
      <Aurora />
      <main className="relative z-10 grid min-h-dvh place-items-center p-6 text-center">
        <div>
          <p className="text-grad font-display text-7xl font-extrabold">404</p>
          <h1 className="mt-3 font-display text-lg font-extrabold">
            Page nahi mila
          </h1>
          <p className="mt-2 max-w-sm text-[12.5px] text-muted">
            Jo link tum khol rahe ho wo exist nahi karta ya order ID galat hai.
          </p>
          <Link
            href="/"
            className="grad-bg mt-6 inline-flex items-center gap-2 rounded-2xl px-6 py-3 font-display text-[12px] font-extrabold tracking-[1.4px] text-white transition hover:brightness-110"
          >
            GO HOME
          </Link>
        </div>
      </main>
    </>
  );
}
