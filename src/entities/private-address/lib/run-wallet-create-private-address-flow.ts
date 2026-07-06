import type { Dispatch, UnknownAction } from "@reduxjs/toolkit";
import { createPrivateAddressFromWalletSignature } from "./create-private-address-from-wallet-signature";
import { isSignMessageUnsupportedError } from "@/shared/lib/wallet/sign-message-errors";
import type { PrivateAddressState } from "../model/types";

export type CreatePrivateAddressStatus =
  | "idle"
  | "pending"
  | "success"
  | "error";

export type CreatePrivateAddressErrorKind =
  | "unsupported_sign_message"
  | "unknown";

type RunWalletCreateParameters = {
  dispatch: Dispatch<UnknownAction>;
  getState: () => { privateAddress: PrivateAddressState };
  publicKey: string;
  trimmedNonce: string;
  setStatus: (value: CreatePrivateAddressStatus) => void;
  setErrorKind: (value: CreatePrivateAddressErrorKind | undefined) => void;
};

export async function runWalletCreatePrivateAddressFlow(
  parameters: RunWalletCreateParameters,
): Promise<void> {
  const { dispatch, getState, publicKey, trimmedNonce, setStatus, setErrorKind } =
    parameters;
  setStatus("pending");
  setErrorKind(undefined);
  try {
    await createPrivateAddressFromWalletSignature({
      dispatch,
      getState,
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
    throw error;
  }
}
