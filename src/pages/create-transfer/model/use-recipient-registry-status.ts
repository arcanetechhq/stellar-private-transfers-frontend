import { useEffect, useState } from "react";
import { usePrivacySdkClient } from "@/app/providers/privacy-sdk-provider";
import { isValidStellarPublicAddress } from "@/shared/lib/stellar/is-valid-stellar-public-address";
import type { RecipientRegistryStatus } from "./recipient-registry-status";

const RECIPIENT_LOOKUP_DEBOUNCE_MS = 400;

export type { RecipientRegistryStatus } from "./recipient-registry-status";

export function useRecipientRegistryStatus(parameters: {
  recipient: string;
  walletPublicKey: string | undefined;
}): RecipientRegistryStatus {
  const [status, setStatus] = useState<RecipientRegistryStatus>("idle");
  const { client, ready } = usePrivacySdkClient();
  const recipientTrim = parameters.recipient.trim();
  const walletPublicKey = parameters.walletPublicKey?.trim() ?? "";
  const recipientValid = isValidStellarPublicAddress(recipientTrim);
  const recipientDiffersFromSender =
    recipientTrim.length > 0 &&
    walletPublicKey.length > 0 &&
    recipientTrim !== walletPublicKey;
  const shouldLookup =
    recipientValid && recipientDiffersFromSender && ready && Boolean(client);

  useEffect(() => {
    if (!shouldLookup || !client) {
      setStatus("idle");
      return;
    }

    setStatus("checking");
    let cancelled = false;
    const timeoutId = globalThis.setTimeout(() => {
      void (async () => {
        try {
          const lookup = await client.checkRegistrationStatus({
            address: recipientTrim,
            walletPublicKey,
          });
          if (cancelled) {
            return;
          }
          setStatus(
            lookup.status === "registered" ? "registered" : "unregistered",
          );
        } catch {
          if (!cancelled) {
            setStatus("lookup_failed");
          }
        }
      })();
    }, RECIPIENT_LOOKUP_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      globalThis.clearTimeout(timeoutId);
    };
  }, [client, recipientTrim, shouldLookup, walletPublicKey]);

  return status;
}
