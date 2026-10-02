export function normalizePrivateDataOrigin(
  origin: string | undefined,
): string | undefined {
  const trimmed = origin?.trim().replace(/\/$/u, "");
  return trimmed ? trimmed : undefined;
}
