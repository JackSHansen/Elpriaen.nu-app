"use client";

import { PriceList } from "@/components/ui/PriceList";
import type { PricePoint } from "@/types/prices";

type HistoryPanelProps = {
  historyDate: string;
  historyDateMin: string;
  historyDateMax: string;
  selectedDateLabel: string;
  onChangeHistoryDate: (value: string) => void;
  points: PricePoint[];
  min: number;
  max: number;
  includeVat: boolean;
  isLoading: boolean;
  showSelectedLabel?: boolean;
  className?: string;
};

export function HistoryPanel({
  historyDate,
  historyDateMin,
  historyDateMax,
  selectedDateLabel,
  onChangeHistoryDate,
  points,
  min,
  max,
  includeVat,
  isLoading,
  showSelectedLabel = false,
  className = "panel",
}: HistoryPanelProps) {
  return (
    <article className={className}>
      <h2>Historik</h2>

      <label className="date-field" htmlFor="mobile-history-date">
        <i className="fa-solid fa-calendar-days" aria-hidden="true" />
        <input
          id="mobile-history-date"
          type="date"
          min={historyDateMin}
          max={historyDateMax}
          value={historyDate}
          onChange={(event) => onChangeHistoryDate(event.target.value)}
        />
      </label>

      {showSelectedLabel ? <p className="history-label">Elpriserne d. {selectedDateLabel}</p> : null}

      {isLoading ? <p className="loading">Henter historik...</p> : <PriceList points={points} min={min} max={max} includeVat={includeVat} />}
    </article>
  );
}