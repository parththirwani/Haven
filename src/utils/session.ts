import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "sessionId";
export const SESSION_DURATION_DAYS = 30;

export function generateSessionId() {
  return crypto.randomUUID();
}

export async function setSessionCookie(sessionId: string, expiresAt: Date) {
  (await cookies()).set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete(SESSION_COOKIE_NAME);
}