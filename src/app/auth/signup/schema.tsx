import { z } from "zod";

export const signUpSchemaPrimitive = z
  .object({
    role: z.enum(["vendor", "agent"]),
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8),
    passwordConfirmation: z.string().min(8),
    acceptTerms: z.boolean().default(false),
    pricingRegion: z.string().optional(),
    pricingModel: z.string().optional(),
  }).refine((data) => data.acceptTerms, {
    message: "You must accept the terms and conditions",
    path: ["acceptTerms"],
  });

export const signUpSchema = signUpSchemaPrimitive
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });
