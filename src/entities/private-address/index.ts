export {
  clearScalars,
  hydrateFromStorage,
  resetForWalletChange,
  setDefaultNonce,
  setScalarForNonce,
  setPrivateAddressRecord,
  setPrivateAddressRecordAndScalar,
  privateAddressReducer,
  selectAllPrivateAddressNonces,
  selectDefaultNonce,
  selectNonceByPrivateAddress,
  selectScalarByNonce,
  selectScalarByPrivateAddress,
  selectPrivateAddressByNonce,
  selectPrivateAddressState,
} from "./model/private-address";
export type { PrivateAddressRootState } from "./model/private-address";
export type {
  PrivateAddressState,
  PrivateAddressNonceEntry,
  PrivateAddressPersistedNonceEntry,
  PrivateAddressPersistedShape,
} from "./model/types";
export {
  buildPrivateAddressPersistPayload,
  loadPrivateAddressState,
  readPrivateAddressRecordFromStorage,
  savePrivateAddressState,
} from "./lib/persist-private-address";
export {
  ensurePrivateAddressScalarForNonce,
  type EnsureScalarResult,
} from "./lib/ensure-private-address-scalar-for-nonce";
export { isValidPrivateAddressString } from "@/shared/lib/private-address/validate-private-address";
export { PrivateAddressDisplay } from "./ui/private-address-display";
