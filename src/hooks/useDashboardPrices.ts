"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchPrices } from "@/lib/api/elpriser";
import { formatPrice, getAveragePrice, getCurrentPrice, getMinMax, getPriceColor, withVat } from "@/lib/utils/prices";
import type { PricePoint, Region } from "@/types/prices";

function toInputDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function normalizeDate(dateInput: string): Date {
  const [year, month, day] = dateInput.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

const TODAY = new Date();
const WEEK_AGO = new Date();
WEEK_AGO.setDate(TODAY.getDate() - 6);

type UseDashboardPricesParams = {
  region: Region;
  includeVat: boolean;
  notificationsEnabled: boolean;
  historyDate: string;
};

export function useDashboardPrices({
  region,
  includeVat,
  notificationsEnabled,
  historyDate,
}: UseDashboardPricesParams) {
  const [todayPrices, setTodayPrices] = useState<PricePoint[]>([]);
  const [historyPrices, setHistoryPrices] = useState<PricePoint[]>([]);
  const [isLoadingToday, setIsLoadingToday] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadToday() {
      setIsLoadingToday(true);
      setError(null);

      try {
        const data = await fetchPrices(new Date(), region);
        if (isMounted) {
          setTodayPrices(data);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError instanceof Error ? requestError.message : "Uventet fejl");
        }
      } finally {
        if (isMounted) {
          setIsLoadingToday(false);
        }
      }
    }

    loadToday();

    return () => {
      isMounted = false;
    };
  }, [region]);

  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      setIsLoadingHistory(true);
      setError(null);

      try {
        const data = await fetchPrices(normalizeDate(historyDate), region);
        if (isMounted) {
          setHistoryPrices(data);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError instanceof Error ? requestError.message : "Uventet fejl");
        }
      } finally {
        if (isMounted) {
          setIsLoadingHistory(false);
        }
      }
    }

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [historyDate, region]);

  const todayStats = useMemo(() => {
    const { min, max } = getMinMax(todayPrices);
    const current = getCurrentPrice(todayPrices);
    const average = getAveragePrice(todayPrices);
    return { min, max, current, average };
  }, [todayPrices]);

  useEffect(() => {
    if (!notificationsEnabled || typeof window === "undefined") {
      return;
    }

    if (!("Notification" in window)) {
      return;
    }

    let timer: number | undefined;

    async function setupNotifications() {
      if (Notification.permission === "default") {
        await Notification.requestPermission();
      }

      if (Notification.permission !== "granted") {
        return;
      }

      const sendLowestPriceNotification = () => {
        if (todayPrices.length === 0) {
          return;
        }

        const { min } = getMinMax(todayPrices);
        const value = withVat(min, includeVat);

        new Notification("ElPriser.nu", {
          body: `Dagens laveste pris i ${region} er ${formatPrice(value)} pr. kWh.`,
          icon: "/icons/apple-icon.png",
        });
      };

      sendLowestPriceNotification();
      timer = window.setInterval(sendLowestPriceNotification, 60 * 60 * 1000);
    }

    setupNotifications();

    return () => {
      if (timer) {
        window.clearInterval(timer);
      }
    };
  }, [notificationsEnabled, includeVat, region, todayPrices]);

  const currentPrice = todayStats.current ? withVat(todayStats.current.dkkPerKwh, includeVat) : 0;
  const currentColor = getPriceColor(currentPrice, withVat(todayStats.min, includeVat), withVat(todayStats.max, includeVat));
  const selectedDateLabel = normalizeDate(historyDate).toLocaleDateString("da-DK");

  return {
    todayPrices,
    historyPrices,
    isLoadingToday,
    isLoadingHistory,
    error,
    todayStats,
    currentPrice,
    currentColor,
    selectedDateLabel,
    historyDateMin: toInputDate(WEEK_AGO),
    historyDateMax: toInputDate(TODAY),
  };
}