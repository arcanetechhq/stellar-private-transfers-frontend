function normalizeBalanceInput(raw: string): string {
  return raw.replaceAll(",", "").trim();
}

export function parseTransferBalance(raw: string | undefined): number {
  if (!raw) {
    return 0;
  }
  const value = Number.parseFloat(normalizeBalanceInput(raw));
  return Number.isNaN(value) ? 0 : value;
}

export function formatTransferBalance(raw: string | undefined): string {
  if (raw === undefined) {
    return "—";
  }
  const normalized = normalizeBalanceInput(raw);
  if (normalized.length === 0) {
    return "—";
  }
  const value = Number.parseFloat(normalized);
  if (Number.isNaN(value)) {
    return raw;
  }
  if (value === 0) {
    return "0";
  }
  if (value < 1) {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    });
  }
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatTransferBalanceWithTicker(
  raw: string | undefined,
  ticker: string,
): string {
  const formatted = formatTransferBalance(raw);
  if (formatted === "—") {
    return formatted;
  }
  const code = ticker.trim().toUpperCase();
  return code ? `${formatted} ${code}` : formatted;
}
