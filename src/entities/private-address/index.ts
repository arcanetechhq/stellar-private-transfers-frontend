export type {
  PrivateAddressState,
  PrivateAddressNonceEntry,
  PrivateAddressPersistedNonceEntry,
  PrivateAddressPersistedShape,
} from "./model/types";
export {
  selectAllPrivateAddressNonces,
  selectDefaultNonce,
  selectNonceByPrivateAddress,
  selectScalarByNonce,
  selectScalarByPrivateAddress,
  selectPrivateAddressByNonce,
  selectPrivateAddressState,
} from "./model/private-address-selectors";
export type { PrivateAddressRootState } from "./model/private-address-selectors";
export {
  loadPrivateAddressState,
  readPrivateAddressRecordFromStorage,
} from "./lib/persist-private-address";
export {
  ensurePrivateAddressScalarForNonce,
  type EnsureScalarResult,
} from "./lib/ensure-private-address-scalar-for-nonce";
export { createPrivateAddressFromWalletSignature } from "./lib/create-private-address-from-wallet-signature";
export {
  runWalletCreatePrivateAddressFlow,
  type CreatePrivateAddressErrorKind,
  type CreatePrivateAddressStatus,
} from "./lib/run-wallet-create-private-address-flow";
export { isValidPrivateAddressString } from "@/shared/lib/private-address/validate-private-address";
export { PrivateAddressDisplay } from "./ui/private-address-display";
