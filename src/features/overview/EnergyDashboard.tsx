"use client";

import { useState } from "react";
import { HistoryPanel } from "@/features/history/HistoryPanel";
import { OverviewPanel } from "@/features/overview/OverviewPanel";
import { RealtimePanel } from "@/features/realtime/RealtimePanel";
import { SettingsPanel } from "@/features/settings/SettingsPanel";
import { useDashboardPrices } from "@/hooks/useDashboardPrices";
import { useDashboardSettings } from "@/hooks/useDashboardSettings";
import { getMinMax } from "@/lib/utils/prices";
import type { MobileTab } from "@/types/prices";

export function EnergyDashboard() {
  const { settings, setSettings } = useDashboardSettings();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<MobileTab>("oversigt");
  const [historyDate, setHistoryDate] = useState(new Date().toISOString().slice(0, 10));
  const {
    todayPrices,
    historyPrices,
    isLoadingToday,
    isLoadingHistory,
    error,
    todayStats,
    currentPrice,
    currentColor,
    selectedDateLabel,
    historyDateMin,
    historyDateMax,
  } = useDashboardPrices({
    region: settings.region,
    includeVat: settings.includeVat,
    notificationsEnabled: settings.notificationsEnabled,
    historyDate,
  });

  return (
    <main className="dashboard-shell">
      <header className="topbar desktop-topbar">
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

      <header className="mobile-topbar" aria-label="Mobil navigation">
        <img className="brand-logo" src="/icons/apple-icon.png" alt="ElPrisen.nu logo" />
        <nav className="mobile-tabs">
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
        </nav>
      </header>

      {error ? <p className="error-message">{error}</p> : null}

      <section className="desktop-grid">
        <RealtimePanel
          currentPrice={currentPrice}
          currentColor={currentColor}
          current={todayStats.current}
          includeVat={settings.includeVat}
          averagePrice={todayStats.average}
          region={settings.region}
          minPrice={todayStats.min}
          maxPrice={todayStats.max}
          showDetails
        />

        <OverviewPanel
          points={todayPrices}
          min={todayStats.min}
          max={todayStats.max}
          includeVat={settings.includeVat}
          isLoading={isLoadingToday}
          showStats={false}
          className="panel"
        />

        <HistoryPanel
          historyDate={historyDate}
          historyDateMin={historyDateMin}
          historyDateMax={historyDateMax}
          selectedDateLabel={selectedDateLabel}
          onChangeHistoryDate={setHistoryDate}
          points={historyPrices}
          min={getMinMax(historyPrices).min}
          max={getMinMax(historyPrices).max}
          includeVat={settings.includeVat}
          isLoading={isLoadingHistory}
          showSelectedLabel={false}
          className="panel"
        />
      </section>

      <section className="mobile-content">
        <div className="mobile-actions">
          <button
            type="button"
            className={`icon-button settings-shortcut ${activeTab === "indstillinger" ? "is-active" : ""}`}
            onClick={() => setActiveTab("indstillinger")}
            aria-label="Åbn indstillinger"
          >
            <i className="fa-solid fa-gear" aria-hidden="true" />
          </button>
        </div>

        {activeTab === "oversigt" && (
          <OverviewPanel
            points={todayPrices}
            min={todayStats.min}
            max={todayStats.max}
            includeVat={settings.includeVat}
            isLoading={isLoadingToday}
            showStats
            className="panel mobile-panel"
          />
        )}

        {activeTab === "lige-nu" && (
          <RealtimePanel
            currentPrice={currentPrice}
            currentColor={currentColor}
            current={todayStats.current}
            includeVat={settings.includeVat}
            averagePrice={todayStats.average}
            region={settings.region}
            minPrice={todayStats.min}
            maxPrice={todayStats.max}
            showDetails={false}
          />
        )}

        {activeTab === "historik" && (
          <HistoryPanel
            historyDate={historyDate}
            historyDateMin={historyDateMin}
            historyDateMax={historyDateMax}
            selectedDateLabel={selectedDateLabel}
            onChangeHistoryDate={setHistoryDate}
            points={historyPrices}
            min={getMinMax(historyPrices).min}
            max={getMinMax(historyPrices).max}
            includeVat={settings.includeVat}
            isLoading={isLoadingHistory}
            showSelectedLabel
            className="panel mobile-panel"
          />
        )}

        {activeTab === "indstillinger" && (
          <article className="panel settings-mobile mobile-panel">
            <h2>Indstillinger</h2>
            <SettingsPanel settings={settings} onChange={setSettings} showHeading={false} />
          </article>
        )}
      </section>

      <footer className="mobile-footer">
        <p>
          Priserne er <span>ex. moms</span> og afgifter
        </p>
        <p>
          Du vises lige nu priserne for <span>{settings.region === "DK1" ? "Vest Danmark" : "Øst Danmark"}</span>
        </p>
      </footer>

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
