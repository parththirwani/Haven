import { z } from "zod";

export const BaseProfileSchema = z.object({
  username: z.string().min(3).max(20).optional(),
  avatar: z.string().url().optional(),
  socialLinks: z.object({
    x: z.string().url().optional(),
    instagram: z.string().url().optional(),
    github: z.string().url().optional(),
    medium: z.string().url().optional(),
  }).optional().default({}),
});

export const profileUpdateSuccessResponse = z.object({
  success: z.literal(true),
  message: z.string(),
});

export const profileUpdateErrorResponse = z.object({
  success: z.literal(false),
  message: z.string(),
});

export const ProfileUpdateResultSchema = z.discriminatedUnion("success", [
  profileUpdateSuccessResponse,
  profileUpdateErrorResponse,
]);


export type UpdateProfileInput     = z.infer<typeof BaseProfileSchema>;
export type ProfileUpdateSuccess   = z.infer<typeof profileUpdateSuccessResponse>;
export type ProfileUpdateError     = z.infer<typeof profileUpdateErrorResponse>;
export type ProfileUpdateResult    = z.infer<typeof ProfileUpdateResultSchema>;