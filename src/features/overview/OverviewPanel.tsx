"use client";

import { PriceList } from "@/components/ui/PriceList";
import { formatPrice, withVat } from "@/lib/utils/prices";
import type { PricePoint } from "@/types/prices";

type OverviewPanelProps = {
  points: PricePoint[];
  min: number;
  max: number;
  includeVat: boolean;
  isLoading: boolean;
  showStats?: boolean;
  className?: string;
};

export function OverviewPanel({
  points,
  min,
  max,
  includeVat,
  isLoading,
  showStats = false,
  className = "panel",
}: OverviewPanelProps) {
  return (
    <article className={className}>
      <h2>Oversigt</h2>

      {showStats ? (
        <div className="mobile-stats">
          <div className="mini-circle mobile-stat-circle">
            <strong>{formatPrice(withVat(min, includeVat))}</strong>
            <span>Laveste pris</span>
          </div>
          <div className="mini-circle mobile-stat-circle">
            <strong>{formatPrice(withVat(max, includeVat))}</strong>
            <span>Højeste pris</span>
          </div>
        </div>
      ) : null}

      {isLoading ? <p className="loading">Henter priser...</p> : <PriceList points={points} min={min} max={max} includeVat={includeVat} />}
    </article>
  );
}