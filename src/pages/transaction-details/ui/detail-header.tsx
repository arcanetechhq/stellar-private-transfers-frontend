import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { ArrowLeft, Download, Share2 } from "lucide-react";

interface DetailHeaderProperties {
  transactionId: string | undefined;
}

export function DetailHeader(properties: DetailHeaderProperties) {
  const { transactionId } = properties;
  const { t: translate } = useTranslation("transactionDetails");

  return (
    <div className="mb-6">
      <Link
        to="/history"
        className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        {translate("backToHistory")}
      </Link>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-semibold text-gray-900">
            {translate("title")}
          </h1>
          <p className="text-gray-600">{translate("idPrefix")}{transactionId}</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
            <Download className="h-4 w-4" />
            {translate("downloadReceipt")}
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
            <Share2 className="h-4 w-4" />
            {translate("shareReceipt")}
          </button>
        </div>
      </div>
    </div>
  );
}
