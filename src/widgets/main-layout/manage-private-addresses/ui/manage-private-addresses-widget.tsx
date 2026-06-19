import React from "react";
import { ManagePrivateAddressesCompact } from "./manage-private-addresses-compact";
import { ManagePrivateAddressesFull } from "./manage-private-addresses-full";
import { useManagePrivateAddressesWidget } from "../lib/use-manage-private-addresses-widget";

export type ManagePrivateAddressesWidgetVariant = "full" | "compact";

type ManagePrivateAddressesWidgetProperties = {
  variant?: ManagePrivateAddressesWidgetVariant;
};

export function ManagePrivateAddressesWidget({
  variant = "full",
}: ManagePrivateAddressesWidgetProperties) {
  const model = useManagePrivateAddressesWidget();

  if (variant === "compact" && !model.publicKey) {
    return;
  }

  if (variant === "compact") {
    return (
      <ManagePrivateAddressesCompact
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
    <ManagePrivateAddressesFull
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
