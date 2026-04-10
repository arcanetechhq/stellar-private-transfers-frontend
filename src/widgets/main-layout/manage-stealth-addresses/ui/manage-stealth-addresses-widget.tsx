import React from "react";
import { ManageStealthAddressesCompact } from "./manage-stealth-addresses-compact";
import { ManageStealthAddressesFull } from "./manage-stealth-addresses-full";
import { useManageStealthAddressesWidget } from "../lib/use-manage-stealth-addresses-widget";

export type ManageStealthAddressesWidgetVariant = "full" | "compact";

type ManageStealthAddressesWidgetProperties = {
  variant?: ManageStealthAddressesWidgetVariant;
};

export function ManageStealthAddressesWidget({
  variant = "full",
}: ManageStealthAddressesWidgetProperties) {
  const model = useManageStealthAddressesWidget();

  if (variant === "compact" && !model.publicKey) {
    return;
  }

  if (variant === "compact") {
    return (
      <ManageStealthAddressesCompact
        translate={model.translate}
        byNonce={model.byNonce}
        defaultNonce={model.defaultNonce}
        nonces={model.nonces}
        create={model.create}
        status={model.status}
        errorKind={model.errorKind}
        reset={model.reset}
      />
    );
  }

  const formDisabled = !model.walletConnected || model.status === "pending";
  const createNamedDisabled =
    formDisabled || !model.newNonceLabel.trim();

  return (
    <ManageStealthAddressesFull
      translate={model.translate}
      walletConnected={model.walletConnected}
      nonces={model.nonces}
      byNonce={model.byNonce}
      normalizedNonce={model.normalizedNonce}
      displayedEntry={model.displayedEntry}
      onViewingChange={model.setViewingNonce}
      newNonceLabel={model.newNonceLabel}
      onNewNonceLabelChange={model.setNewNonceLabel}
      onCreateNamed={model.handleCreate}
      onCreateDefault={model.handleCreateDefault}
      formDisabled={formDisabled}
      createNamedDisabled={createNamedDisabled}
      status={model.status}
      errorKind={model.errorKind}
      reset={model.reset}
    />
  );
}
