import type { Base64String, EncryptedPayload, SafeUint8Array } from "../types/crypto.types"

const enc = new TextEncoder()
const dec = new TextDecoder()

export async function deriveKey(password: string, keySalt: string): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password) as SafeUint8Array,
    "PBKDF2",
    false,
    ["deriveKey"]
  )

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode(keySalt) as SafeUint8Array,
      iterations: 310_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  )
}

export async function encryptData(
  key: CryptoKey,
  plainText: string
): Promise<EncryptedPayload> {
  const iv = crypto.getRandomValues(new Uint8Array(12)) as SafeUint8Array

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plainText) as SafeUint8Array
  )

  return {
    iv: bufferToBase64(iv),
    ciphertext: bufferToBase64(new Uint8Array(ciphertext) as SafeUint8Array)
  }
}

export async function decryptData(
  key: CryptoKey,
  payload: EncryptedPayload
): Promise<string> {
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBuffer(payload.iv) },
    key,
    base64ToBuffer(payload.ciphertext)
  )

  return dec.decode(decrypted)
}

export async function exportKey(key: CryptoKey): Promise<Base64String> {
  const raw = await crypto.subtle.exportKey("raw", key) as ArrayBuffer
  return bufferToBase64(new Uint8Array(raw) as SafeUint8Array)
}

export async function importKey(base64: Base64String): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    base64ToBuffer(base64),
    { name: "AES-GCM" },
    true,
    ["encrypt", "decrypt"]
  )
}


function bufferToBase64(buffer: SafeUint8Array): Base64String {
  return btoa(String.fromCharCode(...buffer))
}

function base64ToBuffer(base64: Base64String): SafeUint8Array {
  return new Uint8Array(
    atob(base64).split("").map(c => c.charCodeAt(0))
  ) as SafeUint8Array
}