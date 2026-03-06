import crypto from 'node:crypto';
import { z } from 'zod';
import { onboardingInputSchema, onboardingResultSchema } from "../models/onboarding";
import { protectedProcedure, router } from "../trpc";
import { prisma } from '@/src/lib/prisma';

export const onboardingRouter = router({
  /**
   * Returns whether this user has completed onboarding.
   * Frontend uses this after sign-in to decide: onboarding flow vs vault unlock.
   * keySalt is returned so the client can re-derive the master key without
   * ever having seen it on the server.
   */
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
          message: 'Onboarded successfully',
          keySalt,
        };
      } catch (err) {
        console.error('Onboarding Error ' + err);
      }

      return {
        success: false,
        message: 'Failed to complete onboarding',
      };
    }),
});
