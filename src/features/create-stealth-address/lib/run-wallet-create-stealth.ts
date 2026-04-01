import type { AppDispatch } from "@/app/store";
import { createStealthAddressFromWalletSignature } from "./create-stealth-address-flow";
import { isSignMessageUnsupportedError } from "./sign-message-errors";

type CreateStealthStatus = "idle" | "pending" | "success" | "error";

type CreateStealthErrorKind = "unsupported_sign_message" | "unknown";

type RunWalletCreateParameters = {
  dispatch: AppDispatch;
  publicKey: string;
  trimmedNonce: string;
  setStatus: (value: CreateStealthStatus) => void;
  setErrorKind: (value: CreateStealthErrorKind | undefined) => void;
};

export async function runWalletCreateStealthFlow(
  parameters: RunWalletCreateParameters,
): Promise<void> {
  const { dispatch, publicKey, trimmedNonce, setStatus, setErrorKind } =
    parameters;
  setStatus("pending");
  setErrorKind(undefined);
  try {
    await createStealthAddressFromWalletSignature({
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
