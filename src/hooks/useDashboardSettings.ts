"use client";

import { useEffect, useState } from "react";
import type { AppSettings } from "@/types/prices";

const SETTINGS_KEY = "elpriser_settings";

export const INITIAL_SETTINGS: AppSettings = {
  includeVat: true,
  notificationsEnabled: false,
  region: "DK2",
};

function sanitizeSettings(raw: string): AppSettings {
  const parsed = JSON.parse(raw) as Partial<AppSettings>;

  return {
    includeVat: Boolean(parsed.includeVat),
    notificationsEnabled: Boolean(parsed.notificationsEnabled),
    region: parsed.region === "DK1" ? "DK1" : "DK2",
  };
}

export function useDashboardSettings() {
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);

  useEffect(() => {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return;
    }

    try {
      setSettings(sanitizeSettings(raw));
    } catch {
      setSettings(INITIAL_SETTINGS);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  return { settings, setSettings };
}