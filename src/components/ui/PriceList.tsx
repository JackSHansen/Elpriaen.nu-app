import { formatHour, formatPrice, getPriceColor, withVat } from "@/lib/utils/prices";
import type { PricePoint } from "@/types/prices";

type PriceListProps = {
  points: PricePoint[];
  min: number;
  max: number;
  includeVat: boolean;
};

export function PriceList({ points, min, max, includeVat }: PriceListProps) {
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