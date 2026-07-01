import { Navigate, createBrowserRouter, useParams } from "react-router";
import { MainLayout } from "@/widgets/main-layout";
import { Overview } from "@/pages/overview";
import { AllAssets } from "@/pages/all-assets";
import { CreateTransfer } from "@/pages/create-transfer";
import { CreateDeposit } from "@/pages/create-deposit";
import { CreateWithdrawal } from "@/pages/create-withdrawal";
import { TransferSuccess } from "@/pages/transfer-success";
import { TransactionsPage } from "@/pages/transactions";
import { Contacts, AddContactPage } from "@/pages/contacts";
import { PendingClaimsPage } from "@/pages/pending-claims";
import { About } from "@/pages/about";
import { PrivacyPolicy } from "@/pages/privacy-policy";
import { NotFound } from "@/pages/not-found";
import { Access } from "@/pages/access";
import {
  SettingsApiKeys,
  SettingsGeneral,
  SettingsNotifications,
  SettingsRedirect,
} from "@/pages/settings";
import { SettingsLayout } from "@/widgets/settings-layout";
import { Confirmations } from "@/pages/confirmations";
import { DisclosureCenter } from "@/pages/disclosure-center";
import { buildTransactionsPathWithSelection } from "@/widgets/transaction-list";

function LegacyTransactionDetailsRedirect() {
  const { id } = useParams();
  const trimmed = id?.trim();
  if (!trimmed) {
    return <Navigate to="/transactions" replace />;
  }
  return (
    <Navigate to={buildTransactionsPathWithSelection(trimmed)} replace />
  );
}

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
      { path: "transaction/:id", Component: LegacyTransactionDetailsRedirect },
      { path: "transactions", Component: TransactionsPage },
      { path: "history", element: <Navigate to="/transactions" replace /> },
      { path: "contacts", Component: Contacts },
      { path: "contacts/new", Component: AddContactPage },
      { path: "pending-claims", Component: PendingClaimsPage },
      { path: "help", element: <Navigate to="/" replace /> },
      { path: "about", Component: About },
      { path: "privacy-policy", Component: PrivacyPolicy },
      { path: "access", Component: Access },
      {
        path: "settings",
        Component: SettingsLayout,
        children: [
          { index: true, Component: SettingsRedirect },
          { path: "general", Component: SettingsGeneral },
          { path: "notifications", Component: SettingsNotifications },
          { path: "api-keys", Component: SettingsApiKeys },
          { path: "referral-program", element: <Navigate to="/" replace /> },
        ],
      },
      { path: "confirmations", Component: Confirmations },
      { path: "disclosure", Component: DisclosureCenter },
      { path: "*", Component: NotFound },
    ],
  },
]);
