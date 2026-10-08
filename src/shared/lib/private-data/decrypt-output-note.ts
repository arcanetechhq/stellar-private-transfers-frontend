const LIMB_HEX_LENGTH = 64;

export type DecryptedStellarOutputNote = {
  value: string;
  assetHi: string;
  assetLo: string;
  nullifier: string;
  secret: string;
  applicationId: string;
  commitmentHex: string;
};

type DecryptOutputNoteEvent = (input: {
  recipientScalarHex: string;
  createdEphemeralKey: readonly [string, string];
  ciphertext: readonly string[];
}) => Promise<DecryptedStellarOutputNote>;

function ciphertextLimbs(encryptedData: string): string[] {
  const hex = encryptedData.trim().toLowerCase().replace(/^0x/u, "");
  if (hex.length === 0 || hex.length % LIMB_HEX_LENGTH !== 0) {
    throw new Error("Output note ciphertext is not limb-aligned.");
  }
  const limbs: string[] = [];
  for (let offset = 0; offset < hex.length; offset += LIMB_HEX_LENGTH) {
    limbs.push(hex.slice(offset, offset + LIMB_HEX_LENGTH));
  }
  return limbs;
}

function readDecryptOutputNoteEvent(
  module: Record<string, unknown>,
): DecryptOutputNoteEvent | undefined {
  const candidate = module.decryptOutputNoteEvent;
  if (typeof candidate !== "function") {
    return undefined;
  }
  return candidate as DecryptOutputNoteEvent;
}

export async function decryptStellarOutputNote(input: {
  recipientScalarHex: string;
  encryptedData: string;
  ephemeralX: string;
  ephemeralY: string;
}): Promise<DecryptedStellarOutputNote> {
  const module =
    (await import("@arcanetech/stellar-privacy-pool-zk-sdk")) as Record<
      string,
      unknown
    >;
  const decryptOutputNoteEvent = readDecryptOutputNoteEvent(module);
  if (!decryptOutputNoteEvent) {
    throw new TypeError("Output note decryption is not available.");
  }
  return decryptOutputNoteEvent({
    recipientScalarHex: input.recipientScalarHex,
    createdEphemeralKey: [input.ephemeralX, input.ephemeralY],
    ciphertext: ciphertextLimbs(input.encryptedData),
  });
}
