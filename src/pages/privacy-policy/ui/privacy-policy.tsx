import React from "react";
import { PolicyHeader } from "./policy-header";
import { PolicyIntroduction } from "./policy-introduction";
import { PolicyDataCollection } from "./policy-data-collection";
import { PolicyDataUsage } from "./policy-data-usage";
import { PolicyPrivacyProtection } from "./policy-privacy-protection";
import { PolicySecurity } from "./policy-security";
import { PolicyRights } from "./policy-rights";
import { PolicyChanges } from "./policy-changes";

export function PrivacyPolicy() {
  return (
    <div
      className="p-8"
      style={{ backgroundColor: "#F6F7F9", minHeight: "100%" }}
    >
      <div className="mx-auto max-w-4xl">
        <PolicyHeader />
        <div
          className="rounded-xl bg-white p-8"
          style={{ border: "1px solid #E7EAF0" }}
        >
          <div className="space-y-8">
            <PolicyIntroduction />
            <PolicyDataCollection />
            <PolicyDataUsage />
            <PolicyPrivacyProtection />
            <PolicySecurity />
            <PolicyRights />
            <PolicyChanges />
          </div>
        </div>
      </div>
    </div>
  );
}
