import { createPrivateDataProvider } from "@arcanetech/privacy-sdk-data-layer";
import {
  createStellarDataAuthorizer,
  STELLAR_ESCROW_INDEX_DATA_TYPE,
  STELLAR_ESCROW_TAG_PROTOCOL,
  STELLAR_OUTPUT_NOTE_DATA_TYPE,
  stellarEscrowIndexRecordSchema,
  stellarEscrowTagCompletionSchema,
  stellarOutputNoteRecordSchema,
  type StellarMessageSigner,
} from "@arcanetech/privacy-sdk-stellar";

export function createEscrowDataProvider(input: {
  origin: string;
  signMessage: StellarMessageSigner["signMessage"];
  fetchImpl?: typeof fetch;
}) {
  return createPrivateDataProvider({
    origin: input.origin,
    dataType: STELLAR_ESCROW_INDEX_DATA_TYPE,
    recordSchema: stellarEscrowIndexRecordSchema,
    completionSchema: stellarEscrowTagCompletionSchema,
    protocol: STELLAR_ESCROW_TAG_PROTOCOL,
    authorizer: createStellarDataAuthorizer({
      signMessage: input.signMessage,
    }),
    ...(input.fetchImpl ? { fetch: input.fetchImpl } : {}),
  });
}

export function createOutputNoteDataProvider(input: {
  origin: string;
  fetchImpl?: typeof fetch;
}) {
  return createPrivateDataProvider({
    origin: input.origin,
    dataType: STELLAR_OUTPUT_NOTE_DATA_TYPE,
    recordSchema: stellarOutputNoteRecordSchema,
    ...(input.fetchImpl ? { fetch: input.fetchImpl } : {}),
  });
}
