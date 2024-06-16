import { useMemo } from "react";
import { useFirestoreQuery } from "./useFirestoreQuery";
import { useFirestoreFunction } from "./useFirestoreFunction";
import { z } from "zod";
import { useIsVendor } from "./useIsVendor";

// Define the offer schema using Zod and TypeScript
const offerSchema = z.object({
	id: z.string().optional(),
	agentId: z.string().optional(),
	vendorId: z.string().optional(),
	costs: z.number().optional(),
	createdAt: z.date().optional(),
	offerDate: z.date().optional(),
	status: z.string().optional(),
	withTax: z.number().optional(),
	withoutTax: z.number().optional()
});

type Offer = z.infer<typeof offerSchema>;

interface User {
	uid: string;
}

type FirestoreOffer = Offer & {
	createdAt: Date;
	offerDate: Date;
	otherUserDetails: OtherUserDetails | null;
};

interface OtherUserDetails {
	uid: string;
	name: string; // Assuming other details include name, add more if needed
}

// Define the type for the hook return value
interface OffersDataReturn {
	offers: FirestoreOffer[];
	isLoading: boolean;
}

export const useOffersData = (user: User | null, filterStatus: string): OffersDataReturn => {
	// @ts-ignore
	const isVendor = useIsVendor(user);
	const userField = isVendor ? "vendorId" : "agentId";
	const otherField = isVendor ? "agentId" : "vendorId";

	const queryFilters = [
		[userField, "==", user?.uid],
	];

	const { data: offersData, isLoading: isOffersLoading } = useFirestoreQuery<Offer[]>(
		"offers",
		userField,
		"==",
		user?.uid,
		{
			orderField: "createdAt",
			orderDirection: "desc",
		}
	);

	const otherUserIds = useMemo(() => offersData?.map((offer) => offer[otherField]) ?? [], [offersData]);

	const { data: otherUserDetails, isLoading: isOtherUserDetailsLoading } = useFirestoreFunction<OtherUserDetails[]>({
		name: "get_users_info",
		payload: otherUserIds.length ? { uids: otherUserIds } : null,
	});

	const filteredOffersData = useMemo(() => {
		if (filterStatus === "all") {
			return offersData;
		}
		return offersData?.filter((offer) => offer.status === filterStatus);
	}, [offersData, filterStatus]);

	const offers = useMemo(() => {
		return filteredOffersData?.map((offer) => ({
			...offer,
			createdAt: offer.createdAt,
			offerDate: offer.offerDate,
			otherUserDetails: otherUserDetails?.find((details) => details.uid === offer[otherField]) || null,
		})) as FirestoreOffer[];
	}, [filteredOffersData, otherUserDetails]);

	return {
		offers: offers?.slice(0, 5),
		isLoading: isOffersLoading || isOtherUserDetailsLoading
	};

};
