import { createContext, useContext } from "react";

export type WalletRegistryStatus =
  | "checking"
  | "active"
  | "unregistered"
  | "lookup_failed";

export type WalletPrivateAddressContextValue = {
  registryStatus: WalletRegistryStatus;
  isRegistryLoading: boolean;
  actionsEnabled: boolean;
  privateAddressStpl1: string;
  scalarHex: string;
  defaultNonce: string | undefined;
  refreshRegistryStatus: () => Promise<void>;
  ensureWalletPrivateAddress: () => Promise<string>;
  ensureWalletScalar: () => Promise<string>;
  registryRegistrationModalOpen: boolean;
  canOpenRegistryRegistration: boolean;
  openRegistryRegistrationModal: () => void;
  closeRegistryRegistrationModal: () => void;
};

export const WalletPrivateAddressContext =
  createContext<WalletPrivateAddressContextValue | undefined>(undefined);

export function useWalletPrivateAddress(): WalletPrivateAddressContextValue {
  const context = useContext(WalletPrivateAddressContext);
  if (!context) {
    throw new Error(
      "useWalletPrivateAddress must be used within WalletPrivateAddressProvider",
    );
  }
  return context;
}
