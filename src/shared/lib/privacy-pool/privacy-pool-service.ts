import {
  PrivacyPoolSDK,
  decodeDecodedEphemeralKey,
  decodeStealthAddress,
  randomFrDecimal253,
  recipientPublicKeysDecimalFromStealthAddress,
  scalarHexToFrDecimal,
} from "@auditable/privacy-pool-zk-sdk";
import type { CoinData, DepositObject } from "@auditable/privacy-pool-zk-sdk";
import wasmSdkUrl from "@auditable/privacy-pool-zk-sdk/sdk.wasm?url";
import wasmWitnessCalculatorUrl from "@auditable/privacy-pool-zk-sdk/witness.wasm?url";
import zkeyFileUrl from "@auditable/privacy-pool-zk-sdk/main.zkey?url";
import { merkleRootBufferToFrDecimal } from "./merkle-fr";
import { Buffer } from "buffer";

const SAMPLE_SCALAR_ATTEMPTS = 10;

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

  async getInitializedSdk(): Promise<PrivacyPoolSDK> {
    await this.ensureInit();
    if (!this.sdk) {
      throw new Error("SDK not initialized");
    }
    return this.sdk;
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

  async sharedSecretX(
    recipientScalarHex: string,
    ephemeralKeyEncoded: string,
  ): Promise<string> {
    await this.ensureInit();
    if (!this.sdk) {
      throw new Error("SDK not initialized");
    }
    const ephemeralKey = decodeDecodedEphemeralKey(ephemeralKeyEncoded);
    const shared = this.sdk.sharedSecretFromRecipientPreimage({
      recipientScalar: recipientScalarHex,
      ephemeralKey,
    });
    return shared.x;
  }

  private sampleValidDepositScalarHex(): string {
    for (let index = 0; index < SAMPLE_SCALAR_ATTEMPTS; index++) {
      const candidate = PrivacyPoolSDK.generateRandomScalarHex32();
      try {
        scalarHexToFrDecimal(candidate);
        return candidate;
      } catch {
        continue;
      }
    }
    throw new Error("could not sample valid depositor ephemeral scalar");
  }

  async buildAlignedDepositSlot(
    stealthAddressStpl1: string,
    amountStroops: bigint,
  ): Promise<{
    deposit: DepositObject;
    commitment_hex: string;
    coin: CoinData;
    depositScalarHex: string;
  }> {
    const sdk = await this.getInitializedSdk();
    const stealthPoint = decodeStealthAddress(stealthAddressStpl1);
    const scalarHex = this.sampleValidDepositScalarHex();
    const shared = sdk.ecdhSharedKey(scalarHex, stealthPoint.x, stealthPoint.y);
    const generated = sdk.generateCoinForDepositWithSharedHex(
      scalarHex,
      shared.x,
      shared.y,
      amountStroops,
    );
    const recipientPublicKeys =
      recipientPublicKeysDecimalFromStealthAddress(stealthAddressStpl1);
    const deposit: DepositObject = {
      value: generated.coin.value,
      nullifier: generated.coin.nullifier,
      ephemeralKeyScalar: scalarHexToFrDecimal(scalarHex),
      recipientPublicKeys,
    };
    return {
      deposit,
      commitment_hex: generated.commitment_hex,
      coin: generated.coin,
      depositScalarHex: scalarHex,
    };
  }

  async createAlignedShieldCoinData(
    stealthAddressStpl1: string,
    amountStroops: bigint,
  ): Promise<{
    commitment_hex: string;
    coin: CoinData;
    depositScalarHex: string;
  }> {
    const { commitment_hex, coin, depositScalarHex } =
      await this.buildAlignedDepositSlot(stealthAddressStpl1, amountStroops);
    return { commitment_hex, coin, depositScalarHex };
  }

  async prepareDepositTransactProof(parameters: {
    stealthAddressStpl1: string;
    coin: CoinData;
    depositScalarHex: string;
    merkleRootBytes: Buffer;
  }): Promise<{ proof_hex: string; public_hex: string }> {
    const sdk = await this.getInitializedSdk();
    const stateRoot = merkleRootBufferToFrDecimal(parameters.merkleRootBytes);
    const recipientPublicKeys = recipientPublicKeysDecimalFromStealthAddress(
      parameters.stealthAddressStpl1,
    );
    const deposit = {
      value: parameters.coin.value,
      nullifier: parameters.coin.nullifier,
      ephemeralKeyScalar: scalarHexToFrDecimal(parameters.depositScalarHex),
      recipientPublicKeys,
    };

    return sdk.proveTransaction(
      {
        stateRoot,
        withdrawAddressHi: "0",
        withdrawAddressLo: "0",
        privKeyScalar: randomFrDecimal253(),
      },
      ["dummy", "dummy"],
      [deposit, "dummy"],
    );
  }

  async calculateNullifierHash(nullifier: string): Promise<string> {
    const sdk = await this.getInitializedSdk();
    return sdk.calculateNullifierHash(nullifier);
  }
}

export const privacyPoolService = new PrivacyPoolService();
