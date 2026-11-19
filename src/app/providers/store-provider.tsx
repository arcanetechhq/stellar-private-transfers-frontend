import React, { type ReactNode, useEffect } from "react";
import { Provider } from "react-redux";
import { setWalletKitLoaded } from "@/entities/wallet";
import { installCustodianSessionPort } from "@/features/connect-custodian";
import { syncWalletAddressFromKit } from "@/features/stellar-wallet-connect";
import { custodianSessionPort } from "@/entities/wallet";
import { store, useAppDispatch, type AppDispatch } from "@/store";

installCustodianSessionPort();

async function restoreOrSyncWallet(dispatch: AppDispatch): Promise<void> {
  if (!custodianSessionPort().hasSelection()) {
    await dispatch(syncWalletAddressFromKit());
    return;
  }
  dispatch(setWalletKitLoaded());
  const outcome = await custodianSessionPort().resume(dispatch);
  if (outcome === "absent") {
    await dispatch(syncWalletAddressFromKit());
  }
}

function StellarWalletSync() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    void restoreOrSyncWallet(dispatch);
  }, [dispatch]);
  return <></>;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <StellarWalletSync />
      {children}
    </Provider>
  );
}
