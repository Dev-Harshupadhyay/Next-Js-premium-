"use client";

import { useEffect } from "react";

/**
 * Bhejta hai sirf non-identifying client hints (screen, tz, lang).
 * IP / geo / device server pe request headers se nikalta hai —
 * isliye adblock ise rok nahi sakta aur koi 3rd-party API call
 * nahi jaati (pehle ipwho.is + ipapi.co ko jaati thi).
 */
export function VisitTracker({ path }: { path: string }) {
  useEffect(() => {
    const key = `tp_tracked_${path}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    const payload = JSON.stringify({
      path,
      screen: `${window.screen.width}×${window.screen.height}`,
      lang: navigator.language,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {
      /* tracking is best-effort */
    });
  }, [path]);

  return null;
}
