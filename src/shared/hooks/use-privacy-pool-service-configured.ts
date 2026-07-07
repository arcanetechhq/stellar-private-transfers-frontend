import { useSyncExternalStore } from "react";
import {
  getPrivacyPoolServiceConfiguredSnapshot,
  subscribePrivacyPoolServiceConfigured,
} from "@/shared/lib/privacy-sdk/transact-context.js";

export function usePrivacyPoolServiceConfigured(): boolean {
  return useSyncExternalStore(
    subscribePrivacyPoolServiceConfigured,
    getPrivacyPoolServiceConfiguredSnapshot,
    () => false,
  );
}
