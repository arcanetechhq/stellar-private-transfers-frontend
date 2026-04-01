import React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Download, Share2, FileDown } from "lucide-react";
import { Link } from "react-router";
import { Card, CardContent } from "@/shared/ui/surface-card";
import { TokenIcon } from "@/shared/ui/token-icon";

function TransferSuccessHero() {
  const { t: translate } = useTranslation("transfer");
  return (
    <div className="mb-8 text-center">
      <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <CheckCircle2 className="h-12 w-12 text-green-600" />
      </div>
      <h1 className="mb-2 text-2xl font-semibold text-gray-900">
        {translate("success.title")}
      </h1>
      <p className="text-gray-600">{translate("success.subtitle")}</p>
    </div>
  );
}

function TransferSuccessMeta() {
  const { t: translate, i18n } = useTranslation("transfer");
  const formattedTime = new Date().toLocaleString(i18n.language, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <Card className="mb-6">
      <CardContent className="space-y-6 py-8">
        <div className="border-b border-gray-200 pb-6 text-center">
          <div className="mb-2 text-sm text-gray-500">
            {translate("success.transferAmount")}
          </div>
          <div className="flex items-center justify-center gap-3">
            <TokenIcon symbol="USDC" size="lg" />
            <div className="text-4xl font-semibold text-gray-900">5,000 USDC</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between border-b border-gray-100 py-3">
            <span className="text-gray-600">{translate("recipient")}</span>
            <span className="font-medium text-gray-900">0x742d...3f8c</span>
          </div>

          <div className="flex justify-between border-b border-gray-100 py-3">
            <span className="text-gray-600">{translate("success.time")}</span>
            <span className="font-medium text-gray-900">{formattedTime}</span>
          </div>

          <div className="flex justify-between border-b border-gray-100 py-3">
            <span className="text-gray-600">{translate("success.transactionId")}</span>
            <span className="font-mono text-sm font-medium text-gray-900">
              0x1234...5678
            </span>
          </div>

          <div className="flex justify-between py-3">
            <span className="text-gray-600">{translate("success.status")}</span>
            <span className="inline-flex items-center rounded-md border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
              {translate("success.statusCompleted")}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TransferSuccessActions() {
  const { t: translate } = useTranslation("transfer");
  return (
    <React.Fragment>
      <div className="mb-6 grid grid-cols-2 gap-4">
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50"
        >
          <Download className="h-5 w-5" />
          {translate("success.downloadConfirmation")}
        </button>

        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50"
        >
          <Share2 className="h-5 w-5" />
          {translate("success.share")}
        </button>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4">
        <Link to="/transaction/0x1234...5678">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
          >
            <FileDown className="h-5 w-5" />
            {translate("success.openDetails")}
          </button>
        </Link>

        <Link to="/disclosure">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-6 py-3 text-gray-700 transition-colors hover:bg-gray-50"
          >
            <TokenIcon className="h-5 w-5" />
            {translate("success.discloseData")}
          </button>
        </Link>
      </div>
    </React.Fragment>
  );
}

function TransferSuccessFooter() {
  const { t: translate } = useTranslation("transfer");
  return (
    <React.Fragment>
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-900">{translate("success.privacyNotice")}</p>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Link to="/" className="text-sm text-blue-600 hover:text-blue-700">
          {translate("success.returnToHome")}
        </Link>
        <span className="text-gray-300">•</span>
        <Link
          to="/create-transfer"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          {translate("success.createNewTransfer")}
        </Link>
      </div>
    </React.Fragment>
  );
}

export function TransferSuccess() {
  return (
    <div className="p-6">
      <div className="mx-auto max-w-2xl">
        <TransferSuccessHero />
        <TransferSuccessMeta />
        <TransferSuccessActions />
        <TransferSuccessFooter />
      </div>
    </div>
  );
}
