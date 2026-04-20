import type { PricePoint } from "@/types/prices";

export function withVat(value: number, includeVat: boolean): number {
  return includeVat ? value * 1.25 : value;
}

export function formatPrice(value: number): string {
  return `${value.toFixed(3)} kr`;
}

export function formatTimeWindow(timeStart: string, timeEnd: string): string {
  const start = new Date(timeStart);
  const end = new Date(timeEnd);
  return `${start.getHours().toString().padStart(2, "0")}.00 - ${end
    .getHours()
    .toString()
    .padStart(2, "0")}.00`;
}

export function formatHour(timeStart: string): string {
  const start = new Date(timeStart);
  return `kl. ${start.getHours().toString().padStart(2, "0")}.00`;
}

export function getMinMax(points: PricePoint[]): { min: number; max: number } {
  if (points.length === 0) {
    return { min: 0, max: 0 };
  }

  const values = points.map((point) => point.dkkPerKwh);
  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

export function getCurrentPrice(points: PricePoint[]): PricePoint | null {
  if (points.length === 0) {
    return null;
  }

  const now = Date.now();
  const active = points.find((point) => {
    const start = new Date(point.timeStart).getTime();
    const end = new Date(point.timeEnd).getTime();
    return now >= start && now < end;
  });

  return active ?? points[0];
}

export function getAveragePrice(points: PricePoint[]): number {
  if (points.length === 0) {
    return 0;
  }

  const total = points.reduce((sum, point) => sum + point.dkkPerKwh, 0);
  return total / points.length;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function getPriceColor(value: number, min: number, max: number): string {
  const ratio = max === min ? 0.5 : clamp((value - min) / (max - min), 0, 1);

  const red = Math.round(255 - ratio * 170);
  const green = Math.round(90 + ratio * 146);
  const blue = Math.round(32 + ratio * 10);

  return `rgb(${red}, ${green}, ${blue})`;
}
