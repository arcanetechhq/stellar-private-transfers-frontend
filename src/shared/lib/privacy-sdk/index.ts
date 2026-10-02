import {
  buildPoolTransactionAuditParameters as sdkBuildPoolTransactionAuditParameters,
  parseAuditPublicKeyFromEnvHex,
} from "@arcanetech/privacy-sdk-stellar/transact";
import { readPoolApplicationIdFromEnvironment } from "./build-transact-environment.js";
import { getConfiguredPrivacyPoolService } from "./transact-context.js";
import { readClientEnvironment } from "./read-client-environment.js";

export function resolvePoolApplicationId(): string {
  return readPoolApplicationIdFromEnvironment();
}

export function buildPoolTransactionAuditParameters(applicationId?: string) {
  const resolvedApplicationId = applicationId ?? resolvePoolApplicationId();
  const auditKeyRaw = readClientEnvironment("VITE_STELLAR_AUDIT_PUBLIC_KEY");
  return sdkBuildPoolTransactionAuditParameters({
    applicationId: resolvedApplicationId,
    ...(auditKeyRaw
      ? { auditPublicKey: parseAuditPublicKeyFromEnvHex(auditKeyRaw) }
      : {}),
  });
}

export {
  configurePrivacyPoolService,
  createPrivacyPoolService,
  PrivacyPoolService,
  DEFAULT_PRIVATE_ADDRESS_SIGN_NONCE,
  buildPrivateAddressSignMessage,
  buildBlindedRecipientTagChallengeMessage,
  decodePrivateAddress,
  encodePrivateAddress,
  encodePrivateAddressFromHexCoordinates,
  recipientPublicKeysDecimalFromPrivateAddress,
  privateAddressSdk,
  spendScalarHexFromStellarSignature,
  OWNER_BOUND_NOTE_SCHEMA_VERSION,
  prepareConfidentialTransferProof,
  prepareConfidentialTransferProofDual,
  requestKytPassageForPoolInteraction,
  MIN_CONFIDENTIAL_TRANSFER_STROOPS,
  ZERO_STROOPS,
  assetLegToTokenAddress,
  tokenAddressToAssetLeg,
  frDecimalToPaddedBytes32,
  runTtlPreflight,
} from "@arcanetech/privacy-sdk-stellar/transact";

export type {
  KytApplicationIdHints,
  RequestKytPassageForPoolInteractionInput,
  SpendScalarDomain,
  StellarTransactEnvironment,
} from "@arcanetech/privacy-sdk-stellar/transact";

export { buildStellarTransactEnvironment } from "./build-transact-environment.js";
export {
  clearPrivacyTransactContext,
  getConfiguredPrivacyPoolService,
  getPrivacySdkClientOrThrow,
  getPrivacyTransactEnvironment,
  setPrivacyPoolService,
  setPrivacySdkBootstrapError,
  setPrivacyTransactContext,
  tryGetPrivacySdkClient,
} from "./transact-context.js";
export {
  formatKytRejectionMessage,
  formatKytRejectionTitle,
  KytInspectError,
  mapPrivacySdkError,
  parseKytReasonCode,
} from "./map-privacy-sdk-errors.js";
export type { CoinData, StateFile } from "./types.js";

export { getConfiguredPrivacyPoolService as getPrivacyPoolService } from "./transact-context.js";

export function privacyPoolService() {
  return getConfiguredPrivacyPoolService();
}
