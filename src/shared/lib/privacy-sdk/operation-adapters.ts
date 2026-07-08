import type { StellarPrivacyClient } from "@arcanetech/privacy-sdk-stellar";
import { mapPrivacySdkErrors } from "./map-privacy-sdk-errors.js";
import {
  mapPendingClaimItemToSdkClaim,
  PENDING_CLAIM_TRANSFER_DISCLOSURE,
} from "./execute-sdk-pending-claim-transfer.js";
import type { PendingClaimItem } from "@/entities/pending-claims/model/pending-claim-types.js";

export const DEPOSIT_DISCLOSURE = {
  senderAddress: "public" as const,
  recipientAddress: "private" as const,
  assetAddress: "public" as const,
  amount: "public" as const,
};

const PRIVATE_TRANSFER_DISCLOSURE = {
  senderAddress: "private" as const,
  recipientAddress: "private" as const,
  assetAddress: "private" as const,
  amount: "private" as const,
};

const ONBOARDING_TRANSFER_DISCLOSURE = {
  senderAddress: "public" as const,
  recipientAddress: "public" as const,
  assetAddress: "public" as const,
  amount: "public" as const,
};

const PUBLIC_WITHDRAW_DISCLOSURE = {
  senderAddress: "private" as const,
  recipientAddress: "public" as const,
  assetAddress: "public" as const,
  amount: "public" as const,
};

export async function validateDepositOperation(
  client: StellarPrivacyClient,
  input: {
    walletPublicKey: string;
    privateAddress: string;
    assetId: string;
    amountStroops: bigint;
  },
): Promise<void> {
  const result = await client.deposit({
    from: input.walletPublicKey,
    to: input.privateAddress,
    asset: input.assetId,
    amount: input.amountStroops,
    disclosure: DEPOSIT_DISCLOSURE,
  });
  if (result.status === "rejected") {
    throw new Error(mapPrivacySdkErrors(result.errors));
  }
}

export async function validateTransferOperation(
  client: StellarPrivacyClient,
  input: {
    senderPrivateAddress: string;
    recipientAddress: string;
    assetId: string;
    amountStroops: bigint;
    onboardingRecipient: boolean;
  },
): Promise<void> {
  const result = await client.transfer({
    from: input.senderPrivateAddress,
    to: input.recipientAddress,
    asset: input.assetId,
    amount: input.amountStroops,
    disclosure: input.onboardingRecipient
      ? ONBOARDING_TRANSFER_DISCLOSURE
      : PRIVATE_TRANSFER_DISCLOSURE,
  });
  if (result.status === "rejected") {
    throw new Error(mapPrivacySdkErrors(result.errors));
  }
}

export async function validateWithdrawOperation(
  client: StellarPrivacyClient,
  input: {
    senderPrivateAddress: string;
    recipientPublicAddress: string;
    assetId: string;
    amountStroops: bigint;
  },
): Promise<void> {
  const result = await client.withdraw({
    from: input.senderPrivateAddress,
    to: input.recipientPublicAddress,
    asset: input.assetId,
    amount: input.amountStroops,
    disclosure: PUBLIC_WITHDRAW_DISCLOSURE,
  });
  if (result.status === "rejected") {
    throw new Error(mapPrivacySdkErrors(result.errors));
  }
}

export async function validatePendingClaimOperation(
  client: StellarPrivacyClient,
  input: {
    claim: PendingClaimItem;
    recipientPrivateAddress: string;
    assetId: string;
  },
): Promise<void> {
  const result = await client.transfer({
    from: {
      kind: "pendingClaim",
      claim: mapPendingClaimItemToSdkClaim(input.claim, input.assetId),
    },
    to: input.recipientPrivateAddress,
    asset: input.assetId,
    amount: BigInt(input.claim.noteValue),
    disclosure: PENDING_CLAIM_TRANSFER_DISCLOSURE,
  });
  if (result.status === "rejected") {
    throw new Error(mapPrivacySdkErrors(result.errors));
  }
}
