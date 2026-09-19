import Link from "next/link";
import { SITE } from "@/lib/config";

export function Footer() {
  return (
    <footer className="relative z-10 mt-20 border-t border-line px-4 py-10 text-center">
      <p className="text-[11px] leading-relaxed text-faint">
        © {new Date().getFullYear()} TIMEPASS PREMIUM · MADE BY{" "}
        <a
          href={SITE.authorUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-soft hover:underline"
        >
          {SITE.author}
        </a>
        <br />
        SECURE PAYMENTS · UPI &amp; RAZORPAY
      </p>

      <nav className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10.5px] text-faint">
        <Link href="/" className="transition hover:text-muted">
          Home
        </Link>
        <span aria-hidden>·</span>
        <Link href="/order" className="transition hover:text-muted">
          Track Order
        </Link>
        <span aria-hidden>·</span>
        <Link href="/admin" className="transition hover:text-muted">
          Admin
        </Link>
      </nav>
    </footer>
  );
}
