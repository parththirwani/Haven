import { prisma } from '@/src/lib/prisma';
import { ProfileUpdateError, ProfileUpdateResult, ProfileUpdateResultSchema, ProfileUpdateSuccess, updateProfileSchema } from '../models/profile';
import { protectedProcedure, router } from '../trpc';

export const profileRouter = router({
  updateprofile: protectedProcedure
  .input(updateProfileSchema)
  .output(ProfileUpdateResultSchema)
  .mutation(async ({ input, ctx }): Promise<ProfileUpdateResult> => {
    try {
      await prisma.user.update({
        where: { id: ctx.user.id },
        data: {
          username: input.username,  
          avatar:   input.avatar,

          ...(input.socialLinks !== undefined && {
            socialLinks: {
              deleteMany: {},

              createMany: {
                data: Object.entries(input.socialLinks)
                  .filter(([, url]) => typeof url === 'string' && url.trim() !== '')
                  .map(([platform, url]) => ({
                    platform,
                    url: url as string,
                  })),
              },
            },
          }),
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