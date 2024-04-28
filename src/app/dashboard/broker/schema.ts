import { z } from "zod";

export const publicUserSchema = z.object({
  uid: z.string(),
  admin: z.boolean().default(false),
  you: z.boolean().default(false),
  email: z.string(),
  displayName: z.string(),
  photoURL: z.string().nullable(),
  brokerId: z.string(),
});

export type PublicUser = z.infer<typeof publicUserSchema>;
