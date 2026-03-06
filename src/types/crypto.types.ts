export type Base64String = string

export interface EncryptedPayload {
  iv: Base64String
  ciphertext: Base64String
}

export type SafeUint8Array = Uint8Array<ArrayBuffer>
export type SafeArrayBuffer = ArrayBuffer