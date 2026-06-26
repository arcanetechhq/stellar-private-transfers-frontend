import { PrivacyPoolSDK } from "@auditable/privacy-pool-zk-sdk";
import wasmSdkUrl from "@auditable/privacy-pool-zk-sdk/sdk.wasm?url";
import wasmWitnessCalculatorUrl from "@auditable/privacy-pool-zk-sdk/witness.wasm?url";
import zkeyFileUrl from "@auditable/privacy-pool-zk-sdk/main.zkey?url";

export async function initializePrivacyPoolSdk(): Promise<PrivacyPoolSDK> {
  const cacheKey = import.meta.env.DEV ? `?v=${Date.now()}` : "";
  const wasmBinary = await fetch(`${wasmSdkUrl}${cacheKey}`).then((response) =>
    response.arrayBuffer(),
  );
  const circuitWasm = await fetch(wasmWitnessCalculatorUrl).then((response) =>
    response.arrayBuffer(),
  );
  const zkey = await fetch(zkeyFileUrl).then((response) =>
    response.arrayBuffer(),
  );
  return PrivacyPoolSDK.init({ wasmBinary, circuitWasm, zkey });
}
