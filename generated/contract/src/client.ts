import {OnboardingPayload, KytPassageAuthorization, ZkConfig, EphemeralKeyCoords, AppAuditState, ContractEvent} from './types.js';
import {Result, Spec, AssembledTransaction, Client as ContractClient, ClientOptions as ContractClientOptions, MethodOptions, ExternalExecutableRef} from '@stellar/stellar-sdk/contract';
import {Address, xdr} from '@stellar/stellar-sdk';

export interface Client {
  /**
   * Single entrypoint: verifies `circuits/main.circom` Groth16 proof and public signals, checks
   * tree root and nullifiers, appends new output commitments (with ephemeral keys, not in Merkle),
   * optionally forwards onboarding payload to the registry, then applies public token deposits /
   * withdrawals: `publicDepositedAssets` + `publicDeposits` pull from `from`, and
   * `publicWithdrawnAssets` + `publicWithdrawals` send to the Stellar account from
   * `withdrawAddressHi` / `withdrawAddressLo`.
   *
   * Asset ids: Stellar **contract** token `C...` addresses encoded as two field elements (same 32-byte
   * split as account keys — see `circuits/main.circom`).
   *
   * Withdraw destination account: Stellar **account** Ed25519 key (G-address strkey payload) split into two
   * public field elements `withdrawAddressHi` / `withdrawAddressLo` — big-endian `u128` chunks
   * `bytes[0..16]` and `bytes[16..32]` (see `circuits/main.circom`). Avoids mod-`r` loss from a single `Fr`.
   */
  transact({ from, nonce, proof_bytes, pub_signals_bytes, onboarding, kyt_authorization }: { from: string | Address; nonce: bigint; proof_bytes: Uint8Array; pub_signals_bytes: Uint8Array; onboarding: OnboardingPayload | null; kyt_authorization: KytPassageAuthorization | null }, options?: MethodOptions): Promise<AssembledTransaction<Result<null, Error>>>;
  /**
   * Gets the admin address (the contract deployer)
   */
  get_admin(options?: MethodOptions): Promise<AssembledTransaction<string>>;
  get_registry(options?: MethodOptions): Promise<AssembledTransaction<string | null>>;
  set_registry({ registry }: { registry: string | Address }, options?: MethodOptions): Promise<AssembledTransaction<void>>;
  /**
   * Registers a new per-nonce ZK circuit configuration (VK + full circuit shape). Admin-only;
   * fails if `nonce` already has a config. Validates `n_outs` is even (leaves are inserted
   * pairwise via `PairwiseLeanIMT::insert_two`), `n_audit_slots >= n_ins + n_outs`, that
   * `audit_offset`/`output_note_offset` match the formula-derived layout, and that the VK's
   * `ic` length matches the resulting total public-signal count.
   */
  add_zk_config({ nonce, vk_bytes, n_ins, n_outs, public_n_inputs, public_n_outputs, n_audit_slots, note_audit_len, audit_offset, note_output_len, output_note_offset }: { nonce: bigint; vk_bytes: Uint8Array; n_ins: number; n_outs: number; public_n_inputs: number; public_n_outputs: number; n_audit_slots: number; note_audit_len: number; audit_offset: number; note_output_len: number; output_note_offset: number }, options?: MethodOptions): Promise<AssembledTransaction<Result<null, Error>>>;
  /**
   * Reads a registered ZK config (extending its persistent TTL), or `None` if absent.
   */
  get_zk_config({ nonce }: { nonce: bigint }, options?: MethodOptions): Promise<AssembledTransaction<ZkConfig | null>>;
  /**
   * Returns true if `root` appears in the recent root history (ring buffer).
   * All-zero bytes are never accepted.
   */
  is_known_root({ root }: { root: Uint8Array }, options?: MethodOptions): Promise<AssembledTransaction<boolean>>;
  /**
   * Gets all commitments (leaves) in the merkle tree. Read-only view helper (not called from
   * `transact`/`add_zk_config` or any other state-mutating entrypoint) intended for off-chain
   * simulation/queries; its cost scales with `count`, which grows with real pool usage rather
   * than with a single caller-controlled input, so it does not let one transaction consume a
   * disproportionate share of a block's resources the way an admin/user-controlled shape
   * parameter would. Acknowledged `dos-unbounded-operation` finding.
   *
   * `leaves` is a local in-memory `Vec` (`vec![&env]`), not persistent contract storage, so
   * there is no storage-side access-control concern in the `push_back` below either;
   * acknowledged `dos-unexpected-revert-with-storage` false positive. Both acknowledgments are
   * function-level because neither detector respects a `#[allow]` placed on the loop/statement
   * itself.
   */
  get_commitments(options?: MethodOptions): Promise<AssembledTransaction<Array<Uint8Array>>>;
  /**
   * Gets the current merkle root of the commitment tree.
   */
  get_merkle_root(options?: MethodOptions): Promise<AssembledTransaction<Uint8Array>>;
  get_kyt_registry(options?: MethodOptions): Promise<AssembledTransaction<string | null>>;
  /**
   * Gets the current depth of the merkle tree
   */
  get_merkle_depth(options?: MethodOptions): Promise<AssembledTransaction<number>>;
  set_kyt_registry({ kyt_registry }: { kyt_registry: string | Address }, options?: MethodOptions): Promise<AssembledTransaction<void>>;
  /**
   * Token balance held by this contract for a Stellar asset contract (`C...`).
   */
  get_token_balance({ token }: { token: string | Address }, options?: MethodOptions): Promise<AssembledTransaction<bigint>>;
  set_app_audit_key({ application_id, audit_public_key_x, audit_public_key_y, enabled }: { application_id: Uint8Array; audit_public_key_x: Uint8Array; audit_public_key_y: Uint8Array; enabled: boolean }, options?: MethodOptions): Promise<AssembledTransaction<void>>;
  /**
   * Ephemeral key (x, y) for a leaf index, if present.
   */
  get_leaf_ephemeral({ leaf_index }: { leaf_index: number }, options?: MethodOptions): Promise<AssembledTransaction<EphemeralKeyCoords | null>>;
  /**
   * Marks a registered ZK config as deprecated; subsequent `transact` calls referencing this
   * `nonce` fail with [`Error::ZkConfigDeprecated`]. Admin-only.
   */
  deprecate_zk_config({ nonce }: { nonce: bigint }, options?: MethodOptions): Promise<AssembledTransaction<Result<null, Error>>>;
  get_app_audit_state({ application_id }: { application_id: Uint8Array }, options?: MethodOptions): Promise<AssembledTransaction<AppAuditState | null>>;
  require_kyt_passage({ passage_id }: { passage_id: Uint8Array }, options?: MethodOptions): Promise<AssembledTransaction<Result<null, Error>>>;
  /**
   * Gets the number of commitments (leaves) in the merkle tree
   */
  get_commitment_count(options?: MethodOptions): Promise<AssembledTransaction<number>>;
  /**
   * Filled-subtree frontier after the last pairwise insert (reload on the next deposit).
   */
  get_pairwise_frontier(options?: MethodOptions): Promise<AssembledTransaction<Array<Uint8Array>>>;
  /**
   * `publicNInputs` / `publicNOutputs` for the nonce-`0` ("standard") ZK config, if registered.
   * Thin backward-compatible wrapper over [`Self::get_zk_config`]; prefer reading the relevant
   * nonce's config directly for new code, since a pool may have several registered configs.
   */
  get_public_slot_config(options?: MethodOptions): Promise<AssembledTransaction<[number, number]>>;
  /**
   * Returns true if the given nullifier hash has already been consumed (used in a withdrawal).
   */
  is_nulifier_hash_consumed({ hash }: { hash: Uint8Array }, options?: MethodOptions): Promise<AssembledTransaction<boolean>>;
}

export class Client extends ContractClient {
  constructor(public readonly options: ContractClientOptions) {
    super(
      new Spec(["AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAAEwAAAAAAAAANTnVsbGlmaWVyVXNlZAAAAAAAAAEAAAAAAAAAE0luc3VmZmljaWVudEJhbGFuY2UAAAAAAgAAAAAAAAAXUHJvb2ZWZXJpZmljYXRpb25GYWlsZWQAAAAAAwAAAAAAAAAJT25seUFkbWluAAAAAAAABAAAAAAAAAAOVHJlZUF0Q2FwYWNpdHkAAAAAAAUAAAAAAAAAF0Fzc29jaWF0aW9uUm9vdE1pc21hdGNoAAAAAAYAAAAAAAAAFEludmFsaWRQdWJsaWNTaWduYWxzAAAABwAAAAAAAAASSW52YWxpZFRva2VuQW1vdW50AAAAAAAIAAAAPFByb29mIGBzdGF0ZV9yb290YCBpcyBub3QgaW4gdGhlIHJlY2VudCByb290IGhpc3Rvcnkgd2luZG93LgAAAAtVbmtub3duUm9vdAAAAAAJAAAAXkV4YWN0bHkgb25lIG91dHB1dCBjb21taXRtZW50IGlzIG5vbi16ZXJvOyBvbmx5IHplcm8vemVybyBvciB0d28gbm9uLXplcm8gb3V0cHV0cyBhcmUgYWxsb3dlZC4AAAAAABVJbnZhbGlkQ29tbWl0bWVudFBhaXIAAAAAAAAKAAAAXVN0b3JlZCBNZXJrbGUgZnJvbnRpZXIgbGVuZ3RoIGRvZXMgbm90IG1hdGNoIHRyZWUgZGVwdGggKGNvcnJ1cHQgb3Igb3V0ZGF0ZWQgc3RvcmFnZSBsYXlvdXQpLgAAAAAAABVJbnZhbGlkTWVya2xlRnJvbnRpZXIAAAAAAAALAAAASUtZVCBwYXNzYWdlIHJlZ2lzdHJ5IGlzIG5vdCBjb25maWd1cmVkIChyZXF1aXJlZCBmb3IgdGhlIGN1cnJlbnQgbGF5b3V0KS4AAAAAAAASS3l0UmVnaXN0cnlNaXNzaW5nAAAAAAAMAAAARFB1YmxpYyBub3RlIGF1ZGl0IGtleSBpcyBub3QgcmVnaXN0ZXJlZCBmb3IgYW55IGVuYWJsZWQgYXBwbGljYXRpb24uAAAAFVVua25vd25BdWRpdFB1YmxpY0tleQAAAAAAAA0AAABDUHVibGljIG5vdGUgYXVkaXQga2V5IGNvb3JkaW5hdGVzIGFyZSBub3QgYSB2YWxpZCBCYWJ5SnViSnViIHBvaW50LgAAAAAVSW52YWxpZEF1ZGl0UHVibGljS2V5AAAAAAAADgAAADRObyBgWmtDb25maWdgIGlzIHJlZ2lzdGVyZWQgZm9yIHRoZSByZXF1ZXN0ZWQgbm9uY2UuAAAAEFprQ29uZmlnTm90Rm91bmQAAAAPAAAASFRoZSBgWmtDb25maWdgIGZvciB0aGUgcmVxdWVzdGVkIG5vbmNlIGhhcyBiZWVuIGRlcHJlY2F0ZWQgYnkgdGhlIGFkbWluLgAAABJaa0NvbmZpZ0RlcHJlY2F0ZWQAAAAAABAAAABPYGFkZF96a19jb25maWdgIHdhcyBjYWxsZWQgd2l0aCBhIGBub25jZWAgdGhhdCBhbHJlYWR5IGhhcyBhIGNvbmZpZyByZWdpc3RlcmVkLgAAAAAVWmtDb25maWdBbHJlYWR5RXhpc3RzAAAAAAAAEQAAAOdgYWRkX3prX2NvbmZpZ2Agc2hhcGUgcGFyYW1ldGVycyBhcmUgaW5jb25zaXN0ZW50IChvZGQgYG5fb3V0c2AsIGluc3VmZmljaWVudApgbl9hdWRpdF9zbG90c2AsIGFuIGBhdWRpdF9vZmZzZXRgL2BvdXRwdXRfbm90ZV9vZmZzZXRgIHRoYXQgZG9lc24ndCBtYXRjaCB0aGUKZm9ybXVsYS1kZXJpdmVkIHZhbHVlLCBvciBhIFZLIHdob3NlIGBpY2AgbGVuZ3RoIGRvZXNuJ3QgbWF0Y2ggdGhlIHNoYXBlKS4AAAAAD0ludmFsaWRaa0NvbmZpZwAAAAASAAAAPmBfX2NvbnN0cnVjdG9yYCB3YXMgY2FsbGVkIHdpdGggYHRyZWVfZGVwdGggPiBNQVhfVFJFRV9ERVBUSGAuAAAAAAAQSW52YWxpZFRyZWVEZXB0aAAAABM=", "AAAAAQAAAQJBZG1pbi1tYW5hZ2VkLCBub25jZS1rZXllZCBaSyBjaXJjdWl0IGNvbmZpZ3VyYXRpb246IHZlcmlmaWNhdGlvbiBrZXkgcGx1cyBldmVyeSBkeW5hbWljCnNoYXBlIHBhcmFtZXRlciBvZiB0aGUgYFRyYW5zYWN0aW9uKC4uLilgIGNpcmN1aXQgaW5zdGFudGlhdGlvbiB1c2VkIHRvIHZlcmlmeSBhIGB0cmFuc2FjdGAKY2FsbCBmb3IgdGhhdCBub25jZSAoc2VlIGBjaXJjdWl0cy9tYWluLmNpcmNvbWAgLyBgbGlicy96azo6WmtMYXlvdXRQYXJhbXNgKS4AAAAAAAAAAAAIWmtDb25maWcAAAALAAAAAAAAAAxhdWRpdF9vZmZzZXQAAAAEAAAAAAAAAApkZXByZWNhdGVkAAAAAAABAAAAAAAAAA1uX2F1ZGl0X3Nsb3RzAAAAAAAABAAAAAAAAAAFbl9pbnMAAAAAAAAEAAAAAAAAAAZuX291dHMAAAAAAAQAAAAAAAAADm5vdGVfYXVkaXRfbGVuAAAAAAAEAAAAAAAAAA9ub3RlX291dHB1dF9sZW4AAAAABAAAAAAAAAASb3V0cHV0X25vdGVfb2Zmc2V0AAAAAAAEAAAAAAAAAA9wdWJsaWNfbl9pbnB1dHMAAAAABAAAAAAAAAAQcHVibGljX25fb3V0cHV0cwAAAAQAAAAAAAAACHZrX2J5dGVzAAAADg==", "AAAAAgAAAFRTdG9yYWdlIGtleSBmb3IgdHJlZSBsZWF2ZXMg4oCUIGVhY2ggbGVhZiBzdG9yZWQgYnkgaW5kZXggZm9yIE8oMSkgd3JpdGUgb24gZGVwb3NpdC4AAAAAAAAAC1RyZWVEYXRhS2V5AAAAAAQAAAABAAAAAAAAAARMZWFmAAAAAQAAAAQAAAAAAAAAAAAAAAlMZWFmQ291bnQAAAAAAAABAAAAVEVwaGVtZXJhbCBwdWJsaWMga2V5IChFQ0RIIHBvaW50IHgsIHkpIHN0b3JlZCBwZXIgbGVhZjsgbm90IHBhcnQgb2YgdGhlIE1lcmtsZSBoYXNoLgAAAA1MZWFmRXBoZW1lcmFsAAAAAAAAAQAAAAQAAAAAAAAAXlJpZ2h0LXNwaW5lIC8gZmlsbGVkLXN1YnRyZWUgZnJvbnRpZXIgYWZ0ZXIgdGhlIGxhc3QgYGluc2VydF90d29gIChsZW5ndGggYG1lcmtsZV9kZXB0aCAtIDFgKS4AAAAAABBQYWlyd2lzZUZyb250aWVy", "AAAAAgAAAD9QZXJzaXN0ZW50IHN0b3JhZ2Uga2V5IGZvciB0aGUgcGVyLW5vbmNlIFtgWmtDb25maWdgXSByZWdpc3RyeS4AAAAAAAAAAAtaa0NvbmZpZ0tleQAAAAABAAAAAQAAAAAAAAAGQ29uZmlnAAAAAAABAAAABg==", "AAAABQAAADJFbWl0dGVkIGJ5IFtgUHJpdmFjeVBvb2xzQ29udHJhY3Q6OnNldF9yZWdpc3RyeWBdLgAAAAAAAAAAAAtSZWdpc3RyeVNldAAAAAACAAAABWFkbWluAAAAAAAADHJlZ2lzdHJ5X3NldAAAAAEAAAAAAAAACHJlZ2lzdHJ5AAAAEwAAAAAAAAAA", "AAAAAQAAAEhQZXItYXBwbGljYXRpb24gYXVkaXQgcHVibGljIGtleSBhbGxvd2xpc3QgZW50cnkgKHJ1bnRpbWUvY29uZmlnIHN0YXRlKS4AAAAAAAAADUFwcEF1ZGl0U3RhdGUAAAAAAAADAAAAAAAAABJhdWRpdF9wdWJsaWNfa2V5X3gAAAAAA+4AAAAgAAAAAAAAABJhdWRpdF9wdWJsaWNfa2V5X3kAAAAAA+4AAAAgAAAAAAAAAAdlbmFibGVkAAAAAAE=", "AAAABQAAADNFbWl0dGVkIGJ5IFtgUHJpdmFjeVBvb2xzQ29udHJhY3Q6OmFkZF96a19jb25maWdgXS4AAAAAAAAAAA1aa0NvbmZpZ0FkZGVkAAAAAAAAAgAAAAVhZG1pbgAAAAAAAA96a19jb25maWdfYWRkZWQAAAAAAQAAAAAAAAAFbm9uY2UAAAAAAAAGAAAAAQAAAAA=", "AAAAAgAAAFRSaW5nIGJ1ZmZlciBvZiBoaXN0b3JpY2FsIE1lcmtsZSByb290cyAoZm9yIHByb29mcyBnZW5lcmF0ZWQgYWdhaW5zdCByZWNlbnQgc3RhdGVzKS4AAAAAAAAADlJvb3RIaXN0b3J5S2V5AAAAAAACAAAAAAAAACpOZXdlc3Qgcm9vdCBzbG90IGluZGV4IGluIHRoZSByaW5nIGJ1ZmZlci4AAAAAABBDdXJyZW50Um9vdEluZGV4AAAAAQAAAC5Sb290IHZhbHVlIGF0IHNsb3QgYGlgICgwLi5ST09UX0hJU1RPUllfU0laRSkuAAAAAAAEUm9vdAAAAAEAAAAE", "AAAABQAAADZFbWl0dGVkIGJ5IFtgUHJpdmFjeVBvb2xzQ29udHJhY3Q6OnNldF9reXRfcmVnaXN0cnlgXS4AAAAAAAAAAAAOS3l0UmVnaXN0cnlTZXQAAAAAAAIAAAAFYWRtaW4AAAAAAAAQa3l0X3JlZ2lzdHJ5X3NldAAAAAEAAAAAAAAACHJlZ2lzdHJ5AAAAEwAAAAAAAAAA", "AAAAAgAAAFJTdG9yYWdlIGtleSBmb3IgbnVsbGlmaWVycyDigJQgZWFjaCBudWxsaWZpZXIgaGFzaCBtYXBzIHRvIGJvb2wgKGNvbnN1bWVkIG9yIG5vdCkuAAAAAAAAAAAAD051bGlmaWVyRGF0YUtleQAAAAABAAAAAQAAAAAAAAAITnVsaWZpZXIAAAABAAAD7gAAACA=", "AAAAAQAAAERFcGhlbWVyYWwgQmFieUp1Ykp1YiAvIEVDREggcG9pbnQgKG5vdCBoYXNoZWQgaW50byB0aGUgTWVya2xlIHRyZWUpLgAAAAAAAAASRXBoZW1lcmFsS2V5Q29vcmRzAAAAAAACAAAAAAAAAAF4AAAAAAAD7gAAACAAAAAAAAAAAXkAAAAAAAPuAAAAIA==", "AAAABQAAALdPbmUgZXZlbnQgcGVyIGF1ZGl0IHNsb3QgKGAwLi5uX2F1ZGl0X3Nsb3RzYCkgaW4gYSBgdHJhbnNhY3RgIGNhbGwncyBwdWJsaWMgc2lnbmFscyDigJQgbGV0cwpvZmYtY2hhaW4gc2Nhbm5lcnMgcmVjb3ZlciBhdWRpdG9yIGNpcGhlcnRleHRzIGZyb20gZXZlbnRzIGluc3RlYWQgb2YgcmUtcGFyc2luZyBjYWxsZGF0YS4AAAAAAAAAABJBdWRpdFNsb3RFbmNyeXB0ZWQAAAAAAAIAAAAFYXVkaXQAAAAAAAAKYXVkaXRfc2xvdAAAAAAAAgAAAAAAAAAKc2xvdF9pbmRleAAAAAAABAAAAAEAAAAAAAAAB3BheWxvYWQAAAAH0AAAABVBdWRpdFNsb3RFdmVudFBheWxvYWQAAAAAAAAAAAAAAA==", "AAAABQAAAAAAAAAAAAAAEkt5dFBhc3NhZ2VUcmFuc2FjdAAAAAAAAgAAAAVhdWRpdAAAAAAAAAtreXRfcGFzc2FnZQAAAAACAAAAAAAAAApwYXNzYWdlX2lkAAAAAAPuAAAAIAAAAAEAAAAAAAAAEnB1YmxpY19zaWduYWxfaGFzaAAAAAAD7gAAACAAAAAAAAAAAA==", "AAAABQAAADlFbWl0dGVkIGJ5IFtgUHJpdmFjeVBvb2xzQ29udHJhY3Q6OmRlcHJlY2F0ZV96a19jb25maWdgXS4AAAAAAAAAAAAAElprQ29uZmlnRGVwcmVjYXRlZAAAAAAAAgAAAAVhZG1pbgAAAAAAABR6a19jb25maWdfZGVwcmVjYXRlZAAAAAEAAAAAAAAABW5vbmNlAAAAAAAABgAAAAEAAAAA", "AAAABQAAAAAAAAAAAAAAE091dHB1dE5vdGVFbmNyeXB0ZWQAAAAAAgAAAAVhdWRpdAAAAAAAAAtvdXRwdXRfbm90ZQAAAAACAAAAAAAAAA9jb21taXRtZW50X2hhc2gAAAAD7gAAACAAAAABAAAAAAAAAAdwYXlsb2FkAAAAB9AAAAAWT3V0cHV0Tm90ZUV2ZW50UGF5bG9hZAAAAAAAAAAAAAA=", "AAAAAQAAAAAAAAAAAAAAFUF1ZGl0U2xvdEV2ZW50UGF5bG9hZAAAAAAAAAQAAAAAAAAACmNpcGhlcnRleHQAAAAAAA4AAAAAAAAAC2VwaGVtZXJhbF94AAAAA+4AAAAgAAAAAAAAAAtlcGhlbWVyYWxfeQAAAAPuAAAAIAAAAAAAAAADdGFnAAAAA+4AAAAg", "AAAAAAAAA6lTaW5nbGUgZW50cnlwb2ludDogdmVyaWZpZXMgYGNpcmN1aXRzL21haW4uY2lyY29tYCBHcm90aDE2IHByb29mIGFuZCBwdWJsaWMgc2lnbmFscywgY2hlY2tzCnRyZWUgcm9vdCBhbmQgbnVsbGlmaWVycywgYXBwZW5kcyBuZXcgb3V0cHV0IGNvbW1pdG1lbnRzICh3aXRoIGVwaGVtZXJhbCBrZXlzLCBub3QgaW4gTWVya2xlKSwKb3B0aW9uYWxseSBmb3J3YXJkcyBvbmJvYXJkaW5nIHBheWxvYWQgdG8gdGhlIHJlZ2lzdHJ5LCB0aGVuIGFwcGxpZXMgcHVibGljIHRva2VuIGRlcG9zaXRzIC8Kd2l0aGRyYXdhbHM6IGBwdWJsaWNEZXBvc2l0ZWRBc3NldHNgICsgYHB1YmxpY0RlcG9zaXRzYCBwdWxsIGZyb20gYGZyb21gLCBhbmQKYHB1YmxpY1dpdGhkcmF3bkFzc2V0c2AgKyBgcHVibGljV2l0aGRyYXdhbHNgIHNlbmQgdG8gdGhlIFN0ZWxsYXIgYWNjb3VudCBmcm9tCmB3aXRoZHJhd0FkZHJlc3NIaWAgLyBgd2l0aGRyYXdBZGRyZXNzTG9gLgoKQXNzZXQgaWRzOiBTdGVsbGFyICoqY29udHJhY3QqKiB0b2tlbiBgQy4uLmAgYWRkcmVzc2VzIGVuY29kZWQgYXMgdHdvIGZpZWxkIGVsZW1lbnRzIChzYW1lIDMyLWJ5dGUKc3BsaXQgYXMgYWNjb3VudCBrZXlzIOKAlCBzZWUgYGNpcmN1aXRzL21haW4uY2lyY29tYCkuCgpXaXRoZHJhdyBkZXN0aW5hdGlvbiBhY2NvdW50OiBTdGVsbGFyICoqYWNjb3VudCoqIEVkMjU1MTkga2V5IChHLWFkZHJlc3Mgc3Rya2V5IHBheWxvYWQpIHNwbGl0IGludG8gdHdvCnB1YmxpYyBmaWVsZCBlbGVtZW50cyBgd2l0aGRyYXdBZGRyZXNzSGlgIC8gYHdpdGhkcmF3QWRkcmVzc0xvYCDigJQgYmlnLWVuZGlhbiBgdTEyOGAgY2h1bmtzCmBieXRlc1swLi4xNl1gIGFuZCBgYnl0ZXNbMTYuLjMyXWAgKHNlZSBgY2lyY3VpdHMvbWFpbi5jaXJjb21gKS4gQXZvaWRzIG1vZC1gcmAgbG9zcyBmcm9tIGEgc2luZ2xlIGBGcmAuAAAAAAAACHRyYW5zYWN0AAAABgAAAAAAAAAEZnJvbQAAABMAAAAAAAAABW5vbmNlAAAAAAAABgAAAAAAAAALcHJvb2ZfYnl0ZXMAAAAADgAAAAAAAAARcHViX3NpZ25hbHNfYnl0ZXMAAAAAAAAOAAAAAAAAAApvbmJvYXJkaW5nAAAAAAPoAAAH0AAAABFPbmJvYXJkaW5nUGF5bG9hZAAAAAAAAAAAAAARa3l0X2F1dGhvcml6YXRpb24AAAAAAAPoAAAH0AAAABdLeXRQYXNzYWdlQXV0aG9yaXphdGlvbgAAAAABAAAD6QAAAAIAAAAD", "AAAAAQAAAAAAAAAAAAAAFk91dHB1dE5vdGVFdmVudFBheWxvYWQAAAAAAAUAAAAAAAAACmNpcGhlcnRleHQAAAAAAA4AAAAAAAAAC2VwaGVtZXJhbF94AAAAA+4AAAAgAAAAAAAAAAtlcGhlbWVyYWxfeQAAAAPuAAAAIAAAAAAAAAAMb3V0cHV0X2luZGV4AAAABAAAAAAAAAADdGFnAAAAA+4AAAAg", "AAAAAAAAAC5HZXRzIHRoZSBhZG1pbiBhZGRyZXNzICh0aGUgY29udHJhY3QgZGVwbG95ZXIpAAAAAAAJZ2V0X2FkbWluAAAAAAAAAAAAAAEAAAAT", "AAAAAAAAAAAAAAAMZ2V0X3JlZ2lzdHJ5AAAAAAAAAAEAAAPoAAAAEw==", "AAAAAAAAAAAAAAAMc2V0X3JlZ2lzdHJ5AAAAAQAAAAAAAAAIcmVnaXN0cnkAAAATAAAAAA==", "AAAAAAAAAAAAAAANX19jb25zdHJ1Y3RvcgAAAAAAAAIAAAAAAAAACnRyZWVfZGVwdGgAAAAAAAQAAAAAAAAABWFkbWluAAAAAAAAEwAAAAA=", "AAAAAAAAAZpSZWdpc3RlcnMgYSBuZXcgcGVyLW5vbmNlIFpLIGNpcmN1aXQgY29uZmlndXJhdGlvbiAoVksgKyBmdWxsIGNpcmN1aXQgc2hhcGUpLiBBZG1pbi1vbmx5OwpmYWlscyBpZiBgbm9uY2VgIGFscmVhZHkgaGFzIGEgY29uZmlnLiBWYWxpZGF0ZXMgYG5fb3V0c2AgaXMgZXZlbiAobGVhdmVzIGFyZSBpbnNlcnRlZApwYWlyd2lzZSB2aWEgYFBhaXJ3aXNlTGVhbklNVDo6aW5zZXJ0X3R3b2ApLCBgbl9hdWRpdF9zbG90cyA+PSBuX2lucyArIG5fb3V0c2AsIHRoYXQKYGF1ZGl0X29mZnNldGAvYG91dHB1dF9ub3RlX29mZnNldGAgbWF0Y2ggdGhlIGZvcm11bGEtZGVyaXZlZCBsYXlvdXQsIGFuZCB0aGF0IHRoZSBWSydzCmBpY2AgbGVuZ3RoIG1hdGNoZXMgdGhlIHJlc3VsdGluZyB0b3RhbCBwdWJsaWMtc2lnbmFsIGNvdW50LgAAAAAADWFkZF96a19jb25maWcAAAAAAAALAAAAAAAAAAVub25jZQAAAAAAAAYAAAAAAAAACHZrX2J5dGVzAAAADgAAAAAAAAAFbl9pbnMAAAAAAAAEAAAAAAAAAAZuX291dHMAAAAAAAQAAAAAAAAAD3B1YmxpY19uX2lucHV0cwAAAAAEAAAAAAAAABBwdWJsaWNfbl9vdXRwdXRzAAAABAAAAAAAAAANbl9hdWRpdF9zbG90cwAAAAAAAAQAAAAAAAAADm5vdGVfYXVkaXRfbGVuAAAAAAAEAAAAAAAAAAxhdWRpdF9vZmZzZXQAAAAEAAAAAAAAAA9ub3RlX291dHB1dF9sZW4AAAAABAAAAAAAAAASb3V0cHV0X25vdGVfb2Zmc2V0AAAAAAAEAAAAAQAAA+kAAAACAAAAAw==", "AAAAAAAAAFFSZWFkcyBhIHJlZ2lzdGVyZWQgWksgY29uZmlnIChleHRlbmRpbmcgaXRzIHBlcnNpc3RlbnQgVFRMKSwgb3IgYE5vbmVgIGlmIGFic2VudC4AAAAAAAANZ2V0X3prX2NvbmZpZwAAAAAAAAEAAAAAAAAABW5vbmNlAAAAAAAABgAAAAEAAAPoAAAH0AAAAAhaa0NvbmZpZw==", "AAAAAAAAAGtSZXR1cm5zIHRydWUgaWYgYHJvb3RgIGFwcGVhcnMgaW4gdGhlIHJlY2VudCByb290IGhpc3RvcnkgKHJpbmcgYnVmZmVyKS4KQWxsLXplcm8gYnl0ZXMgYXJlIG5ldmVyIGFjY2VwdGVkLgAAAAANaXNfa25vd25fcm9vdAAAAAAAAAEAAAAAAAAABHJvb3QAAAPuAAAAIAAAAAEAAAAB", "AAAAAAAAA2NHZXRzIGFsbCBjb21taXRtZW50cyAobGVhdmVzKSBpbiB0aGUgbWVya2xlIHRyZWUuIFJlYWQtb25seSB2aWV3IGhlbHBlciAobm90IGNhbGxlZCBmcm9tCmB0cmFuc2FjdGAvYGFkZF96a19jb25maWdgIG9yIGFueSBvdGhlciBzdGF0ZS1tdXRhdGluZyBlbnRyeXBvaW50KSBpbnRlbmRlZCBmb3Igb2ZmLWNoYWluCnNpbXVsYXRpb24vcXVlcmllczsgaXRzIGNvc3Qgc2NhbGVzIHdpdGggYGNvdW50YCwgd2hpY2ggZ3Jvd3Mgd2l0aCByZWFsIHBvb2wgdXNhZ2UgcmF0aGVyCnRoYW4gd2l0aCBhIHNpbmdsZSBjYWxsZXItY29udHJvbGxlZCBpbnB1dCwgc28gaXQgZG9lcyBub3QgbGV0IG9uZSB0cmFuc2FjdGlvbiBjb25zdW1lIGEKZGlzcHJvcG9ydGlvbmF0ZSBzaGFyZSBvZiBhIGJsb2NrJ3MgcmVzb3VyY2VzIHRoZSB3YXkgYW4gYWRtaW4vdXNlci1jb250cm9sbGVkIHNoYXBlCnBhcmFtZXRlciB3b3VsZC4gQWNrbm93bGVkZ2VkIGBkb3MtdW5ib3VuZGVkLW9wZXJhdGlvbmAgZmluZGluZy4KCmBsZWF2ZXNgIGlzIGEgbG9jYWwgaW4tbWVtb3J5IGBWZWNgIChgdmVjIVsmZW52XWApLCBub3QgcGVyc2lzdGVudCBjb250cmFjdCBzdG9yYWdlLCBzbwp0aGVyZSBpcyBubyBzdG9yYWdlLXNpZGUgYWNjZXNzLWNvbnRyb2wgY29uY2VybiBpbiB0aGUgYHB1c2hfYmFja2AgYmVsb3cgZWl0aGVyOwphY2tub3dsZWRnZWQgYGRvcy11bmV4cGVjdGVkLXJldmVydC13aXRoLXN0b3JhZ2VgIGZhbHNlIHBvc2l0aXZlLiBCb3RoIGFja25vd2xlZGdtZW50cyBhcmUKZnVuY3Rpb24tbGV2ZWwgYmVjYXVzZSBuZWl0aGVyIGRldGVjdG9yIHJlc3BlY3RzIGEgYCNbYWxsb3ddYCBwbGFjZWQgb24gdGhlIGxvb3Avc3RhdGVtZW50Cml0c2VsZi4AAAAAD2dldF9jb21taXRtZW50cwAAAAAAAAAAAQAAA+oAAAPuAAAAIA==", "AAAAAAAAADRHZXRzIHRoZSBjdXJyZW50IG1lcmtsZSByb290IG9mIHRoZSBjb21taXRtZW50IHRyZWUuAAAAD2dldF9tZXJrbGVfcm9vdAAAAAAAAAAAAQAAA+4AAAAg", "AAAAAAAAAAAAAAAQZ2V0X2t5dF9yZWdpc3RyeQAAAAAAAAABAAAD6AAAABM=", "AAAAAAAAAClHZXRzIHRoZSBjdXJyZW50IGRlcHRoIG9mIHRoZSBtZXJrbGUgdHJlZQAAAAAAABBnZXRfbWVya2xlX2RlcHRoAAAAAAAAAAEAAAAE", "AAAAAAAAAAAAAAAQc2V0X2t5dF9yZWdpc3RyeQAAAAEAAAAAAAAADGt5dF9yZWdpc3RyeQAAABMAAAAA", "AAAAAAAAAEpUb2tlbiBiYWxhbmNlIGhlbGQgYnkgdGhpcyBjb250cmFjdCBmb3IgYSBTdGVsbGFyIGFzc2V0IGNvbnRyYWN0IChgQy4uLmApLgAAAAAAEWdldF90b2tlbl9iYWxhbmNlAAAAAAAAAQAAAAAAAAAFdG9rZW4AAAAAAAATAAAAAQAAAAs=", "AAAAAAAAAAAAAAARc2V0X2FwcF9hdWRpdF9rZXkAAAAAAAAEAAAAAAAAAA5hcHBsaWNhdGlvbl9pZAAAAAAD7gAAACAAAAAAAAAAEmF1ZGl0X3B1YmxpY19rZXlfeAAAAAAD7gAAACAAAAAAAAAAEmF1ZGl0X3B1YmxpY19rZXlfeQAAAAAD7gAAACAAAAAAAAAAB2VuYWJsZWQAAAAAAQAAAAA=", "AAAAAAAAADJFcGhlbWVyYWwga2V5ICh4LCB5KSBmb3IgYSBsZWFmIGluZGV4LCBpZiBwcmVzZW50LgAAAAAAEmdldF9sZWFmX2VwaGVtZXJhbAAAAAAAAQAAAAAAAAAKbGVhZl9pbmRleAAAAAAABAAAAAEAAAPoAAAH0AAAABJFcGhlbWVyYWxLZXlDb29yZHMAAA==", "AAAAAAAAAJVNYXJrcyBhIHJlZ2lzdGVyZWQgWksgY29uZmlnIGFzIGRlcHJlY2F0ZWQ7IHN1YnNlcXVlbnQgYHRyYW5zYWN0YCBjYWxscyByZWZlcmVuY2luZyB0aGlzCmBub25jZWAgZmFpbCB3aXRoIFtgRXJyb3I6OlprQ29uZmlnRGVwcmVjYXRlZGBdLiBBZG1pbi1vbmx5LgAAAAAAABNkZXByZWNhdGVfemtfY29uZmlnAAAAAAEAAAAAAAAABW5vbmNlAAAAAAAABgAAAAEAAAPpAAAAAgAAAAM=", "AAAAAAAAAAAAAAATZ2V0X2FwcF9hdWRpdF9zdGF0ZQAAAAABAAAAAAAAAA5hcHBsaWNhdGlvbl9pZAAAAAAD7gAAACAAAAABAAAD6AAAB9AAAAANQXBwQXVkaXRTdGF0ZQAAAA==", "AAAAAAAAAAAAAAATcmVxdWlyZV9reXRfcGFzc2FnZQAAAAABAAAAAAAAAApwYXNzYWdlX2lkAAAAAAPuAAAAIAAAAAEAAAPpAAAAAgAAAAM=", "AAAAAAAAADpHZXRzIHRoZSBudW1iZXIgb2YgY29tbWl0bWVudHMgKGxlYXZlcykgaW4gdGhlIG1lcmtsZSB0cmVlAAAAAAAUZ2V0X2NvbW1pdG1lbnRfY291bnQAAAAAAAAAAQAAAAQ=", "AAAAAAAAAFRGaWxsZWQtc3VidHJlZSBmcm9udGllciBhZnRlciB0aGUgbGFzdCBwYWlyd2lzZSBpbnNlcnQgKHJlbG9hZCBvbiB0aGUgbmV4dCBkZXBvc2l0KS4AAAAVZ2V0X3BhaXJ3aXNlX2Zyb250aWVyAAAAAAAAAAAAAAEAAAPqAAAD7gAAACA=", "AAAAAAAAAQ5gcHVibGljTklucHV0c2AgLyBgcHVibGljTk91dHB1dHNgIGZvciB0aGUgbm9uY2UtYDBgICgic3RhbmRhcmQiKSBaSyBjb25maWcsIGlmIHJlZ2lzdGVyZWQuClRoaW4gYmFja3dhcmQtY29tcGF0aWJsZSB3cmFwcGVyIG92ZXIgW2BTZWxmOjpnZXRfemtfY29uZmlnYF07IHByZWZlciByZWFkaW5nIHRoZSByZWxldmFudApub25jZSdzIGNvbmZpZyBkaXJlY3RseSBmb3IgbmV3IGNvZGUsIHNpbmNlIGEgcG9vbCBtYXkgaGF2ZSBzZXZlcmFsIHJlZ2lzdGVyZWQgY29uZmlncy4AAAAAABZnZXRfcHVibGljX3Nsb3RfY29uZmlnAAAAAAAAAAAAAQAAA+0AAAACAAAABAAAAAQ=", "AAAAAAAAAFpSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIG51bGxpZmllciBoYXNoIGhhcyBhbHJlYWR5IGJlZW4gY29uc3VtZWQgKHVzZWQgaW4gYSB3aXRoZHJhd2FsKS4AAAAAABlpc19udWxpZmllcl9oYXNoX2NvbnN1bWVkAAAAAAAAAQAAAAAAAAAEaGFzaAAAA+4AAAAgAAAAAQAAAAE=", "AAAABAAAAAAAAAAAAAAADEdyb3RoMTZFcnJvcgAAAAIAAAAAAAAAFU1hbGZvcm1lZFZlcmlmeWluZ0tleQAAAAAAAAAAAACcYFByb29mOjpmcm9tX2J5dGVzYCByZWNlaXZlZCBhIGBwcm9vZl9ieXRlc2AgYXJndW1lbnQgdGhhdCBpcyB0b28gc2hvcnQgKG9yIG90aGVyd2lzZQpmYWlscyB0byBwYXJzZSBhcyBgYSB8fCBiIHx8IGNgKSBmb3IgdGhlIGZpeGVkIEcxL0cyIGVuY29kaW5nIGxlbmd0aHMuAAAADk1hbGZvcm1lZFByb29mAAAAAAAB", "AAAAAQAAAD5QbGFpbnRleHQgbm90ZSBmaWVsZHMgc3RvcmVkIGluIHJlZ2lzdHJ5IGZvciBvbmJvYXJkaW5nIGNsYWltLgAAAAAAAAAAAA1QbGFpbnRleHROb3RlAAAAAAAABgAAAAAAAAAIYXNzZXRfaGkAAAPuAAAAIAAAAAAAAAAIYXNzZXRfbG8AAAPuAAAAIAAAAFZNdXN0IHJlbWFpbiBgTm9uZWA7IHJlZ2lzdHJ5IHJlamVjdHMgcGF5bG9hZHMgdGhhdCBleHBvc2UgdGhlIHNlbmRlciBlcGhlbWVyYWwgc2NhbGFyLgAAAAAAGmRlcG9zaXRlZF9lcGhlbWVyYWxfc2NhbGFyAAAAAAPoAAAD7gAAACAAAAAAAAAACW51bGxpZmllcgAAAAAAA+4AAAAgAAAAAAAAAAZzZWNyZXQAAAAAA+4AAAAgAAAAAAAAAAV2YWx1ZQAAAAAAAAs=", "AAAAAQAAAAAAAAAAAAAAEEt5dFBhc3NhZ2VSZWNvcmQAAAABAAAAAAAAABFleHBpcmVzX2F0X2xlZGdlcgAAAAAAAAQ=", "AAAAAQAAAAAAAAAAAAAAEU9uYm9hcmRpbmdQYXlsb2FkAAAAAAAABgAAAAAAAAAVZW5jcnlwdGVkX3ByaXZhdGVfa2V5AAAAAAAADgAAAAAAAAAFbm90ZXMAAAAAAAfQAAAAElBlbmRpbmdOb3RlUGF5bG9hZAAAAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAAHHByaXZhdGVfYWRkcmVzc19yZWdpc3RyYXRpb24AAAfQAAAAIk9wdGlvbmFsUHJpdmF0ZUFkZHJlc3NSZWdpc3RyYXRpb24AAAAAAAAAAAARdGVtcF9wdWJsaWNfa2V5X3gAAAAAAAPuAAAAIAAAAAAAAAARdGVtcF9wdWJsaWNfa2V5X3kAAAAAAAPuAAAAIA==", "AAAAAQAAAAAAAAAAAAAAElBlbmRpbmdOb3RlUGF5bG9hZAAAAAAAAQAAAAAAAAAFbm90ZXMAAAAAAAPqAAAH0AAAAA1QbGFpbnRleHROb3RlAAAA", "AAAAAQAAAAAAAAAAAAAAFFByaXZhdGVBZGRyZXNzUmVjb3JkAAAABAAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAAxwdWJsaWNfa2V5X3gAAAPuAAAAIAAAAAAAAAAMcHVibGljX2tleV95AAAD7gAAACAAAAAAAAAAEXVwZGF0ZWRfYXRfbGVkZ2VyAAAAAAAABA==", "AAAAAQAAAAAAAAAAAAAAFlBlbmRpbmdOdWxsaWZpZXJSZWNvcmQAAAAAAAcAAAAAAAAAEWNyZWF0ZWRfYXRfbGVkZ2VyAAAAAAAABAAAAAAAAAAKY3JlYXRlZF9ieQAAAAAAEwAAAAAAAAAVZW5jcnlwdGVkX3ByaXZhdGVfa2V5AAAAAAAADgAAAAAAAAAEbm90ZQAAB9AAAAANUGxhaW50ZXh0Tm90ZQAAAAAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAABF0ZW1wX3B1YmxpY19rZXlfeAAAAAAAA+4AAAAgAAAAAAAAABF0ZW1wX3B1YmxpY19rZXlfeQAAAAAAA+4AAAAg", "AAAAAQAAAAAAAAAAAAAAF0t5dFBhc3NhZ2VBdXRob3JpemF0aW9uAAAAAAIAAAAAAAAAEWV4cGlyYXRpb25fbGVkZ2VyAAAAAAAABAAAAAAAAAAJc2lnbmF0dXJlAAAAAAAD7gAAAEA=", "AAAAAQAAAAAAAAAAAAAAGlByaXZhdGVBZGRyZXNzUmVnaXN0cmF0aW9uAAAAAAADAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAADHB1YmxpY19rZXlfeAAAA+4AAAAgAAAAAAAAAAxwdWJsaWNfa2V5X3kAAAPuAAAAIA==", "AAAAAgAAAAAAAAAAAAAAIk9wdGlvbmFsUHJpdmF0ZUFkZHJlc3NSZWdpc3RyYXRpb24AAAAAAAIAAAAAAAAAAAAAAAROb25lAAAAAQAAAAAAAAAEU29tZQAAAAEAAAfQAAAAGlByaXZhdGVBZGRyZXNzUmVnaXN0cmF0aW9uAAA="]),
      options
    );
  }

   static deploy<T = Client>({ tree_depth, admin }: { tree_depth: number; admin: string | Address }, options: MethodOptions & Omit<ContractClientOptions, 'contractId'> & { salt?: Uint8Array; address?: string; } & ({ wasmHash: Uint8Array | string; format?: "hex" | "base64"; externalRef?: never; } | { externalRef: ExternalExecutableRef; wasmHash?: never; format?: never; })): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy({ tree_depth, admin }, options);
  }
  public readonly fromJson = {
    transact : this.txFromJson<Result<null, Error>>,  get_admin : this.txFromJson<string>,  get_registry : this.txFromJson<string | null>,  set_registry : this.txFromJson<void>,  add_zk_config : this.txFromJson<Result<null, Error>>,  get_zk_config : this.txFromJson<ZkConfig | null>,  is_known_root : this.txFromJson<boolean>,  get_commitments : this.txFromJson<Array<Uint8Array>>,  get_merkle_root : this.txFromJson<Uint8Array>,  get_kyt_registry : this.txFromJson<string | null>,  get_merkle_depth : this.txFromJson<number>,  set_kyt_registry : this.txFromJson<void>,  get_token_balance : this.txFromJson<bigint>,  set_app_audit_key : this.txFromJson<void>,  get_leaf_ephemeral : this.txFromJson<EphemeralKeyCoords | null>,  deprecate_zk_config : this.txFromJson<Result<null, Error>>,  get_app_audit_state : this.txFromJson<AppAuditState | null>,  require_kyt_passage : this.txFromJson<Result<null, Error>>,  get_commitment_count : this.txFromJson<number>,  get_pairwise_frontier : this.txFromJson<Array<Uint8Array>>,  get_public_slot_config : this.txFromJson<[number, number]>,  is_nulifier_hash_consumed : this.txFromJson<boolean>
  };

  /** @deprecated Use fromJson instead. */
  public readonly fromJSON = this.fromJson;

  /**
   * Parse a raw contract event (topics + data) into a typed {@link ContractEvent}.
   */
  parseEvent(topics: xdr.ScVal[] | string[], data: xdr.ScVal | string): ContractEvent | undefined {
    return this.spec.parseEvent(topics, data) as ContractEvent | undefined;
  }
  /**
   * Build a topics filter row for the "RegistrySet" event, for use in `Api.EventFilter.topics` when calling `server.getEvents`. Omitted fields match any value.
   */
  registrySetEventFilter(): string[] {
    return this.spec.eventTopicFilter("RegistrySet");
  }
  /**
   * Build a topics filter row for the "ZkConfigAdded" event, for use in `Api.EventFilter.topics` when calling `server.getEvents`. Omitted fields match any value.
   */
  zkConfigAddedEventFilter(topicValues?: { nonce?: bigint }): string[] {
    return this.spec.eventTopicFilter("ZkConfigAdded", topicValues);
  }
  /**
   * Build a topics filter row for the "KytRegistrySet" event, for use in `Api.EventFilter.topics` when calling `server.getEvents`. Omitted fields match any value.
   */
  kytRegistrySetEventFilter(): string[] {
    return this.spec.eventTopicFilter("KytRegistrySet");
  }
  /**
   * Build a topics filter row for the "AuditSlotEncrypted" event, for use in `Api.EventFilter.topics` when calling `server.getEvents`. Omitted fields match any value.
   */
  auditSlotEncryptedEventFilter(topicValues?: { slot_index?: number }): string[] {
    return this.spec.eventTopicFilter("AuditSlotEncrypted", topicValues);
  }
  /**
   * Build a topics filter row for the "KytPassageTransact" event, for use in `Api.EventFilter.topics` when calling `server.getEvents`. Omitted fields match any value.
   */
  kytPassageTransactEventFilter(topicValues?: { passage_id?: Uint8Array }): string[] {
    return this.spec.eventTopicFilter("KytPassageTransact", topicValues);
  }
  /**
   * Build a topics filter row for the "ZkConfigDeprecated" event, for use in `Api.EventFilter.topics` when calling `server.getEvents`. Omitted fields match any value.
   */
  zkConfigDeprecatedEventFilter(topicValues?: { nonce?: bigint }): string[] {
    return this.spec.eventTopicFilter("ZkConfigDeprecated", topicValues);
  }
  /**
   * Build a topics filter row for the "OutputNoteEncrypted" event, for use in `Api.EventFilter.topics` when calling `server.getEvents`. Omitted fields match any value.
   */
  outputNoteEncryptedEventFilter(topicValues?: { commitment_hash?: Uint8Array }): string[] {
    return this.spec.eventTopicFilter("OutputNoteEncrypted", topicValues);
  }
}