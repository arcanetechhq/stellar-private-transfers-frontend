const KYT_INSPECT_PATH = "/kyt/passages/inspect";

function readRequestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") {
    return input;
  }
  if (input instanceof URL) {
    return input.href;
  }
  return input.url;
}

function isHtmlBody(contentType: string, bodyText: string): boolean {
  if (contentType.includes("text/html")) {
    return true;
  }
  const head = bodyText.trimStart().slice(0, 64).toLowerCase();
  return head.startsWith("<!doctype") || head.startsWith("<html");
}

function buildHtmlAsJsonResponse(status: number, preview: string): Response {
  const safeStatus = status >= 400 ? status : 502;
  return new Response(
    JSON.stringify({
      message: `KYT inspect returned HTML instead of JSON (HTTP ${status})`,
      error: "Bad Gateway",
      statusCode: safeStatus,
      preview: preview.slice(0, 180),
    }),
    {
      status: safeStatus,
      headers: { "content-type": "application/json" },
    },
  );
}

export function installKytInspectFetchGuard(): void {
  const originalFetch = globalThis.fetch.bind(globalThis);
  globalThis.fetch = async (input, init) => {
    const response = await originalFetch(input, init);
    const url = readRequestUrl(input);
    if (!url.includes(KYT_INSPECT_PATH)) {
      return response;
    }
    const contentType = response.headers.get("content-type") ?? "";
    const preview = await response.clone().text();
    if (!isHtmlBody(contentType, preview)) {
      return response;
    }
    console.error(
      "[kyt-inspect] non-JSON HTML response",
      response.status,
      url,
      preview.slice(0, 180),
    );
    return buildHtmlAsJsonResponse(response.status, preview);
  };
}
