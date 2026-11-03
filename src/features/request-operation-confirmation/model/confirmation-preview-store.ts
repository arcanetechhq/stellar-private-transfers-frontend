import { useSyncExternalStore } from "react";
import type { ConfirmationPreview } from "../api/operation-confirmation-api";

export type PublishedConfirmation = {
  busy: boolean;
  error: boolean;
  preview?: ConfirmationPreview;
};

const listeners = new Set<() => void>();
let published: PublishedConfirmation = { busy: false, error: false };
let generation = 0;

export function beginPublishedConfirmation(): number {
  generation += 1;
  publishConfirmation(generation, { busy: true, error: false });
  return generation;
}

export function publishConfirmation(
  token: number,
  next: PublishedConfirmation,
): void {
  if (token !== generation) {
    return;
  }
  published = next;
  for (const listener of listeners) {
    listener();
  }
}

export function usePublishedConfirmation(): PublishedConfirmation {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    () => published,
    () => published,
  );
}
