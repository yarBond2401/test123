import { signUpSchemaPrimitive } from "../signup/schema";
import { z } from "zod";

export const resetPasswordSchema = z.object({
    password: z.string().min(8),
    passwordConfirmation: z.string().min(8),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });


export type ResetPassword = z.infer<typeof resetPasswordSchema>;