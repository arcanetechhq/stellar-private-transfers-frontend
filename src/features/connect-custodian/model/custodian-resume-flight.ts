import { useSyncExternalStore } from "react";

let resumeInFlight = 0;
const listeners = new Set<() => void>();

function publish(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function beginCustodianResume(): void {
  resumeInFlight += 1;
  publish();
}

export function endCustodianResume(): void {
  resumeInFlight = Math.max(0, resumeInFlight - 1);
  publish();
}

export function useCustodianResumeInFlight(): boolean {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    () => resumeInFlight > 0,
    () => false,
  );
}
