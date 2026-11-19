import { isRecord } from "../model/record-value";

export function readPagingAfter(payload: unknown): string | undefined {
  if (!isRecord(payload) || !isRecord(payload.paging)) {
    return undefined;
  }
  const after = payload.paging.after;
  return typeof after === "string" && after.length > 0 ? after : undefined;
}
