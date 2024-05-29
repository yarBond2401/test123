import { z } from "zod";
import { DayOfWeek } from "./types";
import { OFFERED_SERVICES, OfferedService } from "@/app/constants";

export const DAYS_OF_WEEK: DayOfWeek[] = [
  "mo",
  "tu",
  "we",
  "th",
  "fr",
  "sa",
  "su",
];

const zodMorningAndAfternoon = z.object({
  open: z.date(),
  close: z.date(),
  closed: z.boolean().default(false),
});

const getZodParse = (parse: string) => {
  switch (parse) {
    case "boolean":
      return z.coerce.boolean({
        invalid_type_error: "Expected a boolean",
        required_error: "required",
      });
    case "number":
      return z.coerce.number({
        invalid_type_error: "Please enter a number",
        required_error: "required",
      });
    case "file":
      return z.string().min(4, "Please upload a file")
    default:
      return z.string();
  }
};

export const serviceOfferSchema = z
  .object({
    locations: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          type: z.string(),
        })
      )
      .optional(),
    location_zip: z
      .object({
        zip: z.coerce.number(),
        radius: z.coerce.number(),
      })
      .optional(),
    description: z.string().max(500).optional(),
    generic_availability: z.object({
      mo: zodMorningAndAfternoon,
      tu: zodMorningAndAfternoon,
      we: zodMorningAndAfternoon,
      th: zodMorningAndAfternoon,
      fr: zodMorningAndAfternoon,
      sa: zodMorningAndAfternoon,
      su: zodMorningAndAfternoon,
    }),
    serviceSelect: z.object(
      // Black magic to create a zod schema from the SERVICES_OFFERED array
      OFFERED_SERVICES.map((s) => s.id).reduce((prev, curr) => {
        prev[curr] = z.boolean().default(false);
        return prev;
      }, {} as Record<OfferedService["id"], z.ZodDefault<z.ZodBoolean>>)
    ),
    serviceDetails: z.object(
      OFFERED_SERVICES.reduce((prev, curr) => {
        prev[curr.id] = z
          .object(
            curr.fields.reduce((prev, curr) => {
              prev[curr.id] = curr?.parse
                ? getZodParse(curr.parse as string)
                : z.string().optional();
              return prev;
            }, {} as any)
          )
          .optional();
        return prev;
      }, {} as Record<OfferedService["id"], z.ZodOptional<z.ZodObject<any>>>)
    ),
  })
  .refine(
    (data) => {
      // Has to have at least one service selected
      if (!Object.values(data.serviceSelect).some((v) => v === true)) {
        return false;
      }
      return true;
    },
    {
      message: "You must provide at least one service",
      path: ["serviceSelect"],
    }
  );

export type serviceOffer = z.infer<typeof serviceOfferSchema>;
