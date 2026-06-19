import type { AppDispatch } from "@/store";
import {
  createPrivateAddressFromWalletSignature,
  isSignMessageUnsupportedError,
} from "@/features/create-private-address";

type CreatePrivateAddressStatus = "idle" | "pending" | "success" | "error";

type CreatePrivateAddressErrorKind = "unsupported_sign_message" | "unknown";

type RunWalletCreateParameters = {
  dispatch: AppDispatch;
  publicKey: string;
  trimmedNonce: string;
  setStatus: (value: CreatePrivateAddressStatus) => void;
  setErrorKind: (value: CreatePrivateAddressErrorKind | undefined) => void;
};

export async function runWalletCreatePrivateAddressFlow(
  parameters: RunWalletCreateParameters,
): Promise<void> {
  const { dispatch, publicKey, trimmedNonce, setStatus, setErrorKind } =
    parameters;
  setStatus("pending");
  setErrorKind(undefined);
  try {
    await createPrivateAddressFromWalletSignature({
      dispatch,
      publicKey,
      trimmedNonce,
    });
    setStatus("success");
  } catch (error) {
    console.error(error);
    setErrorKind(
      isSignMessageUnsupportedError(error)
        ? "unsupported_sign_message"
        : "unknown",
    );
    setStatus("error");
  }
}
