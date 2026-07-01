import { PeriodSelect } from "@/shared/ui/period-select";
import type { MonthlyNetPeriod } from "../model/monthly-net-period";

type MonthlyNetPeriodSelectProperties = {
  value: MonthlyNetPeriod;
  options: Array<{ value: MonthlyNetPeriod; label: string }>;
  onChange: (value: MonthlyNetPeriod) => void;
};

export function MonthlyNetPeriodSelect({
  value,
  options,
  onChange,
}: MonthlyNetPeriodSelectProperties) {
  return (
    <PeriodSelect value={value} options={options} onChange={onChange} />
  );
}
