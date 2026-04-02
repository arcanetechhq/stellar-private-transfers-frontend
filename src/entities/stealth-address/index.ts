export {
  clearScalars,
  hydrateFromStorage,
  resetForWalletChange,
  setDefaultNonce,
  setScalarForNonce,
  setStealthRecord,
  stealthAddressReducer,
  selectAllStealthNonces,
  selectDefaultNonce,
  selectScalarByNonce,
  selectStealthByNonce,
  selectStealthState,
} from "./model/stealth-address";
export type { StealthAddressRootState } from "./model/stealth-address";
export type {
  StealthAddressState,
  StealthNonceEntry,
  StealthPersistedNonceEntry,
  StealthPersistedShape,
} from "./model/types";
export {
  buildStealthPersistPayload,
  loadStealthState,
  readStealthRecordFromStorage,
  saveStealthState,
} from "./lib/persist-stealth";
export { isValidStealthAddressString } from "@/shared/lib/stealth/validate-stealth-address";
export { StealthAddressDisplay } from "./ui/stealth-address-display";
