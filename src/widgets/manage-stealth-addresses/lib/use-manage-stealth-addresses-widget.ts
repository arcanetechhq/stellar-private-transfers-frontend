import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/app/hooks";
import {
  DEFAULT_STEALTH_SIGN_NONCE,
  useCreateStealthAddress,
} from "@/features/create-stealth-address";
import { selectStealthState } from "@/entities/stealth-address";
import { selectWalletPublicKey } from "@/entities/wallet";
import { useViewingNonceState } from "./use-viewing-nonce-state";

export function useManageStealthAddressesWidget() {
  const { t: translate } = useTranslation("stealth");
  const publicKey = useAppSelector(selectWalletPublicKey);
  const walletConnected = Boolean(publicKey);
  const { byNonce, defaultNonce } = useAppSelector(selectStealthState);
  const { create, status, errorKind, reset } = useCreateStealthAddress(publicKey);

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
    await create(DEFAULT_STEALTH_SIGN_NONCE);
    setViewingNonce(DEFAULT_STEALTH_SIGN_NONCE);
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
