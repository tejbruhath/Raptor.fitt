export const isChromium = (): boolean => {
  if (typeof navigator === "undefined") {
    return false;
  }

  const ua = navigator.userAgent.toLowerCase();
  return ["chrome", "edg", "brave", "opera", "crios", "crmo", "chromium"].some((token) =>
    ua.includes(token)
  );
};
