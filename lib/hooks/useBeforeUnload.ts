import { useEffect } from "react";

export function useBeforeUnload(shouldWarn: boolean, message = "") {
  useEffect(() => {
    if (!shouldWarn) return;

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      if (message) {
        event.returnValue = message;
        return message;
      }
      event.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", handler);

    return () => {
      window.removeEventListener("beforeunload", handler);
    };
  }, [shouldWarn, message]);
}
