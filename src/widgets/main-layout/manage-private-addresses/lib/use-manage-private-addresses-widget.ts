import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store";
import {
  DEFAULT_PRIVATE_ADDRESS_SIGN_NONCE,
  useCreatePrivateAddress,
} from "@/features/create-private-address";
import { selectPrivateAddressState } from "@/entities/private-address";
import { selectWalletPublicKey } from "@/entities/wallet";
import { useViewingNonceState } from "./use-viewing-nonce-state";

export function useManagePrivateAddressesWidget() {
  const { t: translate } = useTranslation("privateAddress");
  const publicKey = useAppSelector(selectWalletPublicKey);
  const walletConnected = Boolean(publicKey);
  const { byNonce, defaultNonce } = useAppSelector(selectPrivateAddressState);
  const { create, status, errorKind, reset } = useCreatePrivateAddress(publicKey);

  const nonces = useMemo(
    () => Object.keys(byNonce).toSorted(),
    [byNonce],
  );

  const { setViewingNonce, normalizedNonce } = useViewingNonceState(
    defaultNonce,
    nonces,
  );

  const [newNonceLabel, setNewNonceLabel] = useState("");

  const displayedEntry = normalizedNonce
    ? byNonce[normalizedNonce]
    : undefined;

  const handleCreate = async () => {
    if (!walletConnected) {
      return;
    }
    const trimmed = newNonceLabel.trim();
    if (!trimmed) {
      return;
    }
    await create(trimmed);
    setNewNonceLabel("");
    setViewingNonce(trimmed);
  };

  const handleCreateDefault = async () => {
    if (!walletConnected) {
      return;
    }
    await create(DEFAULT_PRIVATE_ADDRESS_SIGN_NONCE);
    setViewingNonce(DEFAULT_PRIVATE_ADDRESS_SIGN_NONCE);
  };

  return {
    translate,
    publicKey,
    walletConnected,
    byNonce,
    defaultNonce,
    nonces,
    create,
    status,
    errorKind,
    reset,
    normalizedNonce,
    displayedEntry,
    setViewingNonce,
    newNonceLabel,
    setNewNonceLabel,
    handleCreate,
    handleCreateDefault,
  };
}
