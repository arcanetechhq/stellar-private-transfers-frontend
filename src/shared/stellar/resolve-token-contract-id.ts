import { normalizeSorobanContractId } from "./normalize-soroban-contract-id";

export function resolveTokenContractId(
  tokenContractRaw: string | null | undefined,
): string {
  const raw = tokenContractRaw?.trim();
  if (!raw) {
    throw new Error("Selected asset has no client contract");
  }
  return normalizeSorobanContractId(raw);
}
