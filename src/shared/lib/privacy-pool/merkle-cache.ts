import { Buffer } from "buffer";

const FR_ORDER =
  0x73_ED_A7_53_29_9D_7D_48_33_39_D8_08_09_A1_D8_05_53_BD_A4_02_FF_FE_5B_FE_FF_FF_FF_FF_00_00_00_01n;

const CACHE_KEY_PREFIX = "stellar:merkle:";

function cacheKey(contractId: string): string {
  return `${CACHE_KEY_PREFIX}${contractId}`;
}

export function bufferToDecimal(buf: Buffer): string {
  const hex = buf.toString("hex");
  const bigintFromHex = BigInt(`0x${hex}`);
  const reduced = bigintFromHex % FR_ORDER;
  return reduced.toString();
}

export interface MerkleState {
  commitments: string[];
  updatedAt: number;
  merkleRootHex?: string;
}

export function getCachedMerkleState(contractId: string): MerkleState | undefined {
  try {
    const raw = localStorage.getItem(cacheKey(contractId));
    if (!raw) {
      return undefined;
    }
    return JSON.parse(raw) as MerkleState;
  } catch {
    return undefined;
  }
}

export function setCachedMerkleState(parameters: {
  contractId: string;
  commitments: string[];
  merkleRootHex?: string;
}): void {
  const payload: MerkleState = {
    commitments: parameters.commitments,
    updatedAt: Date.now(),
  };
  if (parameters.merkleRootHex !== undefined) {
    payload.merkleRootHex = parameters.merkleRootHex;
  }
  localStorage.setItem(cacheKey(parameters.contractId), JSON.stringify(payload));
}

export function commitmentsBuffersToDecimal(buffers: Buffer[]): string[] {
  return buffers.map((bufferRow) => bufferToDecimal(bufferRow));
}
