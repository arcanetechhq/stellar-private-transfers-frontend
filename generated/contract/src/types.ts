import {Address} from '@stellar/stellar-sdk';

    /**
 * Error Enum: Error
 */
export const Error = {
  1 : { message: "NullifierUsed" },
  2 : { message: "InsufficientBalance" },
  3 : { message: "ProofVerificationFailed" },
  4 : { message: "OnlyAdmin" },
  5 : { message: "TreeAtCapacity" },
  6 : { message: "AssociationRootMismatch" },
  7 : { message: "InvalidPublicSignals" },
  8 : { message: "InvalidTokenAmount" },
  /**
   * Proof `state_root` is not in the recent root history window.
   */
  9 : { message: "UnknownRoot" },
  /**
   * Exactly one output commitment is non-zero; only zero/zero or two non-zero outputs are allowed.
   */
  10 : { message: "InvalidCommitmentPair" },
  /**
   * Stored Merkle frontier length does not match tree depth (corrupt or outdated storage layout).
   */
  11 : { message: "InvalidMerkleFrontier" },
  /**
   * KYT passage registry is not configured (required for the current layout).
   */
  12 : { message: "KytRegistryMissing" },
  /**
   * Public note audit key is not registered for any enabled application.
   */
  13 : { message: "UnknownAuditPublicKey" },
  /**
   * Public note audit key coordinates are not a valid BabyJubJub point.
   */
  14 : { message: "InvalidAuditPublicKey" },
  /**
   * No `ZkConfig` is registered for the requested nonce.
   */
  15 : { message: "ZkConfigNotFound" },
  /**
   * The `ZkConfig` for the requested nonce has been deprecated by the admin.
   */
  16 : { message: "ZkConfigDeprecated" },
  /**
   * `add_zk_config` was called with a `nonce` that already has a config registered.
   */
  17 : { message: "ZkConfigAlreadyExists" },
  /**
   * `add_zk_config` shape parameters are inconsistent (odd `n_outs`, insufficient
   * `n_audit_slots`, an `audit_offset`/`output_note_offset` that doesn't match the
   * formula-derived value, or a VK whose `ic` length doesn't match the shape).
   */
  18 : { message: "InvalidZkConfig" },
  /**
   * `__constructor` was called with `tree_depth > MAX_TREE_DEPTH`.
   */
  19 : { message: "InvalidTreeDepth" }
}

/**
 * Admin-managed, nonce-keyed ZK circuit configuration: verification key plus every dynamic
 * shape parameter of the `Transaction(...)` circuit instantiation used to verify a `transact`
 * call for that nonce (see `circuits/main.circom` / `libs/zk::ZkLayoutParams`).
 */
export interface ZkConfig {
  audit_offset: number;
  deprecated: boolean;
  n_audit_slots: number;
  n_ins: number;
  n_outs: number;
  note_audit_len: number;
  note_output_len: number;
  output_note_offset: number;
  public_n_inputs: number;
  public_n_outputs: number;
  vk_bytes: Uint8Array;
}

/**
 * Storage key for tree leaves — each leaf stored by index for O(1) write on deposit.
 */
 export type TreeDataKey =
  { tag: "Leaf"; values: readonly [number] } |
  { tag: "LeafCount"; values: void } |
  /**
   * Ephemeral public key (ECDH point x, y) stored per leaf; not part of the Merkle hash.
   */
  { tag: "LeafEphemeral"; values: readonly [number] } |
  /**
   * Right-spine / filled-subtree frontier after the last `insert_two` (length `merkle_depth - 1`).
   */
  { tag: "PairwiseFrontier"; values: void };

/**
 * Persistent storage key for the per-nonce [`ZkConfig`] registry.
 */
 export type ZkConfigKey =
  { tag: "Config"; values: readonly [bigint] };

/**
 * Emitted by [`PrivacyPoolsContract::set_registry`].
 */
export interface RegistrySetEvent {
  name: "RegistrySet";
  data: {
    registry: string;
  };
}

/**
 * Per-application audit public key allowlist entry (runtime/config state).
 */
export interface AppAuditState {
  audit_public_key_x: Uint8Array;
  audit_public_key_y: Uint8Array;
  enabled: boolean;
}

/**
 * Emitted by [`PrivacyPoolsContract::add_zk_config`].
 */
export interface ZkConfigAddedEvent {
  name: "ZkConfigAdded";
  data: {
    nonce: bigint;
  };
}

/**
 * Ring buffer of historical Merkle roots (for proofs generated against recent states).
 */
 export type RootHistoryKey =
  /**
   * Newest root slot index in the ring buffer.
   */
  { tag: "CurrentRootIndex"; values: void } |
  /**
   * Root value at slot `i` (0..ROOT_HISTORY_SIZE).
   */
  { tag: "Root"; values: readonly [number] };

/**
 * Emitted by [`PrivacyPoolsContract::set_kyt_registry`].
 */
export interface KytRegistrySetEvent {
  name: "KytRegistrySet";
  data: {
    registry: string;
  };
}

/**
 * Storage key for nullifiers — each nullifier hash maps to bool (consumed or not).
 */
 export type NulifierDataKey =
  { tag: "Nulifier"; values: readonly [Uint8Array] };

/**
 * Ephemeral BabyJubJub / ECDH point (not hashed into the Merkle tree).
 */
export interface EphemeralKeyCoords {
  x: Uint8Array;
  y: Uint8Array;
}

/**
 * One event per audit slot (`0..n_audit_slots`) in a `transact` call's public signals — lets
 * off-chain scanners recover auditor ciphertexts from events instead of re-parsing calldata.
 */
export interface AuditSlotEncryptedEvent {
  name: "AuditSlotEncrypted";
  data: {
    slot_index: number;
    payload: AuditSlotEventPayload;
  };
}

/**
 * Event: KytPassageTransact
 */
export interface KytPassageTransactEvent {
  name: "KytPassageTransact";
  data: {
    passage_id: Uint8Array;
    public_signal_hash: Uint8Array;
  };
}

/**
 * Emitted by [`PrivacyPoolsContract::deprecate_zk_config`].
 */
export interface ZkConfigDeprecatedEvent {
  name: "ZkConfigDeprecated";
  data: {
    nonce: bigint;
  };
}

/**
 * Event: OutputNoteEncrypted
 */
export interface OutputNoteEncryptedEvent {
  name: "OutputNoteEncrypted";
  data: {
    commitment_hash: Uint8Array;
    payload: OutputNoteEventPayload;
  };
}

/**
 * Struct: AuditSlotEventPayload
 */
export interface AuditSlotEventPayload {
  ciphertext: Uint8Array;
  ephemeral_x: Uint8Array;
  ephemeral_y: Uint8Array;
  tag: Uint8Array;
}

/**
 * Struct: OutputNoteEventPayload
 */
export interface OutputNoteEventPayload {
  ciphertext: Uint8Array;
  ephemeral_x: Uint8Array;
  ephemeral_y: Uint8Array;
  output_index: number;
  tag: Uint8Array;
}

/**
 * Error Enum: Groth16Error
 */
export const Groth16Error = {
  0 : { message: "MalformedVerifyingKey" },
  /**
   * `Proof::from_bytes` received a `proof_bytes` argument that is too short (or otherwise
   * fails to parse as `a || b || c`) for the fixed G1/G2 encoding lengths.
   */
  1 : { message: "MalformedProof" }
}

/**
 * Plaintext note fields stored in registry for onboarding claim.
 */
export interface PlaintextNote {
  asset_hi: Uint8Array;
  asset_lo: Uint8Array;
  /**
   * Must remain `None`; registry rejects payloads that expose the sender ephemeral scalar.
   */
  deposited_ephemeral_scalar: Uint8Array | null;
  nullifier: Uint8Array;
  secret: Uint8Array;
  value: bigint;
}

/**
 * Struct: KytPassageRecord
 */
export interface KytPassageRecord {
  expires_at_ledger: number;
}

/**
 * Struct: OnboardingPayload
 */
export interface OnboardingPayload {
  encrypted_private_key: Uint8Array;
  notes: PendingNotePayload;
  owner: string;
  private_address_registration: OptionalPrivateAddressRegistration;
  temp_public_key_x: Uint8Array;
  temp_public_key_y: Uint8Array;
}

/**
 * Struct: PendingNotePayload
 */
export interface PendingNotePayload {
  notes: Array<PlaintextNote>;
}

/**
 * Struct: PrivateAddressRecord
 */
export interface PrivateAddressRecord {
  owner: string;
  public_key_x: Uint8Array;
  public_key_y: Uint8Array;
  updated_at_ledger: number;
}

/**
 * Struct: PendingNullifierRecord
 */
export interface PendingNullifierRecord {
  created_at_ledger: number;
  created_by: string;
  encrypted_private_key: Uint8Array;
  note: PlaintextNote;
  owner: string;
  temp_public_key_x: Uint8Array;
  temp_public_key_y: Uint8Array;
}

/**
 * Struct: KytPassageAuthorization
 */
export interface KytPassageAuthorization {
  expiration_ledger: number;
  signature: Uint8Array;
}

/**
 * Struct: PrivateAddressRegistration
 */
export interface PrivateAddressRegistration {
  owner: string;
  public_key_x: Uint8Array;
  public_key_y: Uint8Array;
}

/**
 * Union: OptionalPrivateAddressRegistration
 */
 export type OptionalPrivateAddressRegistration =
  { tag: "None"; values: void } |
  { tag: "Some"; values: readonly [PrivateAddressRegistration] };
    export type ContractEvent = RegistrySetEvent | ZkConfigAddedEvent | KytRegistrySetEvent | AuditSlotEncryptedEvent | KytPassageTransactEvent | ZkConfigDeprecatedEvent | OutputNoteEncryptedEvent;
    