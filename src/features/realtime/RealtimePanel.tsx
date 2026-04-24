"use client";

import { formatPrice, formatTimeWindow, withVat } from "@/lib/utils/prices";
import type { PricePoint } from "@/types/prices";

type RealtimePanelProps = {
  currentPrice: number;
  currentColor: string;
  current: PricePoint | null;
  includeVat: boolean;
  averagePrice: number;
  region: string;
  minPrice: number;
  maxPrice: number;
  showDetails?: boolean;
};

export function RealtimePanel({
  currentPrice,
  currentColor,
  current,
  includeVat,
  averagePrice,
  region,
  minPrice,
  maxPrice,
  showDetails = true,
}: RealtimePanelProps) {
  return (
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
        {current ? formatTimeWindow(current.timeStart, current.timeEnd) : "Ingen data"}
      </p>

      {showDetails ? (
        <>
          <div className="extremes">
            <div className="mini-circle">
              <strong>{formatPrice(withVat(minPrice, includeVat))}</strong>
              <span>Laveste pris</span>
            </div>
            <div className="mini-circle">
              <strong>{formatPrice(withVat(maxPrice, includeVat))}</strong>
              <span>Højeste pris</span>
            </div>
          </div>

          <p className="info-text">
            Alle priser er i DKK pr. kWh og vises for region {region}. Døgnets gennemsnit er{" "}
            {formatPrice(withVat(averagePrice, includeVat))}.
          </p>
        </>
      ) : null}
    </article>
  );
}