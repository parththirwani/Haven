// src/server/routers/onboarding.ts
import crypto from 'node:crypto';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { prisma } from '@/src/lib/prisma';
import {
  onboardingInputSchema,
  onboardingResultSchema,
} from '../models/onboarding';

export const onboardingRouter = router({
  getStatus: protectedProcedure
    .output(
      z.object({
        hasOnboarded: z.boolean(),
        keySalt: z.string().nullable(),
      })
    )
    .query(async ({ ctx }) => {
      const user = await prisma.user.findUnique({
        where: { id: ctx.user.id },
        select: { keySalt: true },
      });

      return {
        hasOnboarded: Boolean(user?.keySalt),
        keySalt: user?.keySalt ?? null,
      };
    }),

  onboarding: protectedProcedure
    .input(onboardingInputSchema)
    .output(onboardingResultSchema)
    .mutation(async ({ input, ctx }) => {
      // Prevent re-onboarding
      const existing = await prisma.user.findUnique({
        where: { id: ctx.user.id },
        select: { keySalt: true, username: true },
      });

      if (existing?.keySalt) {
        return {
          success: false,
          message: 'User already completed onboarding',
        };
      }

      const keySalt = crypto.randomBytes(32).toString('hex');

      try {
        await prisma.user.update({
          where: { id: ctx.user.id },
          data: {
            keySalt,
            username: input.username,
            avatar: input.avatar,
            socialLinks: input.socialLinks,
          },
        });

        return {
          success: true,
          message: 'Onboarding completed successfully',
          keySalt,
        };
      } catch (err) {
        console.error('Onboarding error:', err);
        return {
          success: false,
          message: 'Failed to save onboarding data',
        };
      }
    }),
});