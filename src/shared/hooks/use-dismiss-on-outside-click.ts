import { useCallback, useEffect, useRef, useState } from "react";

export function useDismissOnOutsideClick<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (ref.current?.contains(target)) {
        return;
      }
      setIsOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return { ref, isOpen, setIsOpen, toggle, close };
}
