export function readClientEnvironment(name: string): string | undefined {
  const value = (
    import.meta as ImportMeta & { env?: Record<string, string | undefined> }
  ).env?.[name];
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}
