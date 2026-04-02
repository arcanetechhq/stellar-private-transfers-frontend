import React, { useMemo } from "react";
import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit";
import { TransactionBuilder } from "@stellar/stellar-sdk";
import { horizonServer, STELLAR_NETWORK_PASSPHRASE } from "./horizon-server";
import { StellarContext } from "./stellar-context";

interface StellarProviderProperties {
  children: React.ReactNode;
}

export function StellarProvider({ children }: StellarProviderProperties) {
  const value = useMemo(
    () => ({
      server: horizonServer,
      signAndSubmitTransaction: async (
        xdr: string,
        publicKey: string,
      ): Promise<void> => {
        const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, {
          networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
          address: publicKey,
        });
        const transaction = TransactionBuilder.fromXDR(
          signedTxXdr,
          STELLAR_NETWORK_PASSPHRASE,
        );
        await horizonServer.submitTransaction(transaction);
      },
    }),
    [],
  );

  return (
    <StellarContext.Provider value={value}>{children}</StellarContext.Provider>
  );
}
