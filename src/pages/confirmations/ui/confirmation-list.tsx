import React from "react";
import type { Confirmation } from "@/shared/lib/mock";
import { ConfirmationCard } from "./confirmation-card";

interface ConfirmationListProperties {
  confirmations: Confirmation[];
}

export function ConfirmationList(properties: ConfirmationListProperties) {
  const { confirmations } = properties;

  return (
    <div className="space-y-3">
      {confirmations.map((confirmation) => (
        <ConfirmationCard
          key={confirmation.id}
          confirmation={confirmation}
        />
      ))}
    </div>
  );
}
