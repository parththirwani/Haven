import { prisma } from '@/src/lib/prisma';
import {
  BaseProfileSchema,
  ProfileUpdateResultSchema,
  ProfileUpdateSuccess,
  ProfileUpdateError,
  ProfileUpdateResult,
} from '../models/profile';
import { protectedProcedure, router } from '../trpc';

export const profileRouter = router({
  updateProfile: protectedProcedure
    .input(BaseProfileSchema)
    .output(ProfileUpdateResultSchema)
    .mutation(async ({ input, ctx }): Promise<ProfileUpdateResult> => {
      try {
        await prisma.user.update({
          where: { id: ctx.user.id },
          data: {
            username: input.username,
            avatar: input.avatar,
            socialLinks: input.socialLinks,
          },
        });

        return {
          success: true,
          message: 'Profile updated successfully',
        } satisfies ProfileUpdateSuccess;
      } catch (err) {
        console.error('Profile update failed:', err);

        return {
          success: false,
          message:
            err instanceof Error
              ? err.message
              : 'Failed to update profile. Please try again.',
        } satisfies ProfileUpdateError;
      }
    }),
});