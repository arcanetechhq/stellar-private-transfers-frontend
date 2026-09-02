import { discoverEscrowNotes } from "./discover-escrow-notes";
import {
  mapEscrowIndexRowToTransaction,
  mergeTransactionsWithEscrowNotes,
} from "@/entities/escrow-index";
import type { Transaction } from "@/entities/transaction";

const STELLAR_ADDRESS =
  "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
const SIGNER_PUBLIC_KEY =
  "GBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBH5C";
const STORAGE_ORIGIN = "http://storage.example";
const TRANSFERS_BASE_URL = "http://transfers.example";
const EARLIER_TAG =
  "aa901161e699ab3d4ca43cd15e575408441197eba93de07e5da6a2826d2e82d9";
const CURRENT_TAG =
  "bb91717c12bb0a89c7fa5c901c74182fc8ad6285d20a7191780fe92f992a1df8";
const TX_BEFORE_REGISTER = "tx-before-register";
const POOL_ADDRESS = "CINDEXEDPOOLADDRESS00000000000000000000000";
const CREATED_AT = "2026-01-15T00:00:00.000Z";
const CHALLENGE_MESSAGE =
  "Arcane privacy layer: issue your blinded recipient tags.\n\nWallet: GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
const HTTP_OK = 200;
const SIGNATURE = "signed-challenge";
const NONCE_BYTE_LENGTH = 16;

type FetchCall = {
  url: string;
  method: string;
  body: string;
};

function jsonResponse(body: unknown): Response {
  return {
    ok: true,
    status: HTTP_OK,
    json: async () => body,
  } as Response;
}

function recordCall(input: {
  calls: FetchCall[];
  request: RequestInfo | URL;
  init?: RequestInit;
}) {
  input.calls.push({
    url: String(input.request),
    method: input.init?.method ?? "GET",
    body: typeof input.init?.body === "string" ? input.init.body : "",
  });
}

function createIndexFetch(calls: FetchCall[]): typeof fetch {
  return async (input, init) => {
    recordCall({ calls, request: input, init });
    const url = String(input);
    if (url.endsWith("/api/escrow-tags/challenge")) {
      return jsonResponse({
        stellarAddress: STELLAR_ADDRESS,
        networkPassphrase: "Test SDF Network ; September 2015",
        issuedAt: "2026-09-02T12:00:00.000Z",
        expiresAt: "2026-09-02T12:05:00.000Z",
        nonce: "aa".repeat(NONCE_BYTE_LENGTH),
        message: CHALLENGE_MESSAGE,
        challengeMac: "mac",
      });
    }
    if (url.endsWith("/api/escrow-tags/issue")) {
      return jsonResponse({
        tags: [
          { epoch: 0, tag: EARLIER_TAG },
          { epoch: 1, tag: CURRENT_TAG },
        ],
      });
    }
    if (url.includes(`tag=${EARLIER_TAG}`)) {
      return jsonResponse({
        data: [
          {
            blindedRecipientTag: EARLIER_TAG,
            txId: TX_BEFORE_REGISTER,
            poolAddress: POOL_ADDRESS,
            seq: 0,
            createdAt: CREATED_AT,
          },
        ],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });
    }
    return jsonResponse({
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 1 },
    });
  };
}

describe("escrow note discovery", () => {
  it("skips Storage and transfers when the storage origin is unset", async () => {
    const calls: FetchCall[] = [];
    const notes = await discoverEscrowNotes({
      transfersBaseUrl: TRANSFERS_BASE_URL,
      stellarAddress: STELLAR_ADDRESS,
      signChallenge: async () => {
        throw new Error("must not sign");
      },
      fetchImpl: createIndexFetch(calls),
    });
    expect(notes).toEqual([]);
    expect(calls).toEqual([]);
  });

  it("lets a recipient see a note written before they registered", async () => {
    const calls: FetchCall[] = [];
    const signedMessages: string[] = [];
    const notes = await discoverEscrowNotes({
      storageOrigin: STORAGE_ORIGIN,
      transfersBaseUrl: TRANSFERS_BASE_URL,
      stellarAddress: STELLAR_ADDRESS,
      signChallenge: async (message) => {
        signedMessages.push(message);
        return {
          signature: SIGNATURE,
          signerPublicKey: SIGNER_PUBLIC_KEY,
        };
      },
      fetchImpl: createIndexFetch(calls),
    });
    expect(signedMessages).toEqual([CHALLENGE_MESSAGE]);
    const issueBody = JSON.parse(
      calls.find((call) => call.url.endsWith("/api/escrow-tags/issue"))?.body ??
        "",
    ) as { stellarAddress?: string; signerPublicKey?: string };
    expect(issueBody.stellarAddress).toBe(STELLAR_ADDRESS);
    expect(issueBody.signerPublicKey).toBe(SIGNER_PUBLIC_KEY);
    expect(notes.map((note) => note.txId)).toEqual([TX_BEFORE_REGISTER]);
    const history = mergeTransactionsWithEscrowNotes({
      transactions: [],
      escrowRows: notes.map((note) =>
        mapEscrowIndexRowToTransaction({
          note,
          recipientAddress: STELLAR_ADDRESS,
        }),
      ),
    });
    expect(history).toHaveLength(1);
    const shown = history[0] as Transaction;
    expect(shown.id).toContain(TX_BEFORE_REGISTER);
    expect(shown.counterparty).toBe(STELLAR_ADDRESS);
    expect(shown.counterparty.startsWith("G")).toBe(true);
    expect(JSON.stringify(shown)).not.toMatch(/stpl1/i);
  });

  it("never sends a Stellar address to the transfer backend", async () => {
    const calls: FetchCall[] = [];
    await discoverEscrowNotes({
      storageOrigin: STORAGE_ORIGIN,
      transfersBaseUrl: TRANSFERS_BASE_URL,
      stellarAddress: STELLAR_ADDRESS,
      signChallenge: async () => ({
        signature: SIGNATURE,
        signerPublicKey: SIGNER_PUBLIC_KEY,
      }),
      fetchImpl: createIndexFetch(calls),
    });
    const transferCalls = calls.filter((call) =>
      call.url.startsWith(TRANSFERS_BASE_URL),
    );
    expect(transferCalls.length).toBeGreaterThan(0);
    const serialized = JSON.stringify(transferCalls);
    expect(serialized).not.toContain(STELLAR_ADDRESS);
    expect(serialized).not.toMatch(/G[A-Z0-9]{55}/);
    expect(
      calls.some((call) => call.url.startsWith(STORAGE_ORIGIN)),
    ).toBe(true);
  });
});
