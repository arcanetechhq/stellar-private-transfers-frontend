import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Inbox,
  ShieldCheck,
} from "lucide-react";

export type NotificationPreferenceRow = {
  icon?: LucideIcon;
  titleKey: string;
  textKey: string;
  email: boolean;
  push: boolean;
};

export const NOTIFICATION_IMPORTANT_ROWS: NotificationPreferenceRow[] = [
  {
    icon: BarChart3,
    titleKey: "notifications.cashFlow.title",
    textKey: "notifications.cashFlow.text",
    email: true,
    push: true,
  },
  {
    icon: ShieldCheck,
    titleKey: "notifications.suspiciousActivity.title",
    textKey: "notifications.suspiciousActivity.text",
    email: true,
    push: true,
  },
  {
    icon: Inbox,
    titleKey: "notifications.tasks.title",
    textKey: "notifications.tasks.text",
    email: true,
    push: true,
  },
];

export const NOTIFICATION_GENERAL_ROWS: NotificationPreferenceRow[] = [
  {
    titleKey: "notifications.spending.title",
    textKey: "notifications.spending.text",
    email: true,
    push: true,
  },
  {
    titleKey: "notifications.balances.title",
    textKey: "notifications.balances.text",
    email: true,
    push: true,
  },
  {
    titleKey: "notifications.accounting.title",
    textKey: "notifications.accounting.text",
    email: true,
    push: false,
  },
  {
    titleKey: "notifications.billPay.title",
    textKey: "notifications.billPay.text",
    email: true,
    push: true,
  },
  {
    titleKey: "notifications.invoicing.title",
    textKey: "notifications.invoicing.text",
    email: true,
    push: true,
  },
  {
    titleKey: "notifications.collaboration.title",
    textKey: "notifications.collaboration.text",
    email: true,
    push: false,
  },
];
