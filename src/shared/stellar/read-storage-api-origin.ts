import { readClientEnvironment } from "@/shared/lib/privacy-sdk/read-client-environment.js";
import { resolveStorageApiOrigin } from "./resolve-storage-api-origin.js";

export function readStorageApiOriginFromEnvironment(): string | undefined {
  return resolveStorageApiOrigin(
    readClientEnvironment("VITE_STORAGE_API_ORIGIN"),
  );
}
