import React from "react";
import { mockConfirmations } from "@/shared/lib/mock";
import { ConfirmationsHeader } from "./confirmations-header";
import { ConfirmationsStats } from "./confirmations-stats";
import { ConfirmationList } from "./confirmation-list";
import { ConfirmationsInfoBanner } from "./confirmations-info-banner";

export function Confirmations() {
  return (
    <div className="p-6" style={{ backgroundColor: "#F4F4F2" }}>
      <div className="mx-auto max-w-7xl">
        <ConfirmationsHeader />
        <ConfirmationsStats confirmations={mockConfirmations} />
        <ConfirmationList confirmations={mockConfirmations} />
        <ConfirmationsInfoBanner />
      </div>
    </div>
  );
}
