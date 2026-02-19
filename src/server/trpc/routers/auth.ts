import { publicProcedure, router } from "../trpc";
import { prisma } from "@/src/lib/prisma";
import bcrypt from "bcryptjs";
import {
  SignUpSchema,
  SignInSchema,
  AuthResultSchema,
  AuthSuccess,
  AuthError,
} from "../models/auth";

export const authRouter = router({
  signup: publicProcedure
    .input(SignUpSchema)
    .output(AuthResultSchema)
    .mutation(async ({ input }): Promise<AuthSuccess | AuthError> => {
      const { email, username, password } = input;

      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
      });

      if (existingUser) {
        return {
          success: false,
          message: existingUser.email === email
            ? "Email already taken"
            : "Username already taken",
        };
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await prisma.user.create({
        data: { email, username, password: hashedPassword },
        select: { id: true },
      });

      return {
        success: true,
        message: "Signed up successfully",
        userId:  newUser.id,
      };
    }),

  signin: publicProcedure
    .input(SignInSchema)
    .output(AuthResultSchema)
    .mutation(async ({ input }): Promise<AuthSuccess | AuthError> => {
      const { email, password } = input;

      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, password: true },
      });

      if (!user) {
        return {
          success: false,
          message: "Invalid email or password",
        };
      }

      const isValid = await bcrypt.compare(password, user.password);

      if (!isValid) {
        return {
          success: false,
          message: "Invalid email or password",
        };
      }

      return {
        success: true,
        message: "Signed in successfully",
        userId:  user.id,
      };
    }),
});

export type AuthRouter = typeof authRouter;