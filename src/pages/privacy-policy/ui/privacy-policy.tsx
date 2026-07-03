import React from "react";
import { PolicyHeader } from "./policy-header";
import { PolicyIntroduction } from "./policy-introduction";
import { PolicyDataCollection } from "./policy-data-collection";
import { PolicyDataUsage } from "./policy-data-usage";
import { PolicyPrivacyProtection } from "./policy-privacy-protection";
import { PolicySecurity } from "./policy-security";
import { PolicyRights } from "./policy-rights";
import { PolicyChanges } from "./policy-changes";
import "@/shared/styles/info-page.css";

export function PrivacyPolicy() {
  return (
    <div className="info-page">
      <div className="info-page__shell">
        <PolicyHeader />
        <div className="info-page__card">
          <div className="info-page__stack">
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
