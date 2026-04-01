export function errorToMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === "string") {
      return message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

export function isSignMessageUnsupportedError(error: unknown): boolean {
  const message = errorToMessage(error).toLowerCase();
  return (
    message.includes("signmessage") ||
    message.includes("sign message") ||
    message.includes("does not support") ||
    message.includes("sep-43")
  );
}
