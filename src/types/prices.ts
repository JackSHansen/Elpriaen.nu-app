export type Region = "DK1" | "DK2";

export type PricePoint = {
  dkkPerKwh: number;
  timeStart: string;
  timeEnd: string;
};

export type MobileTab = "oversigt" | "lige-nu" | "historik" | "indstillinger";

export type AppSettings = {
  includeVat: boolean;
  notificationsEnabled: boolean;
  region: Region;
};
