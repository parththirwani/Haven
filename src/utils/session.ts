import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { prisma } from '../lib/prisma';

export const SESSION_COOKIE_NAME = 'sessionId';
export const SESSION_DURATION_DAYS = 30; // Consider moving to env variable later

/**
 * Generate a cryptographically secure session ID
 * Using randomBytes(32).toString('hex') for better entropy than UUID
 */
export function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Set the session cookie with secure defaults
 */
export async function setSessionCookie(
  sessionId: string,
  expiresAt: Date
): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}

/**
 * Clear the session cookie
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Create a new session in DB + set cookie
 * Reusable and keeps logic DRY
 */
export async function createSession(userId: string) {
  const sessionId = generateSessionId();
  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000
  );

  await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      expiresAt,
    },
  });

  await setSessionCookie(sessionId, expiresAt);

  return { sessionId, expiresAt };
}