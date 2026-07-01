import { ChevronRight, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import Arcn from "@/shared/assets/logo-arcn";
import {
  selectIsWalletConnected,
  selectIsWalletKitLoaded,
} from "@/entities/wallet";
import { connectStellarWallet } from "@/features/stellar-wallet-connect";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

export function ConnectWalletGuard() {
  const { t: translate } = useTranslation("common");
  const dispatch = useAppDispatch();
  const [isConnecting, setIsConnecting] = useState(false);
  const isWalletConnected = useAppSelector(selectIsWalletConnected);
  const isWalletKitLoaded = useAppSelector(selectIsWalletKitLoaded);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    await dispatch(connectStellarWallet()).finally(() => {
      setIsConnecting(false);
    });
  };

  if (!isWalletKitLoaded || isWalletConnected || isConnecting) {
    return false;
  }

  return (
    <Dialog open>
      <DialogContent
        className="max-h-[calc(100vh-2rem)] overflow-hidden rounded-[28px] border-border p-0 sm:max-w-[560px] [&>button]:hidden"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <section className="bg-background p-8 sm:p-12">
          <div className="mb-10 h-9 w-[148px]">
            <Arcn />
          </div>

          <DialogHeader className="space-y-5 text-left">
            <DialogTitle
              className="max-w-[360px] text-[40px] font-semibold tracking-[-0.04em] text-[#1B1D22] sm:text-[46px]"
              style={{ lineHeight: 0.98 }}
            >
              {translate("walletGuardTitle")}
            </DialogTitle>
            <DialogDescription
              className="max-w-[420px] text-[15px] leading-6"
              style={{ color: "#9A9DA3" }}
            >
              {translate("walletGuardDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Button
              size="lg"
              className="h-12 rounded-[14px] bg-[#1E2024] px-5 text-[15px] font-semibold text-white transition-all duration-200 hover:bg-[#15171B]"
              onClick={handleConnectWallet}
            >
              <Wallet className="size-4.5" />
              {translate("connectWallet")}
              <ChevronRight className="size-4.5" />
            </Button>

            <p className="max-w-[220px] text-[14px] leading-5 text-[#9A9DA3]">
              {translate("walletGuardHint")}
            </p>
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}
