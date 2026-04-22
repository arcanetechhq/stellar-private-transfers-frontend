import {EphemeralKeyCoords} from './types.js';
import {Result, Spec, AssembledTransaction, Client as ContractClient, ClientOptions as ContractClientOptions, MethodOptions} from '@stellar/stellar-sdk/contract';
import {Address} from '@stellar/stellar-sdk';
import { Buffer } from 'buffer';

export interface Client {
  /**
   * Single entrypoint: verifies `circuits/main.circom` Groth16 proof and public signals, checks
   * tree root and nullifiers, appends new output commitments (with ephemeral keys, not in Merkle),
   * then applies public token deposits / withdrawals: `publicDepositedAssets` + `publicDeposits` pull
   * from `from`, and `publicWithdrawnAssets` + `publicWithdrawals` send to the Stellar account from
   * `withdrawAddressHi` / `withdrawAddressLo`.
   *
   * Asset ids: Stellar **contract** token `C...` addresses encoded as two field elements (same 32-byte
   * split as account keys — see `circuits/main.circom`).
   *
   * Withdraw destination account: Stellar **account** Ed25519 key (G-address strkey payload) split into two
   * public field elements `withdrawAddressHi` / `withdrawAddressLo` — big-endian `u128` chunks
   * `bytes[0..16]` and `bytes[16..32]` (see `circuits/main.circom`). Avoids mod-`r` loss from a single `Fr`.
   */
  transact({ from, proof_bytes, pub_signals_bytes, encoded }: { from: string | Address; proof_bytes: Buffer; pub_signals_bytes: Buffer; encoded: Buffer }, options?: MethodOptions): Promise<AssembledTransaction<Result<null, Error>>>;
  /**
   * Gets the current merkle root of the commitment tree.
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
   * Filled-subtree frontier after the last pairwise insert (reload on the next deposit).
   */
  get_pairwise_frontier(options?: MethodOptions): Promise<AssembledTransaction<Array<Buffer>>>;
  /**
   * Gets all commitments (leaves) in the merkle tree
   */
  get_commitments(options?: MethodOptions): Promise<AssembledTransaction<Array<Buffer>>>;
  /**
   * Returns true if the given nullifier hash has already been consumed (used in a withdrawal).
   */
  is_nulifier_hash_consumed({ hash }: { hash: Buffer }, options?: MethodOptions): Promise<AssembledTransaction<boolean>>;
  /**
   * Returns true if `root` appears in the recent root history (ring buffer).
   * All-zero bytes are never accepted.
   */
  is_known_root({ root }: { root: Buffer }, options?: MethodOptions): Promise<AssembledTransaction<boolean>>;
  /**
   * Token balance held by this contract for a Stellar asset contract (`C...`).
   */
  get_token_balance({ token }: { token: string | Address }, options?: MethodOptions): Promise<AssembledTransaction<bigint>>;
  /**
   * `publicNInputs` / `publicNOutputs` configured at deploy (must match the verification key circuit).
   */
  get_public_slot_config(options?: MethodOptions): Promise<AssembledTransaction<[number, number]>>;
  /**
   * Gets the admin address (the contract deployer)
   */
  get_admin(options?: MethodOptions): Promise<AssembledTransaction<string>>;
}

export class Client extends ContractClient {
  constructor(public readonly options: ContractClientOptions) {
    super(
      new Spec(["AAAAAQAAAERFcGhlbWVyYWwgQmFieUp1Ykp1YiAvIEVDREggcG9pbnQgKG5vdCBoYXNoZWQgaW50byB0aGUgTWVya2xlIHRyZWUpLgAAAAAAAAASRXBoZW1lcmFsS2V5Q29vcmRzAAAAAAACAAAAAAAAAAF4AAAAAAAD7gAAACAAAAAAAAAAAXkAAAAAAAPuAAAAIA==", "AAAAAgAAAFRTdG9yYWdlIGtleSBmb3IgdHJlZSBsZWF2ZXMg4oCUIGVhY2ggbGVhZiBzdG9yZWQgYnkgaW5kZXggZm9yIE8oMSkgd3JpdGUgb24gZGVwb3NpdC4AAAAAAAAAC1RyZWVEYXRhS2V5AAAAAAQAAAABAAAAAAAAAARMZWFmAAAAAQAAAAQAAAAAAAAAAAAAAAlMZWFmQ291bnQAAAAAAAABAAAAVEVwaGVtZXJhbCBwdWJsaWMga2V5IChFQ0RIIHBvaW50IHgsIHkpIHN0b3JlZCBwZXIgbGVhZjsgbm90IHBhcnQgb2YgdGhlIE1lcmtsZSBoYXNoLgAAAA1MZWFmRXBoZW1lcmFsAAAAAAAAAQAAAAQAAAAAAAAAXlJpZ2h0LXNwaW5lIC8gZmlsbGVkLXN1YnRyZWUgZnJvbnRpZXIgYWZ0ZXIgdGhlIGxhc3QgYGluc2VydF90d29gIChsZW5ndGggYG1lcmtsZV9kZXB0aCAtIDFgKS4AAAAAABBQYWlyd2lzZUZyb250aWVy", "AAAAAgAAAFJTdG9yYWdlIGtleSBmb3IgbnVsbGlmaWVycyDigJQgZWFjaCBudWxsaWZpZXIgaGFzaCBtYXBzIHRvIGJvb2wgKGNvbnN1bWVkIG9yIG5vdCkuAAAAAAAAAAAAD051bGlmaWVyRGF0YUtleQAAAAABAAAAAQAAAAAAAAAITnVsaWZpZXIAAAABAAAD7gAAACA=", "AAAAAgAAAFRSaW5nIGJ1ZmZlciBvZiBoaXN0b3JpY2FsIE1lcmtsZSByb290cyAoZm9yIHByb29mcyBnZW5lcmF0ZWQgYWdhaW5zdCByZWNlbnQgc3RhdGVzKS4AAAAAAAAADlJvb3RIaXN0b3J5S2V5AAAAAAACAAAAAAAAACpOZXdlc3Qgcm9vdCBzbG90IGluZGV4IGluIHRoZSByaW5nIGJ1ZmZlci4AAAAAABBDdXJyZW50Um9vdEluZGV4AAAAAQAAAC5Sb290IHZhbHVlIGF0IHNsb3QgYGlgICgwLi5ST09UX0hJU1RPUllfU0laRSkuAAAAAAAEUm9vdAAAAAEAAAAE", "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAACwAAAAAAAAANTnVsbGlmaWVyVXNlZAAAAAAAAAEAAAAAAAAAE0luc3VmZmljaWVudEJhbGFuY2UAAAAAAgAAAAAAAAAXUHJvb2ZWZXJpZmljYXRpb25GYWlsZWQAAAAAAwAAAAAAAAAJT25seUFkbWluAAAAAAAABAAAAAAAAAAOVHJlZUF0Q2FwYWNpdHkAAAAAAAUAAAAAAAAAF0Fzc29jaWF0aW9uUm9vdE1pc21hdGNoAAAAAAYAAAAAAAAAFEludmFsaWRQdWJsaWNTaWduYWxzAAAABwAAAAAAAAASSW52YWxpZFRva2VuQW1vdW50AAAAAAAIAAAAPFByb29mIGBzdGF0ZV9yb290YCBpcyBub3QgaW4gdGhlIHJlY2VudCByb290IGhpc3Rvcnkgd2luZG93LgAAAAtVbmtub3duUm9vdAAAAAAJAAAAXkV4YWN0bHkgb25lIG91dHB1dCBjb21taXRtZW50IGlzIG5vbi16ZXJvOyBvbmx5IHplcm8vemVybyBvciB0d28gbm9uLXplcm8gb3V0cHV0cyBhcmUgYWxsb3dlZC4AAAAAABVJbnZhbGlkQ29tbWl0bWVudFBhaXIAAAAAAAAKAAAAXVN0b3JlZCBNZXJrbGUgZnJvbnRpZXIgbGVuZ3RoIGRvZXMgbm90IG1hdGNoIHRyZWUgZGVwdGggKGNvcnJ1cHQgb3Igb3V0ZGF0ZWQgc3RvcmFnZSBsYXlvdXQpLgAAAAAAABVJbnZhbGlkTWVya2xlRnJvbnRpZXIAAAAAAAAL", "AAAABQAAAAAAAAAAAAAAEkF1ZGl0RW5jb2RlZERpZ2VzdAAAAAAAAgAAAAVhdWRpdAAAAAAAAA5lbmNvZGVkX2RpZ2VzdAAAAAAAAgAAAAAAAAAMbWVzc2FnZV9uYW1lAAAAEAAAAAEAAAAAAAAABmRpZ2VzdAAAAAAADgAAAAAAAAAA", "AAAAAAAAAAAAAAANX19jb25zdHJ1Y3RvcgAAAAAAAAUAAAAAAAAACnRyZWVfZGVwdGgAAAAAAAQAAAAAAAAACHZrX2J5dGVzAAAADgAAAAAAAAAPcHVibGljX25faW5wdXRzAAAAAAQAAAAAAAAAEHB1YmxpY19uX291dHB1dHMAAAAEAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAA", "AAAAAAAAA3FTaW5nbGUgZW50cnlwb2ludDogdmVyaWZpZXMgYGNpcmN1aXRzL21haW4uY2lyY29tYCBHcm90aDE2IHByb29mIGFuZCBwdWJsaWMgc2lnbmFscywgY2hlY2tzCnRyZWUgcm9vdCBhbmQgbnVsbGlmaWVycywgYXBwZW5kcyBuZXcgb3V0cHV0IGNvbW1pdG1lbnRzICh3aXRoIGVwaGVtZXJhbCBrZXlzLCBub3QgaW4gTWVya2xlKSwKdGhlbiBhcHBsaWVzIHB1YmxpYyB0b2tlbiBkZXBvc2l0cyAvIHdpdGhkcmF3YWxzOiBgcHVibGljRGVwb3NpdGVkQXNzZXRzYCArIGBwdWJsaWNEZXBvc2l0c2AgcHVsbApmcm9tIGBmcm9tYCwgYW5kIGBwdWJsaWNXaXRoZHJhd25Bc3NldHNgICsgYHB1YmxpY1dpdGhkcmF3YWxzYCBzZW5kIHRvIHRoZSBTdGVsbGFyIGFjY291bnQgZnJvbQpgd2l0aGRyYXdBZGRyZXNzSGlgIC8gYHdpdGhkcmF3QWRkcmVzc0xvYC4KCkFzc2V0IGlkczogU3RlbGxhciAqKmNvbnRyYWN0KiogdG9rZW4gYEMuLi5gIGFkZHJlc3NlcyBlbmNvZGVkIGFzIHR3byBmaWVsZCBlbGVtZW50cyAoc2FtZSAzMi1ieXRlCnNwbGl0IGFzIGFjY291bnQga2V5cyDigJQgc2VlIGBjaXJjdWl0cy9tYWluLmNpcmNvbWApLgoKV2l0aGRyYXcgZGVzdGluYXRpb24gYWNjb3VudDogU3RlbGxhciAqKmFjY291bnQqKiBFZDI1NTE5IGtleSAoRy1hZGRyZXNzIHN0cmtleSBwYXlsb2FkKSBzcGxpdCBpbnRvIHR3bwpwdWJsaWMgZmllbGQgZWxlbWVudHMgYHdpdGhkcmF3QWRkcmVzc0hpYCAvIGB3aXRoZHJhd0FkZHJlc3NMb2Ag4oCUIGJpZy1lbmRpYW4gYHUxMjhgIGNodW5rcwpgYnl0ZXNbMC4uMTZdYCBhbmQgYGJ5dGVzWzE2Li4zMl1gIChzZWUgYGNpcmN1aXRzL21haW4uY2lyY29tYCkuIEF2b2lkcyBtb2QtYHJgIGxvc3MgZnJvbSBhIHNpbmdsZSBgRnJgLgAAAAAAAAh0cmFuc2FjdAAAAAQAAAAAAAAABGZyb20AAAATAAAAAAAAAAtwcm9vZl9ieXRlcwAAAAAOAAAAAAAAABFwdWJfc2lnbmFsc19ieXRlcwAAAAAAAA4AAAAAAAAAB2VuY29kZWQAAAAADgAAAAEAAAPpAAAAAgAAAAM=", "AAAAAAAAADRHZXRzIHRoZSBjdXJyZW50IG1lcmtsZSByb290IG9mIHRoZSBjb21taXRtZW50IHRyZWUuAAAAD2dldF9tZXJrbGVfcm9vdAAAAAAAAAAAAQAAA+4AAAAg", "AAAAAAAAAClHZXRzIHRoZSBjdXJyZW50IGRlcHRoIG9mIHRoZSBtZXJrbGUgdHJlZQAAAAAAABBnZXRfbWVya2xlX2RlcHRoAAAAAAAAAAEAAAAE", "AAAAAAAAADpHZXRzIHRoZSBudW1iZXIgb2YgY29tbWl0bWVudHMgKGxlYXZlcykgaW4gdGhlIG1lcmtsZSB0cmVlAAAAAAAUZ2V0X2NvbW1pdG1lbnRfY291bnQAAAAAAAAAAQAAAAQ=", "AAAAAAAAADJFcGhlbWVyYWwga2V5ICh4LCB5KSBmb3IgYSBsZWFmIGluZGV4LCBpZiBwcmVzZW50LgAAAAAAEmdldF9sZWFmX2VwaGVtZXJhbAAAAAAAAQAAAAAAAAAKbGVhZl9pbmRleAAAAAAABAAAAAEAAAPoAAAH0AAAABJFcGhlbWVyYWxLZXlDb29yZHMAAA==", "AAAAAAAAAFRGaWxsZWQtc3VidHJlZSBmcm9udGllciBhZnRlciB0aGUgbGFzdCBwYWlyd2lzZSBpbnNlcnQgKHJlbG9hZCBvbiB0aGUgbmV4dCBkZXBvc2l0KS4AAAAVZ2V0X3BhaXJ3aXNlX2Zyb250aWVyAAAAAAAAAAAAAAEAAAPqAAAD7gAAACA=", "AAAAAAAAADBHZXRzIGFsbCBjb21taXRtZW50cyAobGVhdmVzKSBpbiB0aGUgbWVya2xlIHRyZWUAAAAPZ2V0X2NvbW1pdG1lbnRzAAAAAAAAAAABAAAD6gAAA+4AAAAg", "AAAAAAAAAFpSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIG51bGxpZmllciBoYXNoIGhhcyBhbHJlYWR5IGJlZW4gY29uc3VtZWQgKHVzZWQgaW4gYSB3aXRoZHJhd2FsKS4AAAAAABlpc19udWxpZmllcl9oYXNoX2NvbnN1bWVkAAAAAAAAAQAAAAAAAAAEaGFzaAAAA+4AAAAgAAAAAQAAAAE=", "AAAAAAAAAGtSZXR1cm5zIHRydWUgaWYgYHJvb3RgIGFwcGVhcnMgaW4gdGhlIHJlY2VudCByb290IGhpc3RvcnkgKHJpbmcgYnVmZmVyKS4KQWxsLXplcm8gYnl0ZXMgYXJlIG5ldmVyIGFjY2VwdGVkLgAAAAANaXNfa25vd25fcm9vdAAAAAAAAAEAAAAAAAAABHJvb3QAAAPuAAAAIAAAAAEAAAAB", "AAAAAAAAAEpUb2tlbiBiYWxhbmNlIGhlbGQgYnkgdGhpcyBjb250cmFjdCBmb3IgYSBTdGVsbGFyIGFzc2V0IGNvbnRyYWN0IChgQy4uLmApLgAAAAAAEWdldF90b2tlbl9iYWxhbmNlAAAAAAAAAQAAAAAAAAAFdG9rZW4AAAAAAAATAAAAAQAAAAs=", "AAAAAAAAAGJgcHVibGljTklucHV0c2AgLyBgcHVibGljTk91dHB1dHNgIGNvbmZpZ3VyZWQgYXQgZGVwbG95IChtdXN0IG1hdGNoIHRoZSB2ZXJpZmljYXRpb24ga2V5IGNpcmN1aXQpLgAAAAAAFmdldF9wdWJsaWNfc2xvdF9jb25maWcAAAAAAAAAAAABAAAD7QAAAAIAAAAEAAAABA==", "AAAAAAAAAC5HZXRzIHRoZSBhZG1pbiBhZGRyZXNzICh0aGUgY29udHJhY3QgZGVwbG95ZXIpAAAAAAAJZ2V0X2FkbWluAAAAAAAAAAAAAAEAAAAT", "AAAABAAAAAAAAAAAAAAADEdyb3RoMTZFcnJvcgAAAAEAAAAAAAAAFU1hbGZvcm1lZFZlcmlmeWluZ0tleQAAAAAAAAA="]),
      options
    );
  }

   static deploy<T = Client>({ tree_depth, vk_bytes, public_n_inputs, public_n_outputs, admin }: { tree_depth: number; vk_bytes: Buffer; public_n_inputs: number; public_n_outputs: number; admin: string | Address }, options: MethodOptions & Omit<ContractClientOptions, 'contractId'> & { wasmHash: Buffer | string; salt?: Buffer | Uint8Array; format?: "hex" | "base64"; address?: string; }): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy({ tree_depth, vk_bytes, public_n_inputs, public_n_outputs, admin }, options);
  }
  public readonly fromJSON = {
    transact : this.txFromJSON<Result<null, Error>>,  get_merkle_root : this.txFromJSON<Buffer>,  get_merkle_depth : this.txFromJSON<number>,  get_commitment_count : this.txFromJSON<number>,  get_leaf_ephemeral : this.txFromJSON<EphemeralKeyCoords | null>,  get_pairwise_frontier : this.txFromJSON<Array<Buffer>>,  get_commitments : this.txFromJSON<Array<Buffer>>,  is_nulifier_hash_consumed : this.txFromJSON<boolean>,  is_known_root : this.txFromJSON<boolean>,  get_token_balance : this.txFromJSON<bigint>,  get_public_slot_config : this.txFromJSON<[number, number]>,  get_admin : this.txFromJSON<string>
  };
}