import { OFFERED_SERVICES } from "@/app/constants";
import { z } from "zod";

// @ts-ignore
export const serviceRequestCreateSchema = z.object({
    userId: z.string(),
    brokerId: z.string(),
    requestName: z.string().min(3),
    location: z.object({
        latitude: z.number(),
        longitude: z.number(),
    }),
    datetime: z.date(),
    status: z.enum(["issued", "resolved", "payment", "paid", "completed"]),
    services: z.array(z.object({
        // @ts-ignore
        serviceName: z.enum(OFFERED_SERVICES.map((service) => service.id)),
        maxPrice: z.number(),
        candidates: z.array(
            z.intersection(
                z.object({
                    type: z.string(),
                    pricing: z.number(),
                    datetime: z.date().optional(),
                }), z.record(
                    z.string(), z.union([
                        z.string(),
                        z.number(),
                        z.boolean().default(false)
                    ])
                ) 
            )
        ),
        datetime: z.date().optional(),
        duration: z.number().optional(),
        additionalFields: z.record(
            z.string(),
            z.union([z.string(), z.boolean().default(false)])
        ).optional(),
        selected: z.string().optional(),
    })).nonempty(),
});

export const serviceRequestSchema = serviceRequestCreateSchema.extend({
    id: z.string(),
    datetime: z.object({
        seconds: z.number(),
        nanoseconds: z.number(),
        // method that returns JS date
        toDate: z.any(),
    }),
    createdAt: z.object({
        seconds: z.number(),
        nanoseconds: z.number(),
        // method that returns JS date
        toDate: z.any(),
    }),
    services: z.array(z.object({
        // @ts-ignore
        serviceName: z.enum(OFFERED_SERVICES.map((service) => service.id)),
        maxPrice: z.number(),
        candidates: z.array(
            z.intersection(
                z.object({
                    type: z.string(),
                    pricing: z.number(),
                }), z.record(
                    z.string(), z.any()
                )
            )
        ),
        datetime: z.object({
            seconds: z.number(),
            nanoseconds: z.number(),
            // method that returns JS date
            toDate: z.any(),
        }).optional(),
        additionalFields: z.record(
            z.string(),
            z.union([z.string(), z.boolean().default(false)])
        ).optional(),
        selected: z.string().nullable().optional(),
    })).nonempty(),
});

export const serviceRequestWithUsersSchema = serviceRequestSchema.extend({
    userDetails: z.object({
        uid: z.string(),
        email: z.string(),
        displayName: z.string(),
        photoURL: z.string(),
    }),
})

export type ServiceRequestWithUsers = z.infer<typeof serviceRequestWithUsersSchema>;
export type ServiceRequest = z.infer<typeof serviceRequestSchema>;
export type ServiceRequestCreate = z.infer<typeof serviceRequestCreateSchema>;