import {
  discoverEscrowNotes,
  resetEscrowTagIssueInFlightForTests,
} from "./discover-escrow-notes";
import { createMemoryEscrowTagStore } from "./persist-escrow-tags";

jest.mock("@arcanetech/privacy-sdk-stellar", () =>
  jest.requireActual("../../../../test-shims/privacy-sdk-stellar.ts"),
);

const STELLAR_ADDRESS =
  "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
const SIGNER_PUBLIC_KEY =
  "GBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBH5C";
const STORAGE_ORIGIN = "http://storage.example";
const PRIVATE_DATA_ORIGIN = "http://core.example/api/private-data";
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
    if (url.endsWith("/authorization-challenges")) {
      return jsonResponse({
        protocol: "stellar.escrow-tag",
        message: CHALLENGE_MESSAGE,
        fields: {
          stellarAddress: STELLAR_ADDRESS,
          networkPassphrase: "Test SDF Network ; September 2015",
          issuedAt: "2026-09-02T12:00:00.000Z",
          expiresAt: "2026-09-02T12:05:00.000Z",
          nonce: "aa".repeat(NONCE_BYTE_LENGTH),
          challengeMac: "mac",
        },
      });
    }
    if (url.endsWith("/authorization-completions")) {
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
            escrowNonce: "7",
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

beforeEach(() => {
  resetEscrowTagIssueInFlightForTests();
});

describe("escrow note discovery", () => {
  it("skips Core and transfers when the private-data origin is unset", async () => {
    const calls: FetchCall[] = [];
    const notes = await discoverEscrowNotes({
      transfersBaseUrl: TRANSFERS_BASE_URL,
      stellarAddress: STELLAR_ADDRESS,
      signChallenge: async () => {
        throw new Error("must not sign");
      },
      fetchImpl: createIndexFetch(calls),
      tagStore: createMemoryEscrowTagStore(),
    });
    expect(notes).toEqual([]);
    expect(calls).toEqual([]);
  });

  it("lets a recipient see a note written before they registered", async () => {
    const calls: FetchCall[] = [];
    const signedMessages: string[] = [];
    const tagStore = createMemoryEscrowTagStore();
    const notes = await discoverEscrowNotes({
      privateDataOrigin: PRIVATE_DATA_ORIGIN,
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
      tagStore,
    });
    expect(signedMessages).toEqual([CHALLENGE_MESSAGE]);
    const completionBody = JSON.parse(
      calls.find((call) => call.url.endsWith("/authorization-completions"))
        ?.body ?? "",
    ) as { fields?: { stellarAddress?: string; signerPublicKey?: string } };
    expect(completionBody.fields?.stellarAddress).toBe(STELLAR_ADDRESS);
    expect(completionBody.fields?.signerPublicKey).toBe(SIGNER_PUBLIC_KEY);
    expect(
      calls.filter((call) => call.url.endsWith("/authorization-completions")),
    ).toHaveLength(1);
    expect(tagStore.read(STELLAR_ADDRESS)?.map((entry) => entry.epoch)).toEqual([
      0, 1,
    ]);
    expect(notes.map((note) => note.txId)).toEqual([TX_BEFORE_REGISTER]);
    expect(notes[0]?.txId).toBe(TX_BEFORE_REGISTER);
    expect(JSON.stringify(notes)).not.toMatch(/stpl1/i);
    expect(tagStore.read(STELLAR_ADDRESS)?.map((entry) => entry.tag)).toEqual([
      EARLIER_TAG,
      CURRENT_TAG,
    ]);
    expect(tagStore.read(SIGNER_PUBLIC_KEY)?.map((entry) => entry.tag)).toEqual([
      EARLIER_TAG,
      CURRENT_TAG,
    ]);
  });
});

describe("escrow note discovery privacy", () => {
  it("never sends a Stellar address to the transfer backend", async () => {
    const calls: FetchCall[] = [];
    await discoverEscrowNotes({
      privateDataOrigin: PRIVATE_DATA_ORIGIN,
      transfersBaseUrl: TRANSFERS_BASE_URL,
      stellarAddress: STELLAR_ADDRESS,
      signChallenge: async () => ({
        signature: SIGNATURE,
        signerPublicKey: SIGNER_PUBLIC_KEY,
      }),
      fetchImpl: createIndexFetch(calls),
      tagStore: createMemoryEscrowTagStore(),
    });
    const transferCalls = calls.filter((call) =>
      call.url.startsWith(TRANSFERS_BASE_URL),
    );
    expect(transferCalls.length).toBeGreaterThan(0);
    const serialized = JSON.stringify(transferCalls);
    expect(serialized).not.toContain(STELLAR_ADDRESS);
    expect(serialized).not.toMatch(/G[A-Z0-9]{55}/);
    expect(calls.some((call) => call.url.startsWith(STORAGE_ORIGIN))).toBe(
      false,
    );
    expect(calls.some((call) => call.url.includes("/api/escrow-tags"))).toBe(
      false,
    );
    expect(calls.some((call) => call.url.startsWith(PRIVATE_DATA_ORIGIN))).toBe(
      true,
    );
    expect(calls.some((call) => call.url.endsWith("/records"))).toBe(false);
  });
});

describe("cached escrow tags", () => {
  it("reuses stored tags for an address without signing or issuing again", async () => {
    const calls: FetchCall[] = [];
    const tagStore = createMemoryEscrowTagStore(
      new Map([
        [
          STELLAR_ADDRESS,
          [
            { epoch: 0, tag: EARLIER_TAG },
            { epoch: 1, tag: CURRENT_TAG },
          ],
        ],
      ]),
    );
    const notes = await discoverEscrowNotes({
      privateDataOrigin: PRIVATE_DATA_ORIGIN,
      transfersBaseUrl: TRANSFERS_BASE_URL,
      stellarAddress: STELLAR_ADDRESS,
      signChallenge: async () => {
        throw new Error("must not sign stored tags");
      },
      fetchImpl: createIndexFetch(calls),
      tagStore,
    });
    expect(notes.map((note) => note.txId)).toEqual([TX_BEFORE_REGISTER]);
    expect(calls.some((call) => call.url.startsWith(STORAGE_ORIGIN))).toBe(
      false,
    );
    expect(calls.every((call) => call.url.startsWith(TRANSFERS_BASE_URL))).toBe(
      true,
    );
  });
});
