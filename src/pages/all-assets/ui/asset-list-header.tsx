import React from "react";
import { useTranslation } from "react-i18next";

const HEADER_LABEL_STYLE: React.CSSProperties = {
  fontSize: "13px",
  lineHeight: "18px",
  color: "#667085",
  textTransform: "uppercase",
  letterSpacing: "0.02em",
};

export function AssetListHeader() {
  const { t: translate } = useTranslation("allAssets");

  return (
    <div
      className="px-6 py-4"
      style={{
        borderBottom: "1px solid #E7EAF0",
        backgroundColor: "#F9FAFB",
      }}
    >
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-4">
          <p className="font-semibold" style={HEADER_LABEL_STYLE}>
            {translate("tableHeaders.asset")}
          </p>
        </div>
        <div className="col-span-2 text-right">
          <p className="font-semibold" style={HEADER_LABEL_STYLE}>
            {translate("tableHeaders.balance")}
          </p>
        </div>
        <div className="col-span-2 text-right">
          <p className="font-semibold" style={HEADER_LABEL_STYLE}>
            {translate("tableHeaders.price")}
          </p>
        </div>
        <div className="col-span-2 text-right">
          <p className="font-semibold" style={HEADER_LABEL_STYLE}>
            {translate("tableHeaders.value")}
          </p>
        </div>
        <div className="col-span-2 text-right">
          <p className="font-semibold" style={HEADER_LABEL_STYLE}>
            {translate("tableHeaders.actions")}
          </p>
        </div>
      </div>
    </div>
  );
}
