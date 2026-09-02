export type RecipientRegistryStatus =
  | "idle"
  | "checking"
  | "registered"
  | "unregistered"
  | "lookup_failed";

export function isRecipientRegistryReadyToSend(
  status: RecipientRegistryStatus,
): boolean {
  return status === "registered";
}
