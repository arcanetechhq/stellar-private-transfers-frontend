import React from "react";
import { useAppSelector } from "@/store";
import { selectCoinItems } from "@/entities/coin";
import {
  selectAreTransactionsLoaded,
  selectTransactions,
} from "@/entities/transaction";
import { TransactionsPanel } from "@/widgets/transaction-list";
import { PrivateAssetTable } from "@/widgets/private-asset-table";
import { summarizePrivateHero } from "../lib/summarize-private-hero";
import { useOverviewEscrowClaims } from "../model/use-overview-escrow-claims";
import { BalanceHero } from "./balance-hero";

function formatUsdBalance(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function Overview() {
  const privateCoinItems = useAppSelector(selectCoinItems);
  const transactions = useAppSelector(selectTransactions);
  const transactionsLoaded = useAppSelector(selectAreTransactionsLoaded);
  const { pendingAssetClaims, claimControls } = useOverviewEscrowClaims();
  const { privateAssetCount, totalUsdBalance } =
    summarizePrivateHero(privateCoinItems);

  return (
    <React.Fragment>
      <div className="w-full min-h-full p-[24px] pt-[8px] bg-background">
        <div className="w-full flex flex-col gap-4">
          <BalanceHero
            balance={formatUsdBalance(totalUsdBalance)}
            assetCount={privateAssetCount}
          />
          <div className="grid grid-cols-1 min-[1180px]:grid-cols-[1fr_416px] gap-4">
            <div className="overview-right-rail order-1 min-[1180px]:order-2 min-[1180px]:col-start-2 min-[1180px]:row-start-1">
              <PrivateAssetTable
                pendingAssetClaims={pendingAssetClaims}
                claimControls={claimControls}
              />
            </div>
            <div className="order-2 min-[1180px]:order-1 min-[1180px]:col-start-1 min-[1180px]:row-start-1">
              <TransactionsPanel
                transactions={transactions}
                isHydrated={transactionsLoaded}
                variant="overview"
              />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
