export const FREIGHTER_WALLET_ID = "freighter";
export const LOBSTR_WALLET_ID = "lobstr";

export type WalletConnectOptionId =
  | typeof FREIGHTER_WALLET_ID
  | typeof LOBSTR_WALLET_ID
  | "walletconnect";

export type WalletConnectOption = {
  id: WalletConnectOptionId;
  nameKey: string;
  descriptionKey: string;
  badgeKey: string;
  moduleId?: string;
  productUrl: string;
  iconUrl?: string;
  opensAllWallets?: boolean;
};

export const WALLET_CONNECT_OPTIONS: WalletConnectOption[] = [
  {
    id: FREIGHTER_WALLET_ID,
    nameKey: "walletOptionFreighterName",
    descriptionKey: "walletOptionFreighterDescription",
    badgeKey: "walletOptionFreighterBadge",
    moduleId: FREIGHTER_WALLET_ID,
    productUrl: "https://freighter.app",
  },
  {
    id: LOBSTR_WALLET_ID,
    nameKey: "walletOptionLobstrName",
    descriptionKey: "walletOptionLobstrDescription",
    badgeKey: "walletOptionLobstrBadge",
    moduleId: LOBSTR_WALLET_ID,
    productUrl: "https://lobstr.co",
  },
  {
    id: "walletconnect",
    nameKey: "walletOptionWalletConnectName",
    descriptionKey: "walletOptionWalletConnectDescription",
    badgeKey: "walletOptionWalletConnectBadge",
    productUrl: "https://walletconnect.com/",
    iconUrl: "https://stellar.creit.tech/wallet-icons/walletconnect.png",
    opensAllWallets: true,
  },
];
