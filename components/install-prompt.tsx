"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIos(): boolean {
  return typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIosBanner, setShowIosBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;

    if (isIos()) {
      setShowIosBanner(true);
      return;
    }

    function handler(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (dismissed) return null;

  if (deferredPrompt) {
    return (
      <div className="flex items-center justify-between gap-3 bg-blue-600 px-4 py-2 text-sm text-white">
        <span>Instalá HealthFit en tu celular</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={async () => {
              await deferredPrompt.prompt();
              setDeferredPrompt(null);
            }}
            className="rounded bg-white px-2 py-1 text-xs font-medium text-blue-600"
          >
            Instalar
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-xs text-white/80"
          >
            Ahora no
          </button>
        </div>
      </div>
    );
  }

  if (showIosBanner) {
    return (
      <div className="flex items-center justify-between gap-3 bg-blue-600 px-4 py-2 text-sm text-white">
        <span>Tocá compartir y luego &quot;Agregar a inicio&quot;</span>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-xs text-white/80"
        >
          Cerrar
        </button>
      </div>
    );
  }

  return null;
}
