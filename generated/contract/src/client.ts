import {EphemeralKeyCoords} from './types.js';
import {Result, Spec, AssembledTransaction, Client as ContractClient, ClientOptions as ContractClientOptions, MethodOptions} from '@stellar/stellar-sdk/contract';
import {Address} from '@stellar/stellar-sdk';
import { Buffer } from 'buffer';

export interface Client {
  /**
   * Single entrypoint: verifies `circuits/main.circom` Groth16 proof and public signals, checks
   * tree root and nullifiers, appends new output commitments (with ephemeral keys, not in Merkle),
   * then applies public token deposit / withdrawal from public signal amounts.
   *
   * Withdraw destination: Stellar **account** Ed25519 key (G-address strkey payload) split into two
   * public field elements `withdrawAddressHi` / `withdrawAddressLo` — big-endian `u128` chunks
   * `bytes[0..16]` and `bytes[16..32]` (see `circuits/main.circom`). Avoids mod-`r` loss from a single `Fr`.
   */
  transact({ from, proof_bytes, pub_signals_bytes, encoded }: { from: string | Address; proof_bytes: Buffer; pub_signals_bytes: Buffer; encoded: Buffer }, options?: MethodOptions): Promise<AssembledTransaction<Result<null, Error>>>;
  /**
   * Gets the current merkle root of the commitment tree
   */
  get_merkle_root(options?: MethodOptions): Promise<AssembledTransaction<Buffer>>;
  /**
   * Gets the current depth of the merkle tree
   */
  get_merkle_depth(options?: MethodOptions): Promise<AssembledTransaction<number>>;
  /**
   * Gets the number of commitments (leaves) in the merkle tree
   */
  get_commitment_count(options?: MethodOptions): Promise<AssembledTransaction<number>>;
  /**
   * Ephemeral key (x, y) for a leaf index, if present.
   */
  get_leaf_ephemeral({ leaf_index }: { leaf_index: number }, options?: MethodOptions): Promise<AssembledTransaction<EphemeralKeyCoords | null>>;
  /**
   * Gets all commitments (leaves) in the merkle tree
   */
  get_commitments(options?: MethodOptions): Promise<AssembledTransaction<Array<Buffer>>>;
  /**
   * Returns true if the given nullifier hash has already been consumed (used in a withdrawal).
   */
  is_nulifier_hash_consumed({ hash }: { hash: Buffer }, options?: MethodOptions): Promise<AssembledTransaction<boolean>>;
  /**
   * Gets the balance of the configured token held by the contract
   */
  get_balance(options?: MethodOptions): Promise<AssembledTransaction<bigint>>;
  /**
   * Gets the admin address (the contract deployer)
   */
  get_admin(options?: MethodOptions): Promise<AssembledTransaction<string>>;
}

export class Client extends ContractClient {
  constructor(public readonly options: ContractClientOptions) {
    super(
      new Spec(["AAAAAQAAAERFcGhlbWVyYWwgQmFieUp1Ykp1YiAvIEVDREggcG9pbnQgKG5vdCBoYXNoZWQgaW50byB0aGUgTWVya2xlIHRyZWUpLgAAAAAAAAASRXBoZW1lcmFsS2V5Q29vcmRzAAAAAAACAAAAAAAAAAF4AAAAAAAD7gAAACAAAAAAAAAAAXkAAAAAAAPuAAAAIA==", "AAAAAgAAAFFTdG9yYWdlIGtleSBmb3IgdHJlZSBsZWF2ZXMgLSBlYWNoIGxlYWYgc3RvcmVkIGJ5IGluZGV4IGZvciBPKDEpIHdyaXRlIG9uIGRlcG9zaXQAAAAAAAAAAAAAC1RyZWVEYXRhS2V5AAAAAAMAAAABAAAAAAAAAARMZWFmAAAAAQAAAAQAAAAAAAAAAAAAAAlMZWFmQ291bnQAAAAAAAABAAAAVEVwaGVtZXJhbCBwdWJsaWMga2V5IChFQ0RIIHBvaW50IHgsIHkpIHN0b3JlZCBwZXIgbGVhZjsgbm90IHBhcnQgb2YgdGhlIE1lcmtsZSBoYXNoLgAAAA1MZWFmRXBoZW1lcmFsAAAAAAAAAQAAAAQ=", "AAAAAgAAAE9TdG9yYWdlIGtleSBmb3IgbnVsbGlmaWVycyAtIGVhY2ggbnVsbGlmaWVyIGhhc2ggbWFwcyB0byBib29sIChjb25zdW1lZCBvciBub3QpAAAAAAAAAAAPTnVsaWZpZXJEYXRhS2V5AAAAAAEAAAABAAAAAAAAAAhOdWxpZmllcgAAAAEAAAPuAAAAIA==", "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAACAAAAAAAAAANTnVsbGlmaWVyVXNlZAAAAAAAAAEAAAAAAAAAE0luc3VmZmljaWVudEJhbGFuY2UAAAAAAgAAAAAAAAAXUHJvb2ZWZXJpZmljYXRpb25GYWlsZWQAAAAAAwAAAAAAAAAJT25seUFkbWluAAAAAAAABAAAAAAAAAAOVHJlZUF0Q2FwYWNpdHkAAAAAAAUAAAAAAAAAF0Fzc29jaWF0aW9uUm9vdE1pc21hdGNoAAAAAAYAAAAAAAAAFEludmFsaWRQdWJsaWNTaWduYWxzAAAABwAAAAAAAAASSW52YWxpZFRva2VuQW1vdW50AAAAAAAI", "AAAABQAAAAAAAAAAAAAAEkF1ZGl0RW5jb2RlZERpZ2VzdAAAAAAAAgAAAAVhdWRpdAAAAAAAAA5lbmNvZGVkX2RpZ2VzdAAAAAAAAgAAAAAAAAAMbWVzc2FnZV9uYW1lAAAAEAAAAAEAAAAAAAAABmRpZ2VzdAAAAAAADgAAAAAAAAAA", "AAAAAAAAAAAAAAANX19jb25zdHJ1Y3RvcgAAAAAAAAQAAAAAAAAACnRyZWVfZGVwdGgAAAAAAAQAAAAAAAAACHZrX2J5dGVzAAAADgAAAAAAAAANdG9rZW5fYWRkcmVzcwAAAAAAABMAAAAAAAAABWFkbWluAAAAAAAAEwAAAAA=", "AAAAAAAAAixTaW5nbGUgZW50cnlwb2ludDogdmVyaWZpZXMgYGNpcmN1aXRzL21haW4uY2lyY29tYCBHcm90aDE2IHByb29mIGFuZCBwdWJsaWMgc2lnbmFscywgY2hlY2tzCnRyZWUgcm9vdCBhbmQgbnVsbGlmaWVycywgYXBwZW5kcyBuZXcgb3V0cHV0IGNvbW1pdG1lbnRzICh3aXRoIGVwaGVtZXJhbCBrZXlzLCBub3QgaW4gTWVya2xlKSwKdGhlbiBhcHBsaWVzIHB1YmxpYyB0b2tlbiBkZXBvc2l0IC8gd2l0aGRyYXdhbCBmcm9tIHB1YmxpYyBzaWduYWwgYW1vdW50cy4KCldpdGhkcmF3IGRlc3RpbmF0aW9uOiBTdGVsbGFyICoqYWNjb3VudCoqIEVkMjU1MTkga2V5IChHLWFkZHJlc3Mgc3Rya2V5IHBheWxvYWQpIHNwbGl0IGludG8gdHdvCnB1YmxpYyBmaWVsZCBlbGVtZW50cyBgd2l0aGRyYXdBZGRyZXNzSGlgIC8gYHdpdGhkcmF3QWRkcmVzc0xvYCDigJQgYmlnLWVuZGlhbiBgdTEyOGAgY2h1bmtzCmBieXRlc1swLi4xNl1gIGFuZCBgYnl0ZXNbMTYuLjMyXWAgKHNlZSBgY2lyY3VpdHMvbWFpbi5jaXJjb21gKS4gQXZvaWRzIG1vZC1gcmAgbG9zcyBmcm9tIGEgc2luZ2xlIGBGcmAuAAAACHRyYW5zYWN0AAAABAAAAAAAAAAEZnJvbQAAABMAAAAAAAAAC3Byb29mX2J5dGVzAAAAAA4AAAAAAAAAEXB1Yl9zaWduYWxzX2J5dGVzAAAAAAAADgAAAAAAAAAHZW5jb2RlZAAAAAAOAAAAAQAAA+kAAAACAAAAAw==", "AAAAAAAAADNHZXRzIHRoZSBjdXJyZW50IG1lcmtsZSByb290IG9mIHRoZSBjb21taXRtZW50IHRyZWUAAAAAD2dldF9tZXJrbGVfcm9vdAAAAAAAAAAAAQAAA+4AAAAg", "AAAAAAAAAClHZXRzIHRoZSBjdXJyZW50IGRlcHRoIG9mIHRoZSBtZXJrbGUgdHJlZQAAAAAAABBnZXRfbWVya2xlX2RlcHRoAAAAAAAAAAEAAAAE", "AAAAAAAAADpHZXRzIHRoZSBudW1iZXIgb2YgY29tbWl0bWVudHMgKGxlYXZlcykgaW4gdGhlIG1lcmtsZSB0cmVlAAAAAAAUZ2V0X2NvbW1pdG1lbnRfY291bnQAAAAAAAAAAQAAAAQ=", "AAAAAAAAADJFcGhlbWVyYWwga2V5ICh4LCB5KSBmb3IgYSBsZWFmIGluZGV4LCBpZiBwcmVzZW50LgAAAAAAEmdldF9sZWFmX2VwaGVtZXJhbAAAAAAAAQAAAAAAAAAKbGVhZl9pbmRleAAAAAAABAAAAAEAAAPoAAAH0AAAABJFcGhlbWVyYWxLZXlDb29yZHMAAA==", "AAAAAAAAADBHZXRzIGFsbCBjb21taXRtZW50cyAobGVhdmVzKSBpbiB0aGUgbWVya2xlIHRyZWUAAAAPZ2V0X2NvbW1pdG1lbnRzAAAAAAAAAAABAAAD6gAAA+4AAAAg", "AAAAAAAAAFpSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIG51bGxpZmllciBoYXNoIGhhcyBhbHJlYWR5IGJlZW4gY29uc3VtZWQgKHVzZWQgaW4gYSB3aXRoZHJhd2FsKS4AAAAAABlpc19udWxpZmllcl9oYXNoX2NvbnN1bWVkAAAAAAAAAQAAAAAAAAAEaGFzaAAAA+4AAAAgAAAAAQAAAAE=", "AAAAAAAAAD1HZXRzIHRoZSBiYWxhbmNlIG9mIHRoZSBjb25maWd1cmVkIHRva2VuIGhlbGQgYnkgdGhlIGNvbnRyYWN0AAAAAAAAC2dldF9iYWxhbmNlAAAAAAAAAAABAAAACw==", "AAAAAAAAAC5HZXRzIHRoZSBhZG1pbiBhZGRyZXNzICh0aGUgY29udHJhY3QgZGVwbG95ZXIpAAAAAAAJZ2V0X2FkbWluAAAAAAAAAAAAAAEAAAAT", "AAAABAAAAAAAAAAAAAAADEdyb3RoMTZFcnJvcgAAAAEAAAAAAAAAFU1hbGZvcm1lZFZlcmlmeWluZ0tleQAAAAAAAAA="]),
      options
    );
  }

   static deploy<T = Client>({ tree_depth, vk_bytes, token_address, admin }: { tree_depth: number; vk_bytes: Buffer; token_address: string | Address; admin: string | Address }, options: MethodOptions & Omit<ContractClientOptions, 'contractId'> & { wasmHash: Buffer | string; salt?: Buffer | Uint8Array; format?: "hex" | "base64"; address?: string; }): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy({ tree_depth, vk_bytes, token_address, admin }, options);
  }
  public readonly fromJSON = {
    transact : this.txFromJSON<Result<null, Error>>,  get_merkle_root : this.txFromJSON<Buffer>,  get_merkle_depth : this.txFromJSON<number>,  get_commitment_count : this.txFromJSON<number>,  get_leaf_ephemeral : this.txFromJSON<EphemeralKeyCoords | null>,  get_commitments : this.txFromJSON<Array<Buffer>>,  is_nulifier_hash_consumed : this.txFromJSON<boolean>,  get_balance : this.txFromJSON<bigint>,  get_admin : this.txFromJSON<string>
  };
}