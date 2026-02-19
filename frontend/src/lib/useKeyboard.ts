import { useEffect } from "react";

type KeyHandler = (e: KeyboardEvent) => void;

export function useKeydown(key: string, handler: KeyHandler, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const listener = (e: KeyboardEvent) => {
      if (e.key === key) handler(e);
    };
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [key, handler, enabled]);
}

export function useEscape(handler: () => void, enabled = true) {
  useKeydown("Escape", handler, enabled);
}
