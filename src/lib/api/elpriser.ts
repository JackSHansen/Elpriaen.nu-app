import type { PricePoint, Region } from "@/types/prices";

const API_BASE_URL = "https://www.elprisenligenu.dk/api/v1/prices";

type ApiPriceEntry = {
  DKK_per_kWh: number;
  time_start: string;
  time_end: string;
};

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

export function formatDateForApi(date: Date): { year: string; monthDay: string } {
  const year = date.getFullYear().toString();
  const monthDay = `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return { year, monthDay };
}

export function buildPriceUrl(date: Date, region: Region): string {
  const { year, monthDay } = formatDateForApi(date);
  return `${API_BASE_URL}/${year}/${monthDay}_${region}.json`;
}

export async function fetchPrices(date: Date, region: Region): Promise<PricePoint[]> {
  const url = buildPriceUrl(date, region);
  const response = await fetch(url, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Kunne ikke hente priser (${response.status})`);
  }

  const json = (await response.json()) as ApiPriceEntry[];

  if (!Array.isArray(json)) {
    throw new Error("API svarede med et ugyldigt format");
  }

  return json
    .filter((entry) => Number.isFinite(entry.DKK_per_kWh))
    .map((entry) => ({
      dkkPerKwh: entry.DKK_per_kWh,
      timeStart: entry.time_start,
      timeEnd: entry.time_end,
    }));
}
