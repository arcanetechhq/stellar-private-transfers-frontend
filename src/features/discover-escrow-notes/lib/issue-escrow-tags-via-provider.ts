import type { IssuedBlindedRecipientTag } from "./issued-blinded-recipient-tag.js";
import { createEscrowDataProvider } from "./create-private-data-providers.js";

export type SignEscrowTagChallenge = (message: string) => Promise<{
  signature: string;
  signerPublicKey: string;
}>;

export async function issueEscrowTagsViaProvider(input: {
  privateDataOrigin: string;
  stellarAddress: string;
  signChallenge: SignEscrowTagChallenge;
  fetchImpl?: typeof fetch;
}): Promise<{
  tags: IssuedBlindedRecipientTag[];
  signerPublicKey: string;
}> {
  let signerPublicKey = input.stellarAddress;
  const provider = createEscrowDataProvider({
    origin: input.privateDataOrigin,
    signMessage: async (message) => {
      const signed = await input.signChallenge(message);
      signerPublicKey = signed.signerPublicKey;
      return signed;
    },
    ...(input.fetchImpl ? { fetchImpl: input.fetchImpl } : {}),
  });
  const challenge = await provider.createChallenge({
    stellarAddress: input.stellarAddress,
  });
  const completion = await provider.completeChallenge(challenge);
  return { tags: [...completion.tags], signerPublicKey };
}
