export function formatWithdrawalAmount(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  });
}

function normalizeNumericInput(raw: string): string {
  return raw.replaceAll(",", "").trim();
}

export function parseWithdrawalBalance(raw: string | undefined): number {
  if (!raw) {
    return 0;
  }
  const value = Number.parseFloat(normalizeNumericInput(raw));
  return Number.isNaN(value) ? 0 : value;
}

export function parseWithdrawalAmountInput(raw: string | undefined): number {
  return parseWithdrawalBalance(raw);
}

export function formatWithdrawalBalanceWithTicker(
  raw: string | undefined,
  ticker: string,
): string {
  const normalized = normalizeNumericInput(raw ?? "");
  if (normalized.length === 0) {
    return "—";
  }
  const value = Number.parseFloat(normalized);
  if (Number.isNaN(value)) {
    return raw ?? "—";
  }
  const formatted =
    value === 0
      ? "0"
      : value < 1
        ? value.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 8,
          })
        : value.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
  const code = ticker.trim().toUpperCase();
  return code ? `${formatted} ${code}` : formatted;
}
