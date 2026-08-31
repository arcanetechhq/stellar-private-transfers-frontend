import type { ProtocolRelayPorts } from "./types.js";

const directSubmitters = new Map<string, ProtocolRelayPorts["submitDirect"]>();

export function registerDirectSubmitter(
  operationId: string,
  submitDirect: ProtocolRelayPorts["submitDirect"],
): void {
  directSubmitters.set(operationId, submitDirect);
}

export function readDirectSubmitter(
  operationId: string,
): ProtocolRelayPorts["submitDirect"] | undefined {
  return directSubmitters.get(operationId);
}

export function clearDirectSubmitter(operationId: string): void {
  directSubmitters.delete(operationId);
}
