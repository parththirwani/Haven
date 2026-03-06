import bcrypt from 'bcryptjs';
import { prisma } from "@/src/lib/prisma";
import { AuthResultSchema, SignInSchema, SignUpSchema } from "../models/auth";
import { publicProcedure, router } from "../trpc";
import {
  clearSessionCookie,
  generateSessionId,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_DAYS,
  setSessionCookie
} from '@/src/utils/session';
import { cookies } from 'next/headers';

export const authRouter = router({
  signup: publicProcedure
    .input(SignUpSchema)
    .output(AuthResultSchema)
    .mutation(async ({ input }) => {
      try {
        const { email, password, username } = input;

        const existing = await prisma.user.findUnique({
          where: { email }
        });

        if (existing) {
          return {
            success: false,
            message: "Email already exists"
          };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            username
          }
        });

        const sessionId = generateSessionId();
        const expiresAt = new Date(
          Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000
        );

        await prisma.session.create({
          data: {
            id: sessionId,
            expiresAt,
            userId: user.id
          }
        });

        setSessionCookie(sessionId, expiresAt);

        return {
          success: true,
          message: "User successfully signed up",
          userId: user.id
        };

      } catch (error) {
        console.error("Signup error:", error);

        return {
          success: false,
          message: "Something went wrong during signup"
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
          select: {
            id: true,
            password: true
          }
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
          return {
            success: false,
            message: "Invalid email or password"
          };
        }

        const sessionId = generateSessionId();
        const expiresAt = new Date(
          Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000
        );

        await prisma.session.create({
          data: {
            id: sessionId,
            expiresAt,
            userId: user.id
          }
        });

        setSessionCookie(sessionId, expiresAt);

        return {
          success: true,
          message: "User successfully signed in",
          userId: user.id
        };

      } catch (error) {
        console.error("Signin error:", error);

        return {
          success: false,
          message: "Something went wrong during signin"
        };
      }
    }),

  signout: publicProcedure
    .mutation(async () => {
      try {
        const sessionId = (await cookies()).get(SESSION_COOKIE_NAME)?.value;

        if (sessionId) {
          await prisma.session.delete({
            where: {
              id: sessionId
            }
          });

          clearSessionCookie();
        }

        return {
          success: true,
          message: "User signed out"
        };

      } catch (error) {
        console.error("Signout error:", error);

        return {
          success: false,
          message: "Something went wrong during signout"
        };
      }
    })
});