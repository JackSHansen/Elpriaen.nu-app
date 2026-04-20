"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister();
        });
      });
      return;
    }

    const registerServiceWorker = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js");
      } catch {
      }
    };

    registerServiceWorker();
  }, []);

  return null;
}
