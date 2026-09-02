import type { StellarPreparedOperation } from "@arcanetech/privacy-sdk-stellar";
import type {
  RelayTransactPackageV1,
} from "@arcanetech/privacy-sdk-stellar/transact";
import {
  prepareRelayTransactPackageFromPrepared,
  readRelayTransactSupportedProfile,
} from "@arcanetech/privacy-sdk-stellar/transact";
import { readZkConfigNonceFromEnvironment } from "@/shared/lib/privacy-sdk/build-transact-environment.js";
import { getRequiredPrivacyPoolContractId } from "@/shared/stellar/stellar-network-environment.js";
import type { RelayPackageJson } from "./types.js";

export function serializeRelayPackage(
  prepared: RelayTransactPackageV1,
): RelayPackageJson {
  const body: RelayPackageJson = {
    version: prepared.version,
    poolSelector: prepared.poolSelector,
    zkConfigNonce: prepared.zkConfigNonce.toString(),
    proofBytes: prepared.proofBytes,
    publicSignals: prepared.publicSignals,
    applicationIdHints: prepared.applicationIdHints,
  };
  if (prepared.escrowRecipient !== undefined) {
    body.escrowRecipient = prepared.escrowRecipient;
  }
  if (prepared.keyVersionHints) {
    body.keyVersionHints = prepared.keyVersionHints;
  }
  return body;
}

export function inspectPreparedRelayPackage(prepared: StellarPreparedOperation): {
  relayPackage: RelayPackageJson;
  publicDepositAmount: string;
} {
  const relayPackage = serializeRelayPackage(
    prepareRelayTransactPackageFromPrepared({
      prepared,
      poolSelector: getRequiredPrivacyPoolContractId(),
      zkConfigNonce: readZkConfigNonceFromEnvironment(),
    }),
  );
  const profile = readRelayTransactSupportedProfile({
    ...relayPackage,
    zkConfigNonce: BigInt(relayPackage.zkConfigNonce),
  });
  return {
    relayPackage,
    publicDepositAmount: profile.publicLegContext.publicDepositAmount,
  };
}
