"use client";

import { useEffect, useState } from "react";
import { isChromium } from "@/utils/isChromium";

const STORAGE_KEY = "raptor.chromium-warning-dismissed";

export default function NonChromiumModal() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const dismissed = window.localStorage.getItem(STORAGE_KEY);
    if (dismissed === "true") {
      return;
    }

    if (!isChromium()) {
      setVisible(true);
    }
  }, []);

  const handleClose = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "true");
    }
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[90%] max-w-sm rounded-2xl bg-neutral/90 p-6 text-center shadow-glow animate-fade-in border border-white/10">
        <h2 className="mb-2 text-xl font-semibold">Best viewed on Chrome 🦖</h2>
        <p className="mb-4 text-sm text-muted">
          Raptor.Fitt works best on Chrome or other Chromium browsers like Edge, Brave, or Opera.
          Safari and Firefox may affect animations or PWA install prompts.
        </p>
        <button
          onClick={handleClose}
          className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
        >
          Continue Anyway
        </button>
      </div>
    </div>
  );
}
