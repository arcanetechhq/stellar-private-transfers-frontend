let pendingResumeError: unknown;
const listeners = new Set<(error: unknown) => void>();

export function publishCustodianResumeFailure(error: unknown): void {
  pendingResumeError = error;
  for (const listener of listeners) {
    listener(error);
  }
}

export function subscribeCustodianResumeFailure(
  listener: (error: unknown) => void,
): () => void {
  listeners.add(listener);
  if (pendingResumeError !== undefined) {
    listener(pendingResumeError);
  }
  return () => {
    listeners.delete(listener);
  };
}
