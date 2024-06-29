"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { getDocs, collection } from "firebase/firestore";
import { db } from "@/app/firebase";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle
} from "@/components/ui/card";
import { useFirestoreQuery } from "@/hooks/useFirestoreQuery";
import { useRequireLogin } from "@/hooks/useRequireLogin";
import { useFirestoreFunction } from "@/hooks/useFirestoreFunction";
import { Spinner } from "@/components/ui/spinner";
import { DealsDataTable } from "./components/deals-table";
import { BrokerType } from "@/app/firestoreTypes";
import { useFirestoreSnapshot } from "@/hooks/useFirestoreSnapshot";

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

const VendorOffers = () => {
	const router = useRouter();
	const { user } = useRequireLogin({
		onUnauthenticated: () => {
			router.push("/auth/signin");
		},
	});

	const { data: brokerData, loading: isBrokerLoading, error: brokerError } = useFirestoreSnapshot<BrokerType[]>(
		"brokers",
		"users",
		"array-contains",
		user?.uid
	);
	const broker: BrokerType | undefined = brokerData?.[0];

	const { data: offersData, loading: isOffersLoading, error: offersError } = useFirestoreSnapshot<any[]>(
		"offers",
		"vendorId",
		"==",
		user?.uid,
		{
			orderField: "createdAt",
			orderDirection: "desc",
		}
	);

	const agentIds = useMemo(() => offersData?.map((offer) => offer.agentId) ?? [], [offersData]);

	const { data: agentDetails, isLoading: isAgentDetailsLoading } = useFirestoreFunction({
		name: "get_users_info",
		payload: agentIds.length
			? { uids: agentIds }
			: null,
	});

	const offers = useMemo(() => {
		let parsed = z.array(offerSchema).parse(offersData ?? []);
		parsed = parsed.map((offer, idx) => ({
			...offer,
			createdAt: offersData?.[idx].createdAt,
			offerDate: offersData?.[idx].offerDate,
		}));

		parsed = parsed.map((offer) => ({
			...offer,
			userDetails: { displayName: user?.displayName || '', photoURL: user?.photoURL || '', email: user?.email || '' } as {
				displayName: string;
				photoURL: string;
				email: string;
			},
			// @ts-ignore
			agentDetails: agentDetails?.[0] || null,
		}));

		return parsed;
	}, [offersData, agentDetails, user]);

	const isLoading = isBrokerLoading || isOffersLoading || isAgentDetailsLoading;

	if (brokerError) {
		return <div>Error loading broker data: {brokerError.message}</div>;
	}

	if (offersError) {
		return <div>Error loading offers: {offersError.message}</div>;
	}

	return (
		<div className="grid px-6 pt-6 2xl:container grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
			<Card className="w-full md:col-span-2 lg:col-span-4">
				<CardHeader>
					<CardTitle>Your Deals</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex items-center justify-center h-40">
							<Spinner />
						</div>
					) : (
						// @ts-ignore
						<DealsDataTable rows={offers} />
					)}
				</CardContent>
			</Card>
		</div>
	);
};

export default VendorOffers;