import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import { defaultModules } from "@creit-tech/stellar-wallets-kit/modules/utils";
import { Networks, SwkAppDarkTheme } from "@creit-tech/stellar-wallets-kit/types";

StellarWalletsKit.init({
  network: Networks.TESTNET,
  modules: defaultModules(),
  theme: SwkAppDarkTheme,
});
