import { StellarWalletsKit } from "@creit-tech/stellar-wallets-kit/sdk";
import { Networks, SwkAppDarkTheme } from "@creit-tech/stellar-wallets-kit/types";
import { DirectFreighterModule } from "./stellar-freighter-module";

StellarWalletsKit.init({
  network: Networks.TESTNET,
  modules: [new DirectFreighterModule()],
  theme: SwkAppDarkTheme,
});
