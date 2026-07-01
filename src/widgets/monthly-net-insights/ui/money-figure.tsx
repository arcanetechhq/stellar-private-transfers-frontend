type MoneyFigureProperties = {
  value: string;
  size?: "md" | "hero";
  tone?: "default" | "positive" | "danger" | "muted";
};

export function MoneyFigure({
  value,
  size = "md",
  tone = "default",
}: MoneyFigureProperties) {
  const match = value.match(/^([+-]?)(.+?)(\.\d{2})$/);
  const sign = match?.[1] ?? "";
  const whole = match ? `${sign}${match[2]}` : value;
  const cents = match?.[3];

  return (
    <span className="money-figure" data-size={size} data-tone={tone}>
      <span>{whole}</span>
      {cents ? <span className="money-figure__cents">{cents}</span> : null}
    </span>
  );
}
