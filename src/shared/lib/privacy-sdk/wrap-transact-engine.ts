import type {
  StellarPreparedOperation,
  StellarTransactEngine,
} from "@arcanetech/privacy-sdk-stellar";
import {
  finalizeSpendOperationAtExecute,
  type PrivacyPoolService,
  type StellarTransactEnvironment,
} from "@arcanetech/privacy-sdk-stellar/transact";

export function wrapTransactEngineToProveAtPrepare(input: {
  engine: StellarTransactEngine;
  environment: StellarTransactEnvironment;
  poolService: PrivacyPoolService;
}): StellarTransactEngine {
  return {
    prepare: async (prepared: StellarPreparedOperation) => {
      const afterPrepare = await input.engine.prepare(prepared);
      if (afterPrepare.transactArtifacts?.proofHex) {
        return afterPrepare;
      }
      return finalizeSpendOperationAtExecute(
        afterPrepare,
        input.environment,
        input.poolService,
      );
    },
    submit: (prepared, signedPayload) => input.engine.submit(prepared, signedPayload),
  };
}
