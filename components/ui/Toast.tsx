"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface ToastItem {
  id: number;
  message: string;
  tone: "default" | "success" | "error";
}

interface ToastApi {
  toast: (message: string, tone?: ToastItem["tone"]) => void;
}

const ToastContext = createContext<ToastApi>({ toast: () => {} });

export function useToast(): ToastApi {
  return useContext(ToastContext);
}

let counter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback(
    (message: string, tone: ToastItem["tone"] = "default") => {
      counter += 1;
      const id = counter;
      setItems((prev) => [...prev.slice(-3), { id, message, tone }]);
      setTimeout(() => {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }, 3200);
    },
    [],
  );

  const api = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-0 bottom-[max(18px,env(safe-area-inset-bottom))] z-[2000] flex flex-col items-center gap-2 px-4"
      >
        {items.map((item) => (
          <div
            key={item.id}
            className={`glass animate-[rise_.35s_cubic-bezier(.22,1,.36,1)_both] max-w-[92vw] rounded-2xl px-4 py-3 text-[12.5px] font-semibold shadow-2xl ${
              item.tone === "success"
                ? "border-lime/40 text-lime"
                : item.tone === "error"
                  ? "border-pink/40 text-pink"
                  : "text-ink"
            }`}
          >
            {item.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
