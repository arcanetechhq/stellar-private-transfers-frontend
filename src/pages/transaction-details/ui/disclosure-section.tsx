import React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/shared/ui/surface-card";
import { DISCLOSURE_OPTIONS } from "../model/transaction-details";

export function DisclosureSection() {
  const { t: translate } = useTranslation("transactionDetails");
  const [selectedDisclosure, setSelectedDisclosure] =
    useState<string | undefined>();

  return (
    <>
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">
            {translate("dataDisclosureOptions")}
          </h2>
        </CardHeader>
        <CardContent className="space-y-3">
          {DISCLOSURE_OPTIONS.map((option) => (
            <label
              key={option.id}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                selectedDisclosure === option.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="disclosure"
                value={option.id}
                checked={selectedDisclosure === option.id}
                onChange={(event) =>
                  setSelectedDisclosure(event.target.value)
                }
                className="mt-1 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {translate(option.titleKey)}
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  {translate(option.descriptionKey)}
                </div>
              </div>
            </label>
          ))}

          {selectedDisclosure && (
            <div className="pt-4">
              <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700">
                <Eye className="h-5 w-5" />
                {translate("discloseSelectedData")}
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">
            {translate("disclosureHistory")}
          </h2>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-gray-500">
            <EyeOff className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p>{translate("noDisclosureYet")}</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
