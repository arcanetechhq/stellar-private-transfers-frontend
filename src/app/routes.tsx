import { Navigate, createBrowserRouter } from "react-router";
import { MainLayout } from "@/widgets/main-layout";
import { Overview } from "@/pages/overview";
import { CreateTransfer } from "@/pages/create-transfer";
import { CreateDeposit } from "@/pages/create-deposit";
import { CreateWithdrawal } from "@/pages/create-withdrawal";
import { TransferSuccess } from "@/pages/transfer-success";
import { TransactionsPage } from "@/pages/transactions";
import { Contacts, AddContactPage, EditContactPage } from "@/pages/contacts";
import { About } from "@/pages/about";
import { PrivacyPolicy } from "@/pages/privacy-policy";
import { NotFound } from "@/pages/not-found";
import {
  SettingsApiKeys,
  SettingsGeneral,
  SettingsNotifications,
} from "@/pages/settings";
import { SettingsLayout } from "@/widgets/settings-layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: Overview },
      { path: "create-transfer", Component: CreateTransfer },
      { path: "deposit", Component: CreateDeposit },
      { path: "withdraw", Component: CreateWithdrawal },
      { path: "transfer-success/:id", Component: TransferSuccess },
      { path: "transactions", Component: TransactionsPage },
      { path: "contacts", Component: Contacts },
      { path: "contacts/new", Component: AddContactPage },
      { path: "contacts/:contactId/edit", Component: EditContactPage },
      { path: "about", Component: About },
      { path: "privacy-policy", Component: PrivacyPolicy },
      {
        path: "settings",
        Component: SettingsLayout,
        children: [
          { index: true, Component: SettingsGeneral },
          { path: "general", element: <Navigate to="/settings" replace /> },
          { path: "notifications", Component: SettingsNotifications },
          { path: "api-keys", Component: SettingsApiKeys },
          { path: "referral-program", element: <Navigate to="/" replace /> },
        ],
      },
      { path: "*", Component: NotFound },
    ],
  },
]);
