import * as argon2 from 'argon2';
import { prisma } from '@/src/lib/prisma';
import { publicProcedure, router } from '../trpc';
import { clearSessionCookie, createSession, SESSION_COOKIE_NAME } from '@/src/utils/session';
import { AuthResultSchema, SignInSchema, SignUpSchema } from '../models/auth';
import { cookies } from 'next/headers';

export const authRouter = router({
  signup: publicProcedure
    .input(SignUpSchema)
    .output(AuthResultSchema)
    .mutation(async ({ input }) => {
      try {
        const { email, password, username } = input;

        // Check for existing email
        const existingEmail = await prisma.user.findUnique({
          where: { email },
          select: { id: true },
        });
        if (existingEmail) {
          return { success: false, message: 'Email already in use' };
        }

        // Check for existing username
        const existingUsername = await prisma.user.findUnique({
          where: { username },
          select: { id: true },
        });
        if (existingUsername) {
          return { success: false, message: 'Username already taken' };
        }

        // Hash password with Argon2id (recommended modern standard)
        const hashedPassword = await argon2.hash(password, {
          type: argon2.argon2id,
          memoryCost: 65536,   // 64 MiB
          timeCost: 3,
          parallelism: 4,
        });

        // Atomic transaction: create user + session
        const newUser = await prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: {
              email,
              password: hashedPassword,
              username,
            },
          });
          await createSession(user.id);
          return user;
        });

        return {
          success: true,
          message: 'Account created successfully',
          userId: newUser.id,
        };
      } catch (error) {
        console.error('Signup error:', error);
        return {
          success: false,
          message: 'Failed to create account. Please try again.',
        };
      }
    }),

  signin: publicProcedure
    .input(SignInSchema)
    .output(AuthResultSchema)
    .mutation(async ({ input }) => {
      try {
        const { email, password } = input;

        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, password: true },
        });

        if (!user || !(await argon2.verify(user.password, password))) {
          return { success: false, message: 'Invalid email or password' };
        }

        // Security: Invalidate all previous sessions
        await prisma.session.deleteMany({
          where: { userId: user.id },
        });

        await createSession(user.id);

        return {
          success: true,
          message: 'Signed in successfully',
          userId: user.id,
        };
      } catch (error) {
        console.error('Signin error:', error);
        return {
          success: false,
          message: 'Sign in failed. Please try again.',
        };
      }
    }),

  signout: publicProcedure.mutation(async () => {
    try {
      const cookieStore = await cookies();
      const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

      if (sessionId) {
        // Delete the specific session
        await prisma.session.deleteMany({
          where: { id: sessionId },
        });
      }

      await clearSessionCookie();

      return {
        success: true,
        message: 'Signed out successfully',
      };
    } catch (error) {
      console.error('Signout error:', error);
      return {
        success: false,
        message: 'Failed to sign out',
      };
    }
  }),
});