export type DepositAddressMode = "address" | "privateAddress";

export type DepositMode = DepositAddressMode | "wallet";

export const DEPOSIT_MODE_OPTIONS: ReadonlyArray<{
  id: DepositMode;
  labelKey: string;
}> = [
  { id: "address", labelKey: "modePublicAddress" },
  { id: "privateAddress", labelKey: "modePrivateAddress" },
  { id: "wallet", labelKey: "modeFromWallet" },
];
