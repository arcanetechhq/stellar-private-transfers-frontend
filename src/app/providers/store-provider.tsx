import React, { type ReactNode, useEffect } from "react";
import { Provider } from "react-redux";
import { useAppDispatch } from "@/app/hooks";
import { syncWalletAddressFromKit } from "@/features/stellar-wallet-connect";
import { store } from "../store";

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
