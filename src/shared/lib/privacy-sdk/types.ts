import type { PrivacyPoolService } from "@arcane/privacy-sdk-stellar/transact";

export type CoinData = Awaited<
  ReturnType<PrivacyPoolService["createAlignedShieldCoinData"]>
>["coin"];

export type StateFile = {
  commitments: string[];
};

export type KytApplicationIdHints = [string, string, string, string];
