import { z } from "zod";
import { BaseProfileSchema } from "./profile";

export const onboardingInputSchema = BaseProfileSchema;

export const onboardingSuccessResponse = z.object({
  success: z.literal(true),
  message: z.string(),
  keySalt: z.string().min(32),           
});

export const onboardingErrorResponse = z.object({
  success: z.literal(false),
  message: z.string(),
});

export const onboardingResultSchema = z.discriminatedUnion("success", [
  onboardingSuccessResponse,
  onboardingErrorResponse,
]);

export type OnboardingInput = z.infer<typeof onboardingInputSchema>;
export type OnboardingResult = z.infer<typeof onboardingResultSchema>;