import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardContent } from "@/shared/ui/surface-card";
import { StatusBadge } from "@/shared/ui/status-badge";
import { TokenIcon } from "@/shared/ui/token-icon";

export function DetailInfo() {
  const { t: translate } = useTranslation("transactionDetails");

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900">
          {translate("transactionInformation")}
        </h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="mb-1 text-sm text-gray-500">{translate("amount")}</div>
            <div className="text-2xl font-semibold text-gray-900">
              5,000 USDC
            </div>
          </div>
          <div>
            <div className="mb-1 text-sm text-gray-500">{translate("asset")}</div>
            <div className="flex items-center gap-2">
              <TokenIcon symbol="USDC" size="lg" />
              <div className="text-2xl font-semibold text-gray-900">USDC</div>
            </div>
          </div>
        </div>

        <div className="space-y-3 border-t border-gray-200 pt-4">
          <div className="flex justify-between">
            <span className="text-gray-600">{translate("transactionStatus")}</span>
            <StatusBadge variant="success">{translate("completed")}</StatusBadge>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{translate("sender")}</span>
            <span className="font-mono text-sm font-medium text-gray-900">
              0x742d...3f8c
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{translate("recipient")}</span>
            <span className="font-mono text-sm font-medium text-gray-900">
              0x891a...7d2e
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{translate("dateTime")}</span>
            <span className="font-medium text-gray-900">
              March 10, 2026, 10:30
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{translate("networkFee")}</span>
            <span className="font-medium text-gray-900">0.50 USDC</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
