import React from "react";
import { useAppSelector } from "@/store";
import { getAssetUsdPrice } from "@/entities/asset";
import { selectCoinItems } from "@/entities/coin";
import {
  selectAreTransactionsLoaded,
  selectTransactions,
} from "@/entities/transaction";
import {
  TransactionsPanel,
  useMergedWalletTransactions,
} from "@/widgets/transaction-list";
import { BalanceHero } from "./balance-hero";
import { PrivateAssetTable } from "@/widgets/private-asset-table";

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
  const { mergedTransactions } = useMergedWalletTransactions(transactions);

  const privateAmountByAssetId = new Map<string, number>();
  for (const item of privateCoinItems) {
    if (item.status !== "finalized") {
      continue;
    }
    const current = privateAmountByAssetId.get(item.assetId) ?? 0;
    privateAmountByAssetId.set(item.assetId, current + item.amountDisplay);
  }

  let privateAssetCount = 0;
  let totalUsdBalance = 0;
  for (const [assetId, amount] of privateAmountByAssetId.entries()) {
    if (amount <= 0) {
      continue;
    }
    privateAssetCount += 1;
    totalUsdBalance += amount * getAssetUsdPrice(assetId);
  }

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
              <PrivateAssetTable />
            </div>
            <div className="order-2 min-[1180px]:order-1 min-[1180px]:col-start-1 min-[1180px]:row-start-1">
              <TransactionsPanel
                transactions={mergedTransactions}
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
