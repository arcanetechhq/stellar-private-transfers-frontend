export function fileURLToPath(fileUrl: string | URL): string {
  const url = typeof fileUrl === "string" ? new URL(fileUrl) : fileUrl;
  if (url.protocol !== "file:") {
    throw new Error("fileURLToPath: URL must use file: protocol");
  }
  return decodeURIComponent(url.pathname);
}
