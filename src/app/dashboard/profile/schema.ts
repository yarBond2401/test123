import { z } from "zod";

export const publicProfileSchema = z.object({
  displayName: z.string(),
  photoURL: z.string().optional().default(""),
  email: z.string().readonly(),
});


export type PublicProfile = z.infer<typeof publicProfileSchema>;