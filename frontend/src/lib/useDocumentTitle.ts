import { useEffect } from "react";

export function useDocumentTitle(title: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} | EventSync` : "EventSync";
    return () => {
      document.title = prev;
    };
  }, [title]);
}
