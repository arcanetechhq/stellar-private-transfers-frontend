import React from "react";
import { QRCodeSVG } from "qrcode.react";

interface DepositQrCodeProperties {
  value: string;
}

export function DepositQrCode({
  value,
}: DepositQrCodeProperties): React.JSX.Element {
  return (
    <QRCodeSVG
      className="deposit-qr"
      value={value}
      size={200}
      level="M"
      bgColor="var(--deposit-qr-background, #f1f5f9)"
      fgColor="#05070d"
      role="img"
      aria-label="Deposit QR code"
    />
  );
}
