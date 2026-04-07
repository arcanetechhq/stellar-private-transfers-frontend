import React from "react";
import { PrivateAssetTable } from "@/widgets/private-asset-table";
import { PageHeader } from "./page-header";

export function AllAssets() {
  return (
    <div
      className="p-8"
      style={{ backgroundColor: "#F6F7F9", minHeight: "100%" }}
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader />
        <PrivateAssetTable />
      </div>
    </div>
  );
}
