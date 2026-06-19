import {
  PrivacyPoolSDK,
  decodeDecodedEphemeralKey,
  randomFrDecimal253,
  scalarHexToFrDecimal,
} from "@auditable/privacy-pool-zk-sdk";
import type { CoinData, DepositObject, StateFile } from "@auditable/privacy-pool-zk-sdk";
import wasmSdkUrl from "@auditable/privacy-pool-zk-sdk/sdk.wasm?url";
import wasmWitnessCalculatorUrl from "@auditable/privacy-pool-zk-sdk/witness.wasm?url";
import zkeyFileUrl from "@auditable/privacy-pool-zk-sdk/main.zkey?url";
import { merkleRootBufferToFrDecimal } from "./merkle-fr";
import { decodePrivateAddress, privateAddressSdk, recipientPublicKeysDecimalFromPrivateAddress } from "@/shared/lib/private-address/privacy-pool-sdk-private-address";
import { proveWithdrawTransact, proveWithdrawTransactDual } from "./privacy-pool-withdraw-transact-proof";
import { Buffer } from "buffer";
import { buildPublicDepositLegs, tokenAddressToAssetLeg, withTokenAddressPublicInputs } from "./prove-transaction-input";

const SAMPLE_SCALAR_ATTEMPTS = 10;
type AlignedDepositSlot = {
  deposit: DepositObject;
  commitment_hex: string;
  coin: CoinData;
  depositScalarHex: string;
  precommitementHex: string;
};
type ProofResult = { proof_hex: string; public_hex: string };
type ProofWithChange = ProofResult & {
  changeCoin?: {
    commitment_hex: string;
    coin: CoinData;
    depositScalarHex: string;
    precommitementHex: string;
  };
};

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

  async generatePrivateAddressFromStellarSignature(
    signature: string,
  ): Promise<string> {
    await this.ensureInit();
    if (!this.sdk) {
      throw new Error("SDK not initialized");
    }
    return privateAddressSdk(this.sdk).generatePrivateAddressFromStellarSignature(
      signature,
    );
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

  async buildAlignedDepositSlot(parameters: {
    privateAddressStpl1: string;
    amountStroops: bigint;
    tokenAddress: string;
  }): Promise<AlignedDepositSlot> {
    const sdk = await this.getInitializedSdk();
    const privateAddressPoint = decodePrivateAddress(parameters.privateAddressStpl1);
    const scalarHex = this.sampleValidDepositScalarHex();
    const shared = sdk.ecdhSharedKey(scalarHex, privateAddressPoint.x, privateAddressPoint.y);
    const [assetHi, assetLo] = tokenAddressToAssetLeg(parameters.tokenAddress);
    const generated = sdk.generateCoinForDepositWithSharedHex(
      scalarHex,
      shared.x,
      shared.y,
      parameters.amountStroops,
      assetHi,
      assetLo,
    );
    const recipientPublicKeys =
      recipientPublicKeysDecimalFromPrivateAddress(parameters.privateAddressStpl1);
    const deposit: DepositObject = {
      value: generated.coin.value,
      nullifier: generated.coin.nullifier,
      ephemeralKeyScalar: scalarHexToFrDecimal(scalarHex),
      asset: [generated.coin.asset_hi, generated.coin.asset_lo],
      recipientPublicKeys,
    };
    return {
      deposit,
      commitment_hex: generated.commitment_hex,
      coin: generated.coin,
      depositScalarHex: scalarHex,
      precommitementHex: generated.precommitement_hex,
    };
  }

  async createAlignedShieldCoinData(parameters: {
    privateAddressStpl1: string;
    amountStroops: bigint;
    tokenAddress: string;
  }): Promise<Omit<AlignedDepositSlot, "deposit">> {
    const { commitment_hex, coin, depositScalarHex, precommitementHex } =
      await this.buildAlignedDepositSlot(parameters);
    return { commitment_hex, coin, depositScalarHex, precommitementHex };
  }

  async prepareDepositTransactProof(parameters: {
    privateAddressStpl1: string;
    coin: CoinData;
    depositScalarHex: string;
    merkleRootBytes: Buffer;
    tokenAddress: string;
  }): Promise<ProofResult> {
    const sdk = await this.getInitializedSdk();
    const stateRoot = merkleRootBufferToFrDecimal(parameters.merkleRootBytes);
    const recipientPublicKeys = recipientPublicKeysDecimalFromPrivateAddress(
      parameters.privateAddressStpl1,
    );
    const deposit = {
      value: parameters.coin.value,
      nullifier: parameters.coin.nullifier,
      ephemeralKeyScalar: scalarHexToFrDecimal(parameters.depositScalarHex),
      asset: [parameters.coin.asset_hi, parameters.coin.asset_lo] as [string, string],
      recipientPublicKeys,
    };
    const publicInput = withTokenAddressPublicInputs(
      {
        stateRoot,
        withdrawAddressHi: "0",
        withdrawAddressLo: "0",
        privKeyScalar: randomFrDecimal253(),
      },
      parameters.tokenAddress,
    );
    return sdk.proveTransaction(
      publicInput as unknown as Parameters<typeof sdk.proveTransaction>[0],
      buildPublicDepositLegs(parameters.tokenAddress, parameters.coin.value),
      ["dummy", "dummy"],
      [deposit, "dummy"],
    );
  }

  async calculateNullifierHash(nullifier: string): Promise<string> {
    const sdk = await this.getInitializedSdk();
    return sdk.calculateNullifierHash(nullifier);
  }
  async prepareWithdrawTransactProof(parameters: {
    coin: CoinData;
    state: StateFile;
    destinationStellarAddress: string;
    privKeyScalarHex: string;
    depositorEphemeralXHex: string;
    depositorEphemeralYHex: string;
    withdrawAmountStroops: bigint;
    changePrivateAddressStpl1: string | undefined;
    tokenAddress: string;
  }): Promise<ProofWithChange> {
    await this.ensureInit();
    if (!this.sdk) {
      throw new Error("SDK not initialized");
    }
    return proveWithdrawTransact({
      sdk: this.sdk,
      buildAlignedDepositSlot: (input) => this.buildAlignedDepositSlot(input),
      ...parameters,
    });
  }
  async prepareWithdrawTransactProofDual(parameters: {
    coinA: CoinData;
    coinB: CoinData;
    state: StateFile;
    destinationStellarAddress: string;
    privKeyScalarHex: string;
    depositorEphemeralAXHex: string;
    depositorEphemeralAYHex: string;
    depositorEphemeralBXHex: string;
    depositorEphemeralBYHex: string;
    withdrawAmountStroops: bigint;
    changePrivateAddressStpl1: string | undefined;
    tokenAddress: string;
  }): Promise<ProofWithChange> {
    await this.ensureInit();
    if (!this.sdk) {
      throw new Error("SDK not initialized");
    }
    return proveWithdrawTransactDual({
      sdk: this.sdk,
      buildAlignedDepositSlot: (input) => this.buildAlignedDepositSlot(input),
      coinA: parameters.coinA,
      coinB: parameters.coinB,
      state: parameters.state,
      destinationStellarAddress: parameters.destinationStellarAddress,
      privKeyScalarHex: parameters.privKeyScalarHex,
      ephemeralA: {
        xHex: parameters.depositorEphemeralAXHex,
        yHex: parameters.depositorEphemeralAYHex,
      },
      ephemeralB: {
        xHex: parameters.depositorEphemeralBXHex,
        yHex: parameters.depositorEphemeralBYHex,
      },
      withdrawAmountStroops: parameters.withdrawAmountStroops,
      changePrivateAddressStpl1: parameters.changePrivateAddressStpl1,
      tokenAddress: parameters.tokenAddress,
    });
  }
}

export const privacyPoolService = new PrivacyPoolService();
