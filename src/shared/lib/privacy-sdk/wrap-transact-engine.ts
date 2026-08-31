import type {
  StellarPreparedOperation,
  StellarTransactEngine,
} from "@arcanetech/privacy-sdk-stellar";
import {
  finalizeSpendOperationAtExecute,
  getPrivacyPoolService,
  type StellarTransactEnvironment,
} from "@arcanetech/privacy-sdk-stellar/transact";

export function wrapTransactEngineToProveAtPrepare(input: {
  engine: StellarTransactEngine;
  environment: StellarTransactEnvironment;
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
        getPrivacyPoolService(),
      );
    },
    submit: (prepared, signedPayload) => input.engine.submit(prepared, signedPayload),
  };
}
