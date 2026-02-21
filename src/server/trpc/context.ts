import type { inferAsyncReturnType } from '@trpc/server';
import { cookies } from 'next/headers';
import { prisma } from '@/src/lib/prisma';

export async function createContext() {
  const sessionId = (await cookies()).get('sessionId')?.value;

  if (!sessionId) {
    return { user: null };
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { userId: true, expiresAt: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) await prisma.session.delete({ where: { id: sessionId } });
    (await cookies()).delete('sessionId');
    return { user: null };
  }

  return { user: { id: session.userId } };
}

export type Context = inferAsyncReturnType<typeof createContext>;