/**
 * Cookie setting function for legacy browsers
 * Used only in environments that do not support the Cookie Store API.
 */
function setLegacyCookie(
  name: string,
  value: string,
  maxAge: number,
  path: string,
): void {
  const cookieString = `${name}=${value}; path=${path}; max-age=${maxAge}`;
  // Executes only in legacy browsers that do not support the Cookie Store API
  const doc = typeof document !== "undefined" ? document : null;
  if (doc) {
    doc.cookie = cookieString;
  }
}

/**
 * Sets a cookie using the Cookie Store API.
 * Uses the legacy method in browsers that do not support the Cookie Store API.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Cookie_Store_API
 */
export const setCookie = async (
  name: string,
  value: string,
  maxAge: number,
  path = "/",
): Promise<void> => {
  // When Cookie Store API is supported
  if (
    typeof window !== "undefined" &&
    "cookieStore" in window &&
    window.cookieStore
  ) {
    await window.cookieStore.set({
      name,
      value,
      path,
      expires: Date.now() + maxAge * 1000,
    });
    return;
  }

  // Fallback: Use legacy method (Browsers without Cookie Store API support)
  setLegacyCookie(name, value, maxAge, path);
};
