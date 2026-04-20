"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchPrices } from "@/lib/api/elpriser";
import {
  formatHour,
  formatPrice,
  formatTimeWindow,
  getAveragePrice,
  getCurrentPrice,
  getMinMax,
  getPriceColor,
  withVat,
} from "@/lib/utils/prices";
import type { AppSettings, MobileTab, PricePoint, Region } from "@/types/prices";

const SETTINGS_KEY = "elpriser_settings";
const TODAY = new Date();
const WEEK_AGO = new Date();
WEEK_AGO.setDate(TODAY.getDate() - 6);

const INITIAL_SETTINGS: AppSettings = {
  includeVat: true,
  notificationsEnabled: false,
  region: "DK2",
};

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

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label className="settings-row" htmlFor={label}>
      <span>{label}</span>
      <button
        id={label}
        type="button"
        role="switch"
        aria-checked={checked}
        className={`toggle ${checked ? "is-on" : ""}`}
        onClick={() => onChange(!checked)}
      >
        <span className="toggle-handle" />
      </button>
    </label>
  );
}

function PriceList({
  points,
  min,
  max,
  includeVat,
}: {
  points: PricePoint[];
  min: number;
  max: number;
  includeVat: boolean;
}) {
  return (
    <ul className="price-list">
      {points.map((point) => {
        const price = withVat(point.dkkPerKwh, includeVat);
        const color = getPriceColor(price, withVat(min, includeVat), withVat(max, includeVat));

        return (
          <li key={point.timeStart} className="price-list-item">
            <span>{formatHour(point.timeStart)}</span>
            <span style={{ color }}>{formatPrice(price)}</span>
          </li>
        );
      })}
    </ul>
  );
}

function SettingsPanel({
  settings,
  onChange,
}: {
  settings: AppSettings;
  onChange: (next: AppSettings) => void;
}) {
  return (
    <div className="settings-content">
      <h3>Indstillinger</h3>
      <Toggle
        label="Priser inkl. moms"
        checked={settings.includeVat}
        onChange={(includeVat) => onChange({ ...settings, includeVat })}
      />
      <Toggle
        label="Laveste pris alarm"
        checked={settings.notificationsEnabled}
        onChange={(notificationsEnabled) => onChange({ ...settings, notificationsEnabled })}
      />

      <label className="settings-row" htmlFor="region-select">
        <span>Vælg region</span>
        <select
          id="region-select"
          value={settings.region}
          onChange={(event) => onChange({ ...settings, region: event.target.value as Region })}
        >
          <option value="DK1">Vest (DK1)</option>
          <option value="DK2">Øst (DK2)</option>
        </select>
      </label>
    </div>
  );
}

export function EnergyDashboard() {
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<MobileTab>("oversigt");
  const [historyDate, setHistoryDate] = useState(toInputDate(TODAY));
  const [todayPrices, setTodayPrices] = useState<PricePoint[]>([]);
  const [historyPrices, setHistoryPrices] = useState<PricePoint[]>([]);
  const [isLoadingToday, setIsLoadingToday] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as AppSettings;
      setSettings({
        includeVat: Boolean(parsed.includeVat),
        notificationsEnabled: Boolean(parsed.notificationsEnabled),
        region: parsed.region === "DK1" ? "DK1" : "DK2",
      });
    } catch {
      setSettings(INITIAL_SETTINGS);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    let isMounted = true;

    async function loadToday() {
      setIsLoadingToday(true);
      setError(null);
      try {
        const data = await fetchPrices(new Date(), settings.region);
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
  }, [settings.region]);

  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      setIsLoadingHistory(true);
      setError(null);
      try {
        const data = await fetchPrices(normalizeDate(historyDate), settings.region);
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
  }, [historyDate, settings.region]);

  const todayStats = useMemo(() => {
    const { min, max } = getMinMax(todayPrices);
    const current = getCurrentPrice(todayPrices);
    const average = getAveragePrice(todayPrices);
    return { min, max, current, average };
  }, [todayPrices]);

  useEffect(() => {
    if (!settings.notificationsEnabled || typeof window === "undefined") {
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
        const value = withVat(min, settings.includeVat);

        new Notification("ElPriser.nu", {
          body: `Dagens laveste pris i ${settings.region} er ${formatPrice(value)} pr. kWh.`,
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
  }, [settings.notificationsEnabled, settings.includeVat, settings.region, todayPrices]);

  const currentPrice = todayStats.current
    ? withVat(todayStats.current.dkkPerKwh, settings.includeVat)
    : 0;
  const currentColor = getPriceColor(
    currentPrice,
    withVat(todayStats.min, settings.includeVat),
    withVat(todayStats.max, settings.includeVat),
  );

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <div className="brand">
          <img className="brand-logo" src="/icons/apple-icon.png" alt="ElPrisen.nu logo" />
          <span>ElPrisen.nu</span>
        </div>

        <button
          type="button"
          className="icon-button"
          onClick={() => setIsSettingsOpen(true)}
          aria-label="Åbn indstillinger"
        >
          <i className="fa-solid fa-gear" aria-hidden="true" />
        </button>
      </header>

      {error ? <p className="error-message">{error}</p> : null}

      <section className="desktop-grid">
        <article className="panel now-panel">
          <h2>Elprisen lige nu</h2>

          <div className="ring-wrapper" style={{ borderColor: currentColor }}>
            <div className="ring-inner">
              <span className="price-value" style={{ color: currentColor }}>
                {formatPrice(currentPrice)}
              </span>
              <span className="price-unit">pr. kWh</span>
            </div>
          </div>

          <p className="time-window">
            {todayStats.current
              ? formatTimeWindow(todayStats.current.timeStart, todayStats.current.timeEnd)
              : "Ingen data"}
          </p>

          <div className="extremes">
            <div className="mini-circle">
              <strong>{formatPrice(withVat(todayStats.min, settings.includeVat))}</strong>
              <span>Laveste pris</span>
            </div>
            <div className="mini-circle">
              <strong>{formatPrice(withVat(todayStats.max, settings.includeVat))}</strong>
              <span>Højeste pris</span>
            </div>
          </div>

          <p className="info-text">
            Alle priser er i DKK pr. kWh og vises for region {settings.region}. Døgnets gennemsnit
            er {formatPrice(withVat(todayStats.average, settings.includeVat))}.
          </p>
        </article>

        <article className="panel">
          <h2>Oversigt</h2>
          {isLoadingToday ? (
            <p className="loading">Henter priser...</p>
          ) : (
            <PriceList
              points={todayPrices}
              min={todayStats.min}
              max={todayStats.max}
              includeVat={settings.includeVat}
            />
          )}
        </article>

        <article className="panel">
          <h2>Historik</h2>

          <label className="date-field" htmlFor="history-date">
            <i className="fa-solid fa-calendar-days" aria-hidden="true" />
            <input
              id="history-date"
              type="date"
              min={toInputDate(WEEK_AGO)}
              max={toInputDate(TODAY)}
              value={historyDate}
              onChange={(event) => setHistoryDate(event.target.value)}
            />
          </label>

          {isLoadingHistory ? (
            <p className="loading">Henter historik...</p>
          ) : (
            <PriceList
              points={historyPrices}
              min={getMinMax(historyPrices).min}
              max={getMinMax(historyPrices).max}
              includeVat={settings.includeVat}
            />
          )}
        </article>
      </section>

      <section className="mobile-content">
        {activeTab === "oversigt" && (
          <article className="panel">
            <h2>Oversigt</h2>
            <PriceList
              points={todayPrices}
              min={todayStats.min}
              max={todayStats.max}
              includeVat={settings.includeVat}
            />
          </article>
        )}

        {activeTab === "lige-nu" && (
          <article className="panel now-panel compact">
            <h2>Elprisen lige nu</h2>
            <div className="ring-wrapper" style={{ borderColor: currentColor }}>
              <div className="ring-inner">
                <span className="price-value" style={{ color: currentColor }}>
                  {formatPrice(currentPrice)}
                </span>
                <span className="price-unit">pr. kWh</span>
              </div>
            </div>
            <p className="time-window">
              {todayStats.current
                ? formatTimeWindow(todayStats.current.timeStart, todayStats.current.timeEnd)
                : "Ingen data"}
            </p>
          </article>
        )}

        {activeTab === "historik" && (
          <article className="panel">
            <h2>Historik</h2>
            <label className="date-field" htmlFor="mobile-history-date">
              <i className="fa-solid fa-calendar-days" aria-hidden="true" />
              <input
                id="mobile-history-date"
                type="date"
                min={toInputDate(WEEK_AGO)}
                max={toInputDate(TODAY)}
                value={historyDate}
                onChange={(event) => setHistoryDate(event.target.value)}
              />
            </label>
            <PriceList
              points={historyPrices}
              min={getMinMax(historyPrices).min}
              max={getMinMax(historyPrices).max}
              includeVat={settings.includeVat}
            />
          </article>
        )}

        {activeTab === "indstillinger" && (
          <article className="panel settings-mobile">
            <SettingsPanel settings={settings} onChange={setSettings} />
          </article>
        )}
      </section>

      <nav className="mobile-nav" aria-label="Mobil navigation">
        <button
          type="button"
          className={activeTab === "oversigt" ? "is-active" : ""}
          onClick={() => setActiveTab("oversigt")}
        >
          Oversigt
        </button>
        <button
          type="button"
          className={activeTab === "lige-nu" ? "is-active" : ""}
          onClick={() => setActiveTab("lige-nu")}
        >
          Lige nu
        </button>
        <button
          type="button"
          className={activeTab === "historik" ? "is-active" : ""}
          onClick={() => setActiveTab("historik")}
        >
          Historik
        </button>
        <button
          type="button"
          className={activeTab === "indstillinger" ? "is-active" : ""}
          onClick={() => setActiveTab("indstillinger")}
        >
          Indstillinger
        </button>
      </nav>

      {isSettingsOpen ? (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Indstillinger">
          <div className="settings-modal">
            <button
              type="button"
              className="icon-button close"
              onClick={() => setIsSettingsOpen(false)}
              aria-label="Luk indstillinger"
            >
              <i className="fa-solid fa-circle-xmark" aria-hidden="true" />
            </button>
            <SettingsPanel settings={settings} onChange={setSettings} />
          </div>
        </div>
      ) : null}
    </main>
  );
}
