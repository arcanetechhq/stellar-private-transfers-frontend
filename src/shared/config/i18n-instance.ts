import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enCommon from "./locales/en/common.json";
import enNavigation from "./locales/en/navigation.json";
import enHelp from "./locales/en/help.json";
import enDeposit from "./locales/en/deposit.json";
import enOverview from "./locales/en/overview.json";
import enSettings from "./locales/en/settings.json";
import enContacts from "./locales/en/contacts.json";
import enHistory from "./locales/en/history.json";
import enTransactionDetails from "./locales/en/transactionDetails.json";
import enTransfer from "./locales/en/transfer.json";
import enWithdrawal from "./locales/en/withdrawal.json";
import enAllAssets from "./locales/en/allAssets.json";
import enConfirmations from "./locales/en/confirmations.json";
import enDisclosure from "./locales/en/disclosure.json";
import enAbout from "./locales/en/about.json";
import enPrivacyPolicy from "./locales/en/privacyPolicy.json";
import enAccess from "./locales/en/access.json";
import enPrivateAddress from "./locales/en/private-address.json";
import enPendingClaims from "./locales/en/pending-claims.json";
import enAssets from "./locales/en/assets.json";
import enTransactions from "./locales/en/transactions.json";
import enDataExport from "./locales/en/dataExport.json";
import enKyt from "./locales/en/kyt.json";

const NAMESPACES = [
  "common",
  "navigation",
  "help",
  "deposit",
  "overview",
  "settings",
  "contacts",
  "history",
  "transactionDetails",
  "transfer",
  "withdrawal",
  "allAssets",
  "confirmations",
  "disclosure",
  "about",
  "privacyPolicy",
  "access",
  "privateAddress",
  "pendingClaims",
  "assets",
  "transactions",
  "dataExport",
  "kyt",
] as const;

i18n.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  defaultNS: "common",
  ns: [...NAMESPACES],
  resources: {
    en: {
      common: enCommon,
      navigation: enNavigation,
      help: enHelp,
      deposit: enDeposit,
      overview: enOverview,
      settings: enSettings,
      contacts: enContacts,
      history: enHistory,
      transactionDetails: enTransactionDetails,
      transfer: enTransfer,
      withdrawal: enWithdrawal,
      allAssets: enAllAssets,
      confirmations: enConfirmations,
      disclosure: enDisclosure,
      about: enAbout,
      privacyPolicy: enPrivacyPolicy,
      access: enAccess,
      privateAddress: enPrivateAddress,
      pendingClaims: enPendingClaims,
      assets: enAssets,
      transactions: enTransactions,
      dataExport: enDataExport,
      kyt: enKyt,
    },
  },
});

export { default as i18n } from "i18next";
