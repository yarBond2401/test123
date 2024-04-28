import { z } from "zod";


export const createBrokerSchema = z.object({
  users: z.array(z.string()),
  admins: z.array(z.string()),
  name: z.string(),
  image: z.string().trim().url(),
});
