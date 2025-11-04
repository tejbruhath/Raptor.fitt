"use client";

import { useEffect, useRef, useState } from "react";
import { isChromium } from "@/utils/isChromium";

const STORAGE_KEY = "raptor.chromium-warning-dismissed";

export default function NonChromiumModal() {
  const [visible, setVisible] = useState(false);
  const lastFocusedElement = useRef<Element | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const dismissed = window.localStorage.getItem(STORAGE_KEY);
    if (dismissed === "true") {
      return;
    }

    if (!isChromium()) {
      lastFocusedElement.current = document.activeElement;
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
      } else if (event.key === "Tab") {
        // Simple focus trap: keep focus on close button
        event.preventDefault();
        closeButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleEscape);
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [visible]);

  const handleClose = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "true");
    }
    setVisible(false);
    if (lastFocusedElement.current instanceof HTMLElement) {
      lastFocusedElement.current.focus();
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chromium-modal-title"
      onClick={handleClose}
    >
      <div
        className="w-[90%] max-w-sm rounded-2xl bg-neutral/90 p-6 text-center shadow-glow animate-fade-in border border-white/10"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="chromium-modal-title" className="mb-2 text-xl font-semibold">Best viewed on Chrome 🦖</h2>
        <p className="mb-4 text-sm text-muted">
          Raptor.Fitt works best on Chrome or other Chromium browsers like Edge, Brave, or Opera.
          Safari and Firefox may affect animations or PWA install prompts.
        </p>
        <button
          onClick={handleClose}
          ref={closeButtonRef}
          className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
        >
          Continue Anyway
        </button>
      </div>
    </div>
  );
}
