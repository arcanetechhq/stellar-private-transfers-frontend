import { createContext, useContext } from "react";
import type { Horizon } from "@stellar/stellar-sdk";

export interface StellarContextValue {
  server: Horizon.Server;
  signAndSubmitTransaction: (xdr: string, publicKey: string) => Promise<void>;
}

export const StellarContext = createContext<StellarContextValue | undefined>(
  undefined,
);

export function useStellar(): StellarContextValue {
  const context = useContext(StellarContext);
  if (context === undefined) {
    throw new Error("useStellar must be used within StellarProvider");
  }
  return context;
}
