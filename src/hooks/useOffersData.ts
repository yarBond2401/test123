import { useMemo } from "react";
import { useFirestoreQuery } from "./useFirestoreQuery";
import { useFirestoreFunction } from "./useFirestoreFunction";
import { z } from "zod";
import { useIsVendor } from "./useIsVendor";

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

export const useOffersData = (user: any, filterStatus: string) => {
	const isVendor = useIsVendor(user);
	const userField = isVendor ? "vendorId" : "agentId";
	const otherField = isVendor ? "agentId" : "vendorId";

	const queryFilters = [
		[userField, "==", user?.uid],
	];

	const { data: offersData, isLoading: isOffersLoading } = useFirestoreQuery<any[]>(
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

	const { data: otherUserDetails, isLoading: isOtherUserDetailsLoading } = useFirestoreFunction({
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
		return filteredOffersData?.map((offer, idx) => ({
			...offer,
			createdAt: offer.createdAt,
			offerDate: offer.offerDate,
			otherUserDetails: otherUserDetails?.find((details) => details.uid === offer[otherField]) || null,
		}));
	}, [filteredOffersData, otherUserDetails]);

	return {
		offers: offers?.slice(0, 5),
		isLoading: isOffersLoading || isOtherUserDetailsLoading
	};

};