import React from "react";
import {
  Wallet,
  Copy,
  LogOut,
  Check,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import type { ReactNode } from "react";
import { shortenStellarAddress } from "@/shared/lib/shorten-stellar-address";
import { ManageStealthAddressesWidget } from "../manage-stealth-addresses";
import { useCopy } from "@/shared/hooks";

type MainLayoutWalletMenuProperties = {
  isOpen: boolean;
  onClose: () => void;
  publicKey: string;
  translate: (key: string) => string;
  onChangeWallet: () => void | Promise<void>;
  onDisconnect: () => void | Promise<void>;
};

const DEFAULT_ACTION_FONT_WEIGHT = 400;
const STATUS_FONT_WEIGHT = 500;

type MainLayoutWalletActionButtonProperties = {
  onClick: () => void;
  icon: ReactNode;
  label: string;
  danger?: boolean;
};

function MainLayoutWalletActionButton({
  onClick,
  icon,
  label,
  danger = false,
}: MainLayoutWalletActionButtonProperties) {
  return (
    <button
      type="button"
      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-gray-900 hover:bg-gray-50"
      }`}
      style={{ fontWeight: DEFAULT_ACTION_FONT_WEIGHT }}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

type MainLayoutWalletMenuHeaderProperties = {
  publicKey: string;
  translate: (key: string) => string;
};

function MainLayoutWalletMenuHeader({
  publicKey,
  translate,
}: MainLayoutWalletMenuHeaderProperties) {
  const { copied, handleCopy } = useCopy(publicKey);

  return (
    <div className="border-b border-gray-200 px-4 py-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50">
          <Wallet className="h-5 w-5 text-gray-900" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span
              className="text-[13px] leading-[18px] text-gray-500"
              style={{ fontWeight: STATUS_FONT_WEIGHT }}
            >
              {translate("common:walletProviderStellar")}
            </span>
            <div className="flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span
                className="text-[11px] leading-4 text-emerald-600"
                style={{ fontWeight: STATUS_FONT_WEIGHT }}
              >
                {translate("common:connected")}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="truncate font-mono text-sm leading-5 font-semibold text-gray-900">
              {shortenStellarAddress(publicKey)}
            </span>
            <button
              type="button"
              className="flex shrink-0 items-center gap-1 rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              onClick={handleCopy}
              aria-label="Copy private address"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MainLayoutWalletMenu({
  isOpen,
  onClose,
  publicKey,
  translate,
  onChangeWallet,
  onDisconnect,
}: MainLayoutWalletMenuProperties) {
  if (!isOpen) {
    return;
  }

  return (
    <React.Fragment>
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="absolute top-16 right-6 z-20 w-72 rounded-xl border border-gray-200 bg-white shadow-lg">
        <MainLayoutWalletMenuHeader
          publicKey={publicKey}
          translate={translate}
        />

        <ManageStealthAddressesWidget variant="compact" />

        <div className="py-2">
          <MainLayoutWalletActionButton
            onClick={onChangeWallet}
            icon={<RefreshCw className="h-4 w-4 text-gray-500" />}
            label={translate("common:changeWallet")}
          />
          <MainLayoutWalletActionButton
            onClick={onDisconnect}
            icon={<LogOut className="h-4 w-4 text-red-600" />}
            label={translate("common:disconnect")}
            danger
          />
        </div>
      </div>
    </React.Fragment>
  );
}

type MainLayoutWalletTriggerProperties = {
  shortAddress: string;
  isOpen: boolean;
  onToggle: () => void;
};

export function MainLayoutWalletTrigger({
  shortAddress,
  isOpen,
  onToggle,
}: MainLayoutWalletTriggerProperties) {
  return (
    <button
      type="button"
      className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 transition-colors hover:bg-gray-50"
      onClick={onToggle}
      aria-expanded={isOpen}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50">
        <Wallet className="h-4 w-4 text-gray-900" />
      </div>
      <div className="text-left">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[13px] leading-[18px] text-gray-900">
            {shortAddress}
          </span>
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </div>
      </div>
      <ChevronDown className="h-4 w-4 text-gray-500" />
    </button>
  );
}
