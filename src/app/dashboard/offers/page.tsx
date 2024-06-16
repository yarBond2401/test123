"use client";
// @ts-nocheck
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle
} from "@/components/ui/card";
import { useFirestoreQuery } from "@/hooks/useFirestoreQuery";
import { useRequireLogin } from "@/hooks/useRequireLogin";
import { OffersDataTable } from "./components/offers-table";
import { useFirestoreFunction } from "@/hooks/useFirestoreFunction";
import { Spinner } from "@/components/ui/spinner";
import { BrokerType } from "@/app/firestoreTypes";

const offerSchema = z.object({
	id: z.string().optional(),
	agentId: z.string().optional(),
	vendorId: z.string().optional(),
	costs: z.number().optional(),
	createdAt: z.any().optional(),
	offerDate: z.any().optional(),
	status: z.string().optional(),
	withTax: z.number().optional(),
	withoutTax: z.number().optional()
});

type OfferType = z.infer<typeof offerSchema>;

const Offers = () => {
	const router = useRouter();
	const { user } = useRequireLogin({
		onUnauthenticated: () => {
			router.push("/auth/signin");
		},
	});

	const { data: brokerData, isLoading: isBrokerLoading } = useFirestoreQuery(
		"brokers",
		"users",
		"array-contains",
		user?.uid
	);

	// @ts-ignore
	const broker: BrokerType | undefined = brokerData?.[0];

	const { data: offersData, isLoading: isOffersLoading } = useFirestoreQuery<any[]>(
		"offers",
		"agentId",
		"==",
		user?.uid,
		{
			orderField: "createdAt",
			orderDirection: "desc",
		}
	);

	const vendorIds = useMemo(() => offersData?.map((offer) => offer.vendorId) ?? [], [offersData]);

	const { data: vendorDetails, isLoading: isVendorDetailsLoading } = useFirestoreFunction({
		name: "get_users_info",
		payload: vendorIds.length
			? { uids: vendorIds }
			: null,
	});

	const offers = useMemo(() => {
		let parsed = z.array(offerSchema).parse(offersData ?? []);
		parsed = parsed.map((offer, idx) => ({
			...offer,
			// @ts-ignore
			createdAt: offersData[idx].createdAt,
			// @ts-ignore
			offerDate: offersData[idx].offerDate,
		}));

		parsed = parsed.map((offer) => ({
			...offer,
			userDetails: { displayName: user?.displayName || '', photoURL: user?.photoURL || '', email: user?.email || '' } as {
				displayName: string;
				photoURL: string;
				email: string;
			},
			// @ts-ignore
			vendorDetails: vendorDetails?.find((vendor) => vendor.uid === offer.vendorId) || null,
		}));
		console.log("parsed", parsed);
		return parsed;
	}, [offersData, vendorDetails, user]);

	const isLoading = isBrokerLoading || isOffersLoading || isVendorDetailsLoading;

	return (
		<div className="grid px-6 pt-6 2xl:container grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
			<Card className="w-full md:col-span-2 lg:col-span-4">
				<CardHeader>
					<CardTitle>Your Offers</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex items-center justify-center h-40">
							<Spinner />
						</div>
					) : (
						// @ts-ignore
						<OffersDataTable rows={offers} />
					)}
				</CardContent>
			</Card>
		</div>
	);
};

export default Offers;
