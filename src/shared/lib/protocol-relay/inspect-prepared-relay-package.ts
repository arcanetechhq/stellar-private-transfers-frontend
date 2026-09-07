import type { StellarPreparedOperation } from "@arcanetech/privacy-sdk-stellar";
import { prepareRelayTransactPackageFromPrepared } from "@arcanetech/privacy-sdk-stellar/transact";
import { serializeRelayPackage } from "@arcanetech/privacy-sdk-relay";
import { resolveZkConfigNonceFromEnvironment } from "@/shared/lib/privacy-sdk/build-transact-environment.js";
import { getRequiredPrivacyPoolContractId } from "@/shared/stellar/stellar-network-environment.js";
import type { RelayPackageJson } from "./types.js";

export function inspectPreparedRelayPackage(
  prepared: StellarPreparedOperation,
): RelayPackageJson {
  return serializeRelayPackage(
    prepareRelayTransactPackageFromPrepared({
      prepared,
      poolSelector: getRequiredPrivacyPoolContractId(),
      zkConfigNonce: resolveZkConfigNonceFromEnvironment(),
    }),
  );
}
