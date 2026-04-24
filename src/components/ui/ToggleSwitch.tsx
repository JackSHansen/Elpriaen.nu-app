"use client";

type ToggleSwitchProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
};

export function ToggleSwitch({ checked, onChange, label }: ToggleSwitchProps) {
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