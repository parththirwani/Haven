/**
 * sessionKeyStore — persists the derived master key across page refreshes.
 *
 * Security model:
 *   • sessionStorage is tab-scoped and cleared on tab close — never survives
 *     beyond the user's active session, unlike localStorage.
 *   • The raw key bytes are stored as base64. This is acceptable because
 *     sessionStorage is not accessible cross-origin and is cleared on tab close.
 *   • The server session cookie (httpOnly) is the auth layer; this is only
 *     the encryption layer.
 *   • On explicit lock / sign-out both entries are cleared.
 */

const KEY_MASTER = "haven:masterKey";
const KEY_SALT = "haven:keySalt";

/** Persist the derived CryptoKey and its salt to sessionStorage. */
export async function persistKeyToSession(
  key: CryptoKey,
  keySalt: string
): Promise<void> {
  try {
    const raw = await crypto.subtle.exportKey("raw", key);
    const b64 = btoa(String.fromCharCode(...new Uint8Array(raw)));
    sessionStorage.setItem(KEY_MASTER, b64);
    sessionStorage.setItem(KEY_SALT, keySalt);
  } catch (err) {
    console.warn("[Haven] Could not persist key to sessionStorage:", err);
  }
}

/** Load the CryptoKey and keySalt from sessionStorage, if present. */
export async function loadKeyFromSession(): Promise<{
  key: CryptoKey;
  keySalt: string;
} | null> {
  try {
    const b64 = sessionStorage.getItem(KEY_MASTER);
    const keySalt = sessionStorage.getItem(KEY_SALT);
    if (!b64 || !keySalt) return null;

    const raw = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const key = await crypto.subtle.importKey(
      "raw",
      raw,
      { name: "AES-GCM" },
      true,
      ["encrypt", "decrypt"]
    );

    return { key, keySalt };
  } catch (err) {
    console.warn("[Haven] Could not load key from sessionStorage:", err);
    clearKeyFromSession();
    return null;
  }
}

/** Wipe both entries — call on lock or sign-out. */
export function clearKeyFromSession(): void {
  sessionStorage.removeItem(KEY_MASTER);
  sessionStorage.removeItem(KEY_SALT);
}

/** Returns true if a persisted key exists (cheap sync check, no crypto). */
export function hasPersistedKey(): boolean {
  return (
    sessionStorage.getItem(KEY_MASTER) !== null &&
    sessionStorage.getItem(KEY_SALT) !== null
  );
}