export type DepositMode = "publicAddress" | "wallet";

export const DEPOSIT_MODE_OPTIONS: ReadonlyArray<{
  id: DepositMode;
  labelKey: string;
}> = [
  { id: "wallet", labelKey: "modeFromWallet" },
  { id: "publicAddress", labelKey: "modePublicAddress" },
];
