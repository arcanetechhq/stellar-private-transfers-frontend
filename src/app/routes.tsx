import { createBrowserRouter } from "react-router";
import { MainLayout } from "@/widgets/main-layout";
import { Overview } from "@/pages/overview";
import { AllAssets } from "@/pages/all-assets";
import { CreateTransfer } from "@/pages/create-transfer";
import { CreateDeposit } from "@/pages/create-deposit";
import { CreateWithdrawal } from "@/pages/create-withdrawal";
import { TransferSuccess } from "@/pages/transfer-success";
import { TransactionDetails } from "@/pages/transaction-details";
import { TransactionHistory } from "@/pages/transaction-history";
import { Contacts } from "@/pages/contacts";
import { Help } from "@/pages/help";
import { About } from "@/pages/about";
import { PrivacyPolicy } from "@/pages/privacy-policy";
import { NotFound } from "@/pages/not-found";
import { Access } from "@/pages/access";
import { Settings } from "@/pages/settings";
import { Confirmations } from "@/pages/confirmations";
import { DisclosureCenter } from "@/pages/disclosure-center";
import { DataExport } from "@/pages/data-export";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: Overview },
      { path: "assets", Component: AllAssets },
      { path: "create-transfer", Component: CreateTransfer },
      { path: "deposit", Component: CreateDeposit },
      { path: "withdraw", Component: CreateWithdrawal },
      { path: "transfer-success/:id", Component: TransferSuccess },
      { path: "transaction/:id", Component: TransactionDetails },
      { path: "history", Component: TransactionHistory },
      { path: "contacts", Component: Contacts },
      { path: "help", Component: Help },
      { path: "about", Component: About },
      { path: "privacy-policy", Component: PrivacyPolicy },
      { path: "access", Component: Access },
      { path: "settings", Component: Settings },
      { path: "confirmations", Component: Confirmations },
      { path: "disclosure", Component: DisclosureCenter },
      { path: "data-export", Component: DataExport },
      { path: "*", Component: NotFound },
    ],
  },
]);
