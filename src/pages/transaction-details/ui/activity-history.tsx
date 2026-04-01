import React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Clock } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/shared/ui/surface-card";
import { ACTIVITY_LOG } from "../model/transaction-details";

function getActivityIcon(status: string) {
  if (status === "completed") {
    return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
  }

  return <Clock className="h-4 w-4 text-yellow-600" />;
}

export function ActivityHistory() {
  const { t: translate } = useTranslation("transactionDetails");

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-gray-900">
          {translate("activityHistory")}
        </h2>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100">
          {ACTIVITY_LOG.map((activity, index) => (
            <div key={index} className="px-6 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-50">
                  {getActivityIcon(activity.status)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-gray-900">
                    {activity.action}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {new Date(activity.date).toLocaleString("en-US", {
                      day: "numeric",
                      month: "long",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
