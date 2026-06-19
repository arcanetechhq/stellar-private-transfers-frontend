export { createPrivateAddressFromWalletSignature } from "./lib/create-private-address-flow";
export {
  errorToMessage,
  isSignMessageUnsupportedError,
} from "./lib/sign-message-errors";
export { runWalletCreatePrivateAddressFlow } from "./lib/run-wallet-create-private-address";
export type { EnsureScalarResult } from "@/entities/private-address";
export { ensurePrivateAddressScalarForNonce } from "@/entities/private-address";
export { useCreatePrivateAddress } from "./api/use-create-private-address";
export { DEFAULT_PRIVATE_ADDRESS_SIGN_NONCE } from "@/shared/lib/private-address/privacy-pool-sdk-private-address";
export type {
  CreatePrivateAddressErrorKind,
  CreatePrivateAddressStatus,
} from "./api/use-create-private-address";
export { useEnsurePrivateAddressScalar } from "./api/use-ensure-private-address-scalar";
