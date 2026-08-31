import { useSyncExternalStore } from "react";
import {
  getPrivacySdkBootstrapErrorSnapshot,
  subscribePrivacySdkBootstrapError,
} from "@/shared/lib/privacy-sdk/transact-context.js";

export function usePrivacySdkBootstrapError(): string | undefined {
  return useSyncExternalStore(
    subscribePrivacySdkBootstrapError,
    getPrivacySdkBootstrapErrorSnapshot,
  );
}
