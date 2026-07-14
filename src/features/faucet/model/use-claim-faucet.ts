import { useCallback } from "react";
import { useAppDispatch } from "@/store";
import {
  claimIssuedAssetThunk,
  claimNativeFaucetThunk,
} from "./header-faucet-thunks";

interface ClaimNativeInput {
  publicKey: string;
  assetId: string;
}

interface ClaimIssuedInput {
  publicKey: string;
  assetId: string;
  assetCode: string;
  issuerAddress?: string;
  ensureTrustline?: boolean;
}

export function useClaimFaucet() {
  const dispatch = useAppDispatch();

  const claimNative = useCallback(
    (input: ClaimNativeInput) =>
      dispatch(claimNativeFaucetThunk(input)).unwrap(),
    [dispatch],
  );

  const claimIssued = useCallback(
    (input: ClaimIssuedInput) =>
      dispatch(claimIssuedAssetThunk(input)).unwrap(),
    [dispatch],
  );

  return { claimNative, claimIssued };
}
