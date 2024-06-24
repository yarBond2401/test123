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
      return z.string().optional();
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
          lat: z.number().optional(),
          lng: z.number().optional(),
          radius: z.number().optional(),
        })
      )
      .optional(),
    location_zip: z
      .object({
        zip: z.coerce.number(),
        radius: z.coerce.number(),
        lat: z.number().optional(),
        lng: z.number().optional(),
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
                : z.string();
              return prev;
            }, {} as any)
          )
          .optional();
        return prev;
      }, {} as Record<OfferedService["id"], z.ZodOptional<z.ZodObject<any>>>)
    ),
  })
  .superRefine((data, ctx) => {
    console.log(data);
    console.log("OFFERED_SERVICES", OFFERED_SERVICES);

    Object.entries(data.serviceSelect).forEach(([serviceId, isSelected]) => {
      if (isSelected) {
        const service = OFFERED_SERVICES.find(s => s.id === serviceId);
        console.log(serviceId);
        if (service) {
          // @ts-ignore
          if (!data.serviceDetails || !data.serviceDetails[serviceId]) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Details for ${service.name} are required`,
              path: ["serviceDetails", serviceId],
            });
          } else {
            service.fields.forEach(field => {
               if (field.id === 'portfolio') return;

              // @ts-ignore
              const fieldValue = data.serviceDetails[serviceId]?.[field.id];
              if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: `${field.label} is required for ${service.name}`,
                  path: ["serviceDetails", serviceId, field.id],
                });
              } else if (field.id === 'experience' || field.id === "pricing") {
                if (fieldValue == 0) {
                  ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `${field.label} is required for ${service.name}`,
                    path: ["serviceDetails", serviceId, field.id],
                  });
                } else {
                  const zodParse = getZodParse(field.parse as string);
                  try {
                    zodParse.parse(fieldValue);
                  } catch (error) {
                    if (error instanceof z.ZodError) {
                      error.issues.forEach(issue => {
                        ctx.addIssue({
                          ...issue,
                          path: ["serviceDetails", serviceId, field.id, ...issue.path],
                        });
                      });
                    }
                  }
                }
              }
            });
          }
        }
      }
    });
  })
  .refine(
    (data) => {
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

export type serviceOffer = z.infer<typeof serviceOfferSchema> & {
  [key: string]: any;
};
