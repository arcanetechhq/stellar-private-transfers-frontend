import { PrivacyPoolSDK } from "@auditable/privacy-pool-zk-sdk";
import wasmSdkUrl from "@auditable/privacy-pool-zk-sdk/sdk.wasm?url";
import wasmWitnessCalculatorUrl from "@auditable/privacy-pool-zk-sdk/witness.wasm?url";
import zkeyFileUrl from "@auditable/privacy-pool-zk-sdk/main.zkey?url";

export class PrivacyPoolService {
  private sdk: PrivacyPoolSDK | undefined = undefined;
  private initPromise: Promise<void> | undefined = undefined;

  private async ensureInit(): Promise<void> {
    if (this.sdk) {
      return;
    }
    if (this.initPromise) {
      return this.initPromise;
    }
    this.initPromise = (async () => {
      const wasmBinary = await fetch(wasmSdkUrl).then((response) =>
        response.arrayBuffer(),
      );
      const circuitWasm = await fetch(wasmWitnessCalculatorUrl).then(
        (response) => response.arrayBuffer(),
      );
      const zkey = await fetch(zkeyFileUrl).then((response) =>
        response.arrayBuffer(),
      );
      this.sdk = await PrivacyPoolSDK.init({ wasmBinary, circuitWasm, zkey });
    })();
    return this.initPromise;
  }

  async generateStealthAddressFromStellarSignature(
    signature: string,
  ): Promise<string> {
    await this.ensureInit();
    if (!this.sdk) {
      throw new Error("SDK not initialized");
    }
    return this.sdk.generateStealthAddressFromStellarSignature(signature);
  }
}

export const privacyPoolService = new PrivacyPoolService();
