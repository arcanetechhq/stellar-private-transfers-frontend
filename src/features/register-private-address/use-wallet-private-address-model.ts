import { useCallback } from "react";
import { useStore } from "react-redux";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectDefaultNonce,
  selectPrivateAddressByNonce,
  selectScalarByNonce,
} from "@/entities/private-address";
import { selectWalletPublicKey } from "@/entities/wallet";
import { DEFAULT_PRIVATE_ADDRESS_SIGN_NONCE } from "@/shared/lib/private-address/privacy-pool-sdk-private-address";
import { ensureWalletPrivateAddressRecord } from "./ensure-wallet-private-address";
import { ensureWalletScalarRecord } from "./ensure-wallet-scalar-record";

export function useWalletPrivateAddressModel() {
  const dispatch = useAppDispatch();
  const store = useStore();
  const publicKey = useAppSelector(selectWalletPublicKey);
  const defaultNonce =
    useAppSelector(selectDefaultNonce) ?? DEFAULT_PRIVATE_ADDRESS_SIGN_NONCE;
  const privateAddressEntry = useAppSelector(
    selectPrivateAddressByNonce(defaultNonce),
  );
  const scalarHex = useAppSelector(selectScalarByNonce(defaultNonce)) ?? "";

  const ensureWalletPrivateAddress = useCallback(async () => {
    const trimmedPublicKey = publicKey?.trim();
    if (!trimmedPublicKey) {
      throw new Error("Wallet is not connected");
    }
    return ensureWalletPrivateAddressRecord({
      dispatch,
      publicKey: trimmedPublicKey,
      nonce: defaultNonce,
    });
  }, [publicKey, dispatch, defaultNonce]);

  const ensureWalletScalar = useCallback(async () => {
    const trimmedPublicKey = publicKey?.trim();
    if (!trimmedPublicKey) {
      throw new Error("Wallet is not connected");
    }
    return ensureWalletScalarRecord({
      dispatch,
      getState: store.getState,
      publicKey: trimmedPublicKey,
      defaultNonce,
    });
  }, [publicKey, dispatch, defaultNonce, store]);

  return {
    privateAddressStpl1: privateAddressEntry?.privateAddress?.trim() ?? "",
    scalarHex: scalarHex.trim(),
    defaultNonce,
    ensureWalletPrivateAddress,
    ensureWalletScalar,
  };
}
