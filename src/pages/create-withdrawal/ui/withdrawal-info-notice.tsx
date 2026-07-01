import { Info } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

export function WithdrawalInfoNotice(): React.JSX.Element {
  const { t: translate } = useTranslation("withdrawal");

  return (
    <div className="transfer-privacy-notice transfer-privacy-notice--warning">
      <Info className="transfer-privacy-notice__icon" aria-hidden="true" />
      <div>
        <p className="transfer-privacy-notice__title">
          {translate("aboutWithdrawals")}
        </p>
        <p className="transfer-privacy-notice__text">
          {translate("aboutWithdrawalsText")}
        </p>
      </div>
    </div>
  );
}
