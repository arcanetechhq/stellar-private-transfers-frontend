export type DepositMode = "publicAddress" | "wallet";

export const DEPOSIT_MODE_OPTIONS: ReadonlyArray<{
  id: DepositMode;
  labelKey: string;
}> = [
  { id: "publicAddress", labelKey: "modePublicAddress" },
  { id: "wallet", labelKey: "modeFromWallet" },
];
