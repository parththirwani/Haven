import { publicProcedure, router } from "../trpc";
import { prisma } from "@/src/lib/prisma";
import bcrypt from "bcryptjs";
import { SignUpSchema, SignInSchema, AuthResultSchema } from "../models/auth";
import { cookies } from "next/headers"; 
import { generateSessionId, SESSION_DURATION_DAYS, setSessionCookie, clearSessionCookie, SESSION_COOKIE_NAME } from "@/src/utils/session";


export const authRouter = router({
  signup: publicProcedure
    .input(SignUpSchema)
    .output(AuthResultSchema)
    .mutation(async ({ input }) => {
      const { email, username, password } = input;

      const existing = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
      });

      if (existing) {
        return {
          success: false,
          message: existing.email === email ? "Email already taken" : "Username already taken",
        };
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: { email, username, password: hashedPassword },
        select: { id: true },
      });

      // Create session immediately after signup (auto-login)
      const sessionId = generateSessionId();
      const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

      await prisma.session.create({
        data: {
          id: sessionId,
          userId: user.id,
          expiresAt,
        },
      });

      setSessionCookie(sessionId, expiresAt);

      return {
        success: true,
        message: "Signed up successfully",
        userId: user.id,
      };
    }),

  signin: publicProcedure
    .input(SignInSchema)
    .output(AuthResultSchema)
    .mutation(async ({ input }) => {
      const { email, password } = input;

      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, password: true },
      });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return {
          success: false,
          message: "Invalid email or password",
        };
      }

      // Create new session
      const sessionId = generateSessionId();
      const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

      await prisma.session.create({
        data: {
          id: sessionId,
          userId: user.id,
          expiresAt,
        },
      });

      setSessionCookie(sessionId, expiresAt);

      return {
        success: true,
        message: "Signed in successfully",
        userId: user.id,
      };
    }),

  signout: publicProcedure.mutation(async () => {
    const sessionId = (await cookies()).get(SESSION_COOKIE_NAME)?.value;

    if (sessionId) {
      await prisma.session.deleteMany({ where: { id: sessionId } });
      clearSessionCookie();
    }

    return { success: true, message: "Signed out" };
  }),
});