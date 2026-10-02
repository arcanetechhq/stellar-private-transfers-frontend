import { readClientEnvironment } from "@/shared/lib/privacy-sdk/read-client-environment.js";
import { normalizePrivateDataOrigin } from "@/shared/stellar/normalize-private-data-origin.js";

export function readPrivateDataOriginFromEnvironment(): string | undefined {
  return normalizePrivateDataOrigin(
    readClientEnvironment("VITE_PRIVATE_DATA_ORIGIN"),
  );
}
