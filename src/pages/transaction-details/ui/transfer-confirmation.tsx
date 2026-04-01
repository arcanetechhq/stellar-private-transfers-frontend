import React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/shared/ui/surface-card";

export function TransferConfirmation() {
  const { t: translate } = useTranslation("transactionDetails");

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900">
          {translate("transferConfirmation")}
        </h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-900">
            {translate("confirmationCreated")}
          </span>
        </div>

        <div className="space-y-2">
          <button className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50">
            {translate("downloadConfirmation")}
          </button>
          <button className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50">
            {translate("sendConfirmation")}
          </button>
          <button className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700">
            {translate("createNew")}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
