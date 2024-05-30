import { OFFERED_SERVICES } from "@/app/constants";
import { z } from "zod";
import { parsePhoneNumberFromString } from 'libphonenumber-js';

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

const E164NumberSchema = z.string().refine((value) => {
    const phoneNumber = parsePhoneNumberFromString(value || '');
    return phoneNumber && phoneNumber.isValid() && phoneNumber.format('E.164') === value;
}, {
    message: 'Invalid E164 number format',
});

export const signInRequestCreateSchema = z.object({
    userId: z.string(),
    userInfo: z.object({
        email: z.string().nullable(),
        photoURL: z.string().nullable(),
        uid: z.string().nullable(),
        displayName: z.string().nullable(),
    }).nullable(),
    signInApprover: z.object({
        email: z.string().nullable(),
        photoURL: z.string().nullable(),
        uid: z.string().nullable(),
        displayName: z.string().nullable(),
    }).nullable(),
    requestName: z.string().min(3),
    firstName: z.string().default(''),
    phoneNumber: E164NumberSchema,
    description: z.string().default(''),
    status: z.enum(["Approved", "Pending Install", "Installed", "Pending Removal", "Removed"]),
    photoUrl: z.string(),
    location: z.object({
        latitude: z.number(),
        longitude: z.number(),
    }),
    requestedDate: z.date().optional(),
});

export const signInRequestWithUsersSchema = signInRequestCreateSchema.extend({
    userDetails: z.object({
        uid: z.string(),
        email: z.string(),
        displayName: z.string(),
        photoURL: z.string(),
    }),
})

export const signInRequestSchema = signInRequestCreateSchema.extend({
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
})

export const singInRequestsWithApprovedDateSchema = signInRequestSchema.extend({
    approvedDate: z.date().optional(),
});

export type ServiceRequestWithUsers = z.infer<typeof serviceRequestWithUsersSchema>;
export type ServiceRequest = z.infer<typeof serviceRequestSchema>;
export type ServiceRequestCreate = z.infer<typeof serviceRequestCreateSchema>;
export type ServiceSignInRequestCreate = z.infer<typeof signInRequestCreateSchema>;
export type ServiceSignInRequestSchema = z.infer<typeof signInRequestSchema>;
export type ServiceSignInRequestWithApprovedDateSchema = z.infer<typeof singInRequestsWithApprovedDateSchema>;