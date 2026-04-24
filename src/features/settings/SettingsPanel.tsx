"use client";

import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import type { AppSettings, Region } from "@/types/prices";

type SettingsPanelProps = {
  settings: AppSettings;
  onChange: (next: AppSettings) => void;
  showHeading?: boolean;
};

export function SettingsPanel({ settings, onChange, showHeading = true }: SettingsPanelProps) {
  return (
    <div className="settings-content">
      {showHeading ? <h3>Indstillinger</h3> : null}
      <ToggleSwitch
        label="Priser inkl. moms"
        checked={settings.includeVat}
        onChange={(includeVat) => onChange({ ...settings, includeVat })}
      />
      <ToggleSwitch
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