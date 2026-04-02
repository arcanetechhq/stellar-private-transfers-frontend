import { Buffer } from 'buffer';

    /**
 * Ephemeral BabyJubJub / ECDH point (not hashed into the Merkle tree).
 */
export interface EphemeralKeyCoords {
  x: Buffer;
  y: Buffer;
}

/**
 * Storage key for tree leaves - each leaf stored by index for O(1) write on deposit
 */
 export type TreeDataKey =
  { tag: "Leaf"; values: readonly [number] } |
  { tag: "LeafCount"; values: void } |
  /**
   * Ephemeral public key (ECDH point x, y) stored per leaf; not part of the Merkle hash.
   */
  { tag: "LeafEphemeral"; values: readonly [number] };

/**
 * Storage key for nullifiers - each nullifier hash maps to bool (consumed or not)
 */
 export type NulifierDataKey =
  { tag: "Nulifier"; values: readonly [Buffer] };

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
  8 : { message: "InvalidTokenAmount" }
}

/**
 * Error Enum: Groth16Error
 */
export const Groth16Error = {
  0 : { message: "MalformedVerifyingKey" }
}
    