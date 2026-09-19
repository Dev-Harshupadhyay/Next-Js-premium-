"use client";

import { useEffect, useRef } from "react";

/**
 * Razorpay payment-button embed.
 * Script har mount pe fresh inject karni padti hai warna
 * button render nahi hota (Razorpay ka known behaviour).
 */
export function RazorpayButton({ buttonId }: { buttonId: string }) {
  const hostRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    host.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/payment-button.js";
    script.async = true;
    script.dataset.payment_button_id = buttonId;
    host.appendChild(script);

    return () => {
      host.innerHTML = "";
    };
  }, [buttonId]);

  return <form ref={hostRef} className="min-h-[48px]" />;
}
