import React, { type ReactNode, useEffect } from "react";
import { Provider } from "react-redux";
import { store, useAppDispatch } from "@/store";
import { syncWalletAddressFromKit } from "@/features/stellar-wallet-connect";

function StellarWalletSync() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    void dispatch(syncWalletAddressFromKit());
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
