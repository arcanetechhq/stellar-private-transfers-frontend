import { z as zod } from "zod";

export const STELLAR_ESCROW_TAG_PROTOCOL = "stellar.escrow-tag";
export const STELLAR_ESCROW_INDEX_DATA_TYPE = "stellar.escrow-index";
export const STELLAR_OUTPUT_NOTE_DATA_TYPE = "stellar.output-note";

export const stellarEscrowIndexRecordSchema = zod.object({
  blindedRecipientTag: zod.string().min(1),
  txId: zod.string().min(1),
  poolAddress: zod.string().min(1),
  seq: zod.number().int(),
  escrowNonce: zod.string().min(1),
  createdAt: zod.string().min(1),
});

export type StellarEscrowIndexRecord = zod.infer<
  typeof stellarEscrowIndexRecordSchema
>;

export const stellarEscrowTagCompletionSchema = zod.object({
  tags: zod.array(
    zod.object({
      epoch: zod.number(),
      tag: zod.string().min(1),
    }),
  ),
});

export type StellarEscrowTagCompletion = zod.infer<
  typeof stellarEscrowTagCompletionSchema
>;

export const stellarOutputNoteRecordSchema = zod.object({
  encryptedData: zod.string().min(1),
  ephemeralX: zod.string().min(1),
  ephemeralY: zod.string().min(1),
});

export type StellarOutputNoteRecord = zod.infer<
  typeof stellarOutputNoteRecordSchema
>;

export type StellarMessageSigner = {
  signMessage(
    message: string,
  ): Promise<{ signature: string; signerPublicKey: string }>;
};

export function createStellarDataAuthorizer(signer: StellarMessageSigner) {
  return {
    async authorize(challenge: {
      message: string;
      fields: Readonly<Record<string, string>>;
    }) {
      const signed = await signer.signMessage(challenge.message);
      return {
        protocol: STELLAR_ESCROW_TAG_PROTOCOL,
        fields: {
          ...challenge.fields,
          signature: signed.signature,
          signerPublicKey: signed.signerPublicKey,
        },
      };
    },
  };
}
