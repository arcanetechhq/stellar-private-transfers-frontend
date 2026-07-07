import React from "react";
import "../../create-deposit/ui/deposit.css";
import { useTranslation } from "react-i18next";
import { useLocation, useParams } from "react-router";
import { useAppSelector } from "@/store";
import { selectWalletPublicKey } from "@/entities/wallet";
import { useAssetByPoolContract } from "@/entities/asset";
import {
  buildTransferSuccessViewModel,
  type TransferSuccessLocationState,
} from "../lib/build-transfer-success-view";
import { TransferSuccessPanel } from "./transfer-success-panel";

export function TransferSuccess(): React.JSX.Element {
  const { t: translate, i18n } = useTranslation("transfer");
  const location = useLocation();
  const { id: routeId } = useParams();
  const publicKey = useAppSelector(selectWalletPublicKey);
  const state = location.state as TransferSuccessLocationState | undefined;

  const poolContract = state?.poolContract?.trim();
  const assetMatch = useAssetByPoolContract(poolContract);
  const view = buildTransferSuccessViewModel({
    state,
    routeId,
    assetMatch,
    fallbackTransactionLabel: translate("success.transactionId"),
    language: i18n.language,
  });
  const deliveryWarning = state?.coinDeliveryWarning?.trim();

  return (
    <div className="workspace__inner">
      <div className="deposit-route">
        <div className="deposit-flow" data-testid="transfer-success-screen">
          {deliveryWarning ? (
            <div
              role="status"
              className="private-deposit-success-warning"
            >
              {deliveryWarning}
            </div>
          ) : (
            <div className="deposit-flow__title-spacer" aria-hidden="true" />
          )}
          <TransferSuccessPanel view={view} sourceWallet={publicKey ?? undefined} />
        </div>
      </div>
    </div>
  );
}
