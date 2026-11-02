import type { ConfirmationPeriodKind } from "../model/confirmation-period";
import { CONFIRMATION_PERIODS } from "../model/confirmation-period";

type PeriodPickerProperties = {
  label: string;
  kind: ConfirmationPeriodKind;
  labels: Record<ConfirmationPeriodKind, string>;
  onChange: (kind: ConfirmationPeriodKind) => void;
};

export function PeriodPicker(properties: PeriodPickerProperties) {
  return (
    <div className="export-period">
      <span className="export-period__label">{properties.label}</span>
      <div
        className="export-period__options"
        role="tablist"
        aria-label={properties.label}
      >
        {CONFIRMATION_PERIODS.map((period) => (
          <button
            type="button"
            className="export-period__button"
            data-active={properties.kind === period}
            key={period}
            onClick={() => properties.onChange(period)}
            role="tab"
            aria-selected={properties.kind === period}
          >
            {properties.labels[period]}
          </button>
        ))}
      </div>
    </div>
  );
}
