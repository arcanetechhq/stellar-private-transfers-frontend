import type { EscrowIndexNote } from "../model/escrow-index-types.js";

const DEFAULT_PAGE_SIZE = 50;
const LIST_PATH = "/escrow-index";

type ListResponse = {
  data: EscrowIndexNote[];
};

export async function listEscrowIndexByTag(input: {
  transfersBaseUrl: string;
  tag: string;
  fetchImpl?: typeof fetch;
}): Promise<EscrowIndexNote[]> {
  const baseUrl = input.transfersBaseUrl.replace(/\/$/u, "");
  const parameters = new URLSearchParams({
    tag: input.tag,
    page: "1",
    limit: String(DEFAULT_PAGE_SIZE),
  });
  const fetchImpl = input.fetchImpl ?? globalThis.fetch;
  const response = await fetchImpl(
    `${baseUrl}${LIST_PATH}?${parameters.toString()}`,
  );
  if (!response.ok) {
    throw new Error(`Escrow index request failed: ${response.status}`);
  }
  const payload = (await response.json()) as ListResponse;
  return Array.isArray(payload.data) ? payload.data : [];
}
