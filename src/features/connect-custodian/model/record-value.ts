export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && Boolean(value) && !Array.isArray(value);
}
