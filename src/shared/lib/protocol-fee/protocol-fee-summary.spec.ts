import { formatRequiredFeeDisplay } from "./format-required-fee-display.js";
import { protocolFeeQuoteRequest } from "./quote-request.js";
import { quoteProtocolFee } from "./quote-protocol-fee.js";
import { shouldQuoteProtocolFee } from "./should-quote-protocol-fee.js";

const USDC = "USDC";
const FEE_ASSET = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
const COLLECTOR = "stpl1feecollectorprivateaddress";
const DECIMALS = 7;
const ONE_MINOR = "1";
const DEPOSIT_INSTRUCTED = "1000000000";
const DEPOSIT_FEE = "10000000";
const TRANSFER_INSTRUCTED = "400000000";
const TRANSFER_FEE = "4000000";
const WITHDRAW_INSTRUCTED = "200000000";
const WITHDRAW_FEE = "2000000";
const FEE_RATE = "0.01";
const API_BASE = "http://transfers.test/api";
const HTTP_CREATED = 201;

describe("protocol fee summary", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("formats a one-minor-unit Required Fee from integer units and decimals", () => {
    expect(
      formatRequiredFeeDisplay({
        requiredFeeMinor: ONE_MINOR,
        decimals: DECIMALS,
        ticker: USDC,
      }),
    ).toBe("0.0000001 USDC");
    expect(
      formatRequiredFeeDisplay({
        requiredFeeMinor: DEPOSIT_FEE,
        decimals: DECIMALS,
        ticker: USDC,
      }),
    ).toBe("1 USDC");
    expect(
      formatRequiredFeeDisplay({
        requiredFeeMinor: TRANSFER_FEE,
        decimals: DECIMALS,
        ticker: USDC,
      }),
    ).toBe("0.4 USDC");
    expect(
      formatRequiredFeeDisplay({
        requiredFeeMinor: WITHDRAW_FEE,
        decimals: DECIMALS,
        ticker: USDC,
      }),
    ).toBe("0.2 USDC");
  });

  it("does not collapse dust to 0 or 0.00", () => {
    const display = formatRequiredFeeDisplay({
      requiredFeeMinor: ONE_MINOR,
      decimals: DECIMALS,
      ticker: USDC,
    });
    expect(display).not.toBe("0 USDC");
    expect(display).not.toBe("0.00 USDC");
    expect(display).not.toMatch(/^0(\.0+)? /u);
  });

  it("quotes Required Fee from the transfer service without secrets", async () => {
    const fetchMock = jest.fn(async () =>
      new Response(
        JSON.stringify({
          requiredFee: DEPOSIT_FEE,
          feeAsset: FEE_ASSET,
          feeCollectorPrivateAddress: COLLECTOR,
          feeRate: FEE_RATE,
        }),
        { status: HTTP_CREATED, headers: { "content-type": "application/json" } },
      ),
    );
    jest.spyOn(globalThis, "fetch").mockImplementation(fetchMock);

    const quote = await quoteProtocolFee({
      apiBaseUrl: API_BASE,
      request: protocolFeeQuoteRequest({
        kind: "deposit",
        feeAsset: FEE_ASSET,
        instructedMinor: DEPOSIT_INSTRUCTED,
      }),
    });

    expect(quote).toEqual({
      requiredFee: DEPOSIT_FEE,
      feeAsset: FEE_ASSET,
      feeCollectorPrivateAddress: COLLECTOR,
      feeRate: FEE_RATE,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(String(url)).toBe(`${API_BASE}/kyt/fees/quote`);
    const body = JSON.parse(String((init as RequestInit | undefined)?.body)) as Record<
      string,
      unknown
    >;
    expect(body).toEqual({
      feeAsset: FEE_ASSET,
      publicDepositAmount: DEPOSIT_INSTRUCTED,
      spendsNotes: false,
    });
    expect(body).not.toHaveProperty("secret");
    expect(body).not.toHaveProperty("notes");
  });

  it("builds transfer and withdraw quote requests from instructed amounts", () => {
    expect(
      protocolFeeQuoteRequest({
        kind: "transfer",
        feeAsset: FEE_ASSET,
        instructedMinor: TRANSFER_INSTRUCTED,
      }),
    ).toEqual({
      feeAsset: FEE_ASSET,
      transferInstructedAmount: TRANSFER_INSTRUCTED,
      spendsNotes: true,
    });
    expect(
      protocolFeeQuoteRequest({
        kind: "withdraw",
        feeAsset: FEE_ASSET,
        instructedMinor: WITHDRAW_INSTRUCTED,
      }),
    ).toEqual({
      feeAsset: FEE_ASSET,
      publicWithdrawalAmount: WITHDRAW_INSTRUCTED,
      spendsNotes: true,
    });
  });

  it("does not invent a protocol fee for escrow sweep or claim", () => {
    expect(shouldQuoteProtocolFee("deposit")).toBe(true);
    expect(shouldQuoteProtocolFee("transfer")).toBe(true);
    expect(shouldQuoteProtocolFee("withdraw")).toBe(true);
    expect(shouldQuoteProtocolFee("sweep")).toBe(false);
    expect(shouldQuoteProtocolFee("claim")).toBe(false);
  });
});
