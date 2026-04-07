import { useCallback, useState } from "react";

const COPY_FEEDBACK_MS_DEFAULT = 2000;

export function useCopy(text: string) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_FEEDBACK_MS_DEFAULT);
    } catch {
      return;
    }
  }, [text]);

  return { copied, handleCopy };
}
