import {
  canDownloadOperationConfirmation,
  issueOperationConfirmation,
  OperationConfirmationRequestError,
  previewNotice,
  previewOperationConfirmation,
} from "./operation-confirmation-api";

const HTTP_OK = 200;
const HTTP_UNPROCESSABLE = 422;
const CLIENT_AMOUNT = "777001";
const CLIENT_PRIVATE_ADDRESS = "stpl1clientsupplied";
const SERVICE_ROW = {
  id: "11",
  date: "2026-02-01T00:00:00.000Z",
  type: "deposit",
  amount: "100",
  asset: "USDC",
  transactionId: "deposit-tx",
  contract: "C-POOL",
  chain: "stellar-testnet",
  sender: "GABC",
  recipient: "stpl1currentalice",
};

function jsonResponse(status: number, body: unknown): Response {
  return Response.json(body, { status });
}

describe("operation confirmation preview", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("keeps issuing-service rows and drops client amounts", async () => {
    globalThis.fetch = (async () =>
      jsonResponse(HTTP_OK, {
        rowCount: 1,
        readable: true,
        rows: [SERVICE_ROW],
        amount: CLIENT_AMOUNT,
        privateAddress: CLIENT_PRIVATE_ADDRESS,
      })) as typeof fetch;
    const preview = await previewOperationConfirmation({
      apiBaseUrl: "https://payments.example",
      challenge: "challenge",
      signature: "signature",
    });
    expect(preview).toEqual({
      rowCount: 1,
      readable: true,
      rows: [SERVICE_ROW],
    });
    expect(JSON.stringify(preview)).not.toContain(CLIENT_AMOUNT);
    expect(JSON.stringify(preview)).not.toContain(CLIENT_PRIVATE_ADDRESS);
    expect(canDownloadOperationConfirmation(preview, false)).toBe(true);
    expect(previewNotice(preview)).toEqual({ kind: "rows", rows: [SERVICE_ROW] });
  });

  it("allows an empty readable preview and blocks an unreadable one", async () => {
    globalThis.fetch = (async () =>
      jsonResponse(HTTP_OK, { rowCount: 0, readable: true })) as typeof fetch;
    const empty = await previewOperationConfirmation({
      apiBaseUrl: "https://payments.example",
      challenge: "challenge",
      signature: "signature",
    });
    expect(empty).toEqual({ rowCount: 0, readable: true });
    expect(canDownloadOperationConfirmation(empty, false)).toBe(true);
    expect(previewNotice(empty)).toEqual({ kind: "empty" });

    globalThis.fetch = (async () =>
      jsonResponse(HTTP_OK, {
        rowCount: 0,
        readable: false,
        blockingOperationId: "91",
      })) as typeof fetch;
    const blocked = await previewOperationConfirmation({
      apiBaseUrl: "https://payments.example",
      challenge: "challenge",
      signature: "signature",
    });
    expect(blocked).toEqual({
      rowCount: 0,
      readable: false,
      blockingOperationId: "91",
    });
    expect(canDownloadOperationConfirmation(blocked, false)).toBe(false);
    expect(previewNotice(blocked)).toEqual({
      kind: "blocking",
      operationId: "91",
    });
  });

  it("names the blocking operation when issuance fails", async () => {
    await expectIssuanceNamesTheBlocker();
  });
});

async function expectIssuanceNamesTheBlocker(): Promise<void> {
  globalThis.fetch = (async () =>
    jsonResponse(HTTP_UNPROCESSABLE, {
      message: "Operation Confirmation could not be read",
      blockingOperationId: "91",
    })) as typeof fetch;
  const error: unknown = await issueOperationConfirmation({
    apiBaseUrl: "https://payments.example",
    challenge: "challenge",
    signature: "signature",
  }).catch((error_: unknown) => error_);
  expect(error).toBeInstanceOf(OperationConfirmationRequestError);
  expect(error).toMatchObject({ blockingOperationId: "91" });
  expect(previewNotice(undefined, "91")).toEqual({
    kind: "blocking",
    operationId: "91",
  });
}
