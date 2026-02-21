import { z } from "zod";

export const SignUpSchema = z.object({
  email:    z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }).max(20, { message: 'Username must be at most 20 characters' })
});

export const SignInSchema = z.object({
  email:    z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const AuthSuccessSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  userId:  z.string(),
});

export const AuthErrorSchema = z.object({
  success: z.literal(false),
  message: z.string(),
});

export const AuthResultSchema = z.discriminatedUnion("success", [
  AuthSuccessSchema,
  AuthErrorSchema,
]);

export type SignUpInput  = z.infer<typeof SignUpSchema>;
export type SignInInput  = z.infer<typeof SignInSchema>;
export type AuthSuccess  = z.infer<typeof AuthSuccessSchema>;
export type AuthError    = z.infer<typeof AuthErrorSchema>;
export type AuthResult   = z.infer<typeof AuthResultSchema>;