export function readClientEnvironment(name: string): string | undefined {
  const value = (
    import.meta as ImportMeta & { env?: Record<string, string | undefined> }
  ).env?.[name];
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }
  if (/^__STAND_[A-Z0-9_]+__$/.test(trimmed)) {
    return undefined;
  }
  return trimmed;
}
