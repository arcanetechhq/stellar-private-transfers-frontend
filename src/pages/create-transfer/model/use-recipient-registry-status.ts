import { useEffect, useState } from "react";
import { lookupRecipientPrivateAddress } from "@/shared/lib/registry/registry-lookup";
import {
  getDefaultStellarNetworkConfig,
  getRequiredPrivateAddressRegistryContractId,
} from "@/shared/stellar/stellar-network-environment";
import { isValidStellarPublicAddress } from "@/shared/lib/stellar/is-valid-stellar-public-address";

const RECIPIENT_LOOKUP_DEBOUNCE_MS = 400;

export type RecipientRegistryStatus =
  | "idle"
  | "checking"
  | "registered"
  | "unregistered"
  | "lookup_failed";

export function useRecipientRegistryStatus(parameters: {
  recipient: string;
  walletPublicKey: string | undefined;
}): RecipientRegistryStatus {
  const [status, setStatus] = useState<RecipientRegistryStatus>("idle");
  const recipientTrim = parameters.recipient.trim();
  const walletPublicKey = parameters.walletPublicKey?.trim() ?? "";
  const recipientValid = isValidStellarPublicAddress(recipientTrim);
  const recipientDiffersFromSender =
    recipientTrim.length > 0 &&
    walletPublicKey.length > 0 &&
    recipientTrim !== walletPublicKey;
  const shouldLookup = recipientValid && recipientDiffersFromSender;

  useEffect(() => {
    if (!shouldLookup) {
      setStatus("idle");
      return;
    }

    let cancelled = false;
    const timeoutId = globalThis.setTimeout(() => {
      void (async () => {
        setStatus("checking");
        try {
          const { networkPassphrase, sorobanRpcUrl } =
            getDefaultStellarNetworkConfig();
          const lookup = await lookupRecipientPrivateAddress({
            registryContractId: getRequiredPrivateAddressRegistryContractId(),
            recipientStellarAddress: recipientTrim,
            walletPublicKey,
            networkPassphrase,
            sorobanRpcUrl,
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
  }, [recipientTrim, shouldLookup, walletPublicKey]);

  return status;
}
