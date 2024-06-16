import React, { useState } from 'react';
import * as Select from "@radix-ui/react-select";
import Image from 'next/image';
import { DealItem } from '@/components/dashboard/DealItem';
import { useIsVendor } from '@/hooks/useIsVendor';
import { useOffersData } from '@/hooks/useOffersData';
import { useRequireLogin } from '@/hooks/useRequireLogin';
import DropdownIcon from "@/icons/icon=chevron-down.svg";
import Loading from './loading';
import { Skeleton } from '@/components/ui/skeleton';


interface OffersDashboardProps {
}

const dealStatus = ["All", "Pending", "Accepted", "Rejected", "Completed"];

const OffersDashboard: React.FunctionComponent<OffersDashboardProps> = (props) => {
	const [selectedStatus, setSelectedStatus] = useState(dealStatus[0]);
	const { user } = useRequireLogin({
		onUnauthenticated: () => {
			router.push("/auth/signin");
		},
	});
	const { offers, isLoading } = useOffersData(user, selectedStatus.toLocaleLowerCase());
	const isVendor = useIsVendor(user);

	return (
		<div className="flex flex-col shadow bg-white border border-[#DFE4EA] rounded-10 lg:col-span-3">
			<div className="flex flex-row justify-between py-3 xl:px-6 lg:px-2 px-6 items-center">
				<p className="text-dashboard-main xl:text-xl text-lg leading-6 font-medium">
					{selectedStatus}
				</p>
				<Select.Root
					value={selectedStatus}
					onValueChange={setSelectedStatus}
				>
					<Select.Trigger className="flex flex-row gap-[10px] xl:px-3 px-1 xl:py-2 py-1 border border-[#5352BF] rounded-md outline-none items-center xl:text-base text-sm text-[#5352BF] hover:bg-violet-50">
						<Select.Value />
						<Select.Icon>
							<Image
								src={DropdownIcon}
								alt="icon"
								height={18}
								width={18}
							/>
						</Select.Icon>
					</Select.Trigger>

					<Select.Portal>
						<Select.Content className="bg-white border border-[#5352BF] rounded-md outline-none">
							<Select.Viewport className="xl:text-base text-sm text-[#5352BF]">
								{dealStatus.map((status) => (
									<Select.Item
										key={status}
										value={status}
										className="xl:px-3 px-1 xl:py-2 py-1 outline-none rounded-md hover:bg-violet-50"
									>
										<Select.ItemText>{status}</Select.ItemText>
									</Select.Item>
								))}
							</Select.Viewport>
							<Select.Arrow />
						</Select.Content>
					</Select.Portal>
				</Select.Root>
			</div>
			<div className="flex flex-col justify-between">
				{isLoading ? (
					<SkeletonLoader />
				) : (
					offers?.length ? offers?.map((deal) => <DealItem deal={deal} key={deal.id} isVendor={isVendor} />) : <div className="flex flex-col items-center justify-center py-6">
						<p className="text-[#5352BF] text-sm font-medium">No offers found</p>
					</div>
				)}
			</div>
		</div>
	)
};

const SkeletonLoader = () => {
	return (
		<div className="animate-pulse flex flex-col w-full">
			<div className="flex flex-row justify-between py-4">
				<div className="flex flex-row gap-4 items-center w-1/3">
					<Skeleton className="h-10 w-10 rounded-full" />
					<div className="flex flex-col">
						<Skeleton className="h-4 w-24 mb-2 rounded" />
						<Skeleton className="h-4 w-32 rounded" />
					</div>
				</div>
				<div className="flex flex-col justify-center px-6 w-1/4">
					<Skeleton className="h-4 w-20 mb-2 rounded" />
					<Skeleton className="h-4 w-16 rounded" />
				</div>
				<div className="flex items-center justify-center min-w-36">
					<Skeleton className="h-6 w-20 rounded-full" />
				</div>
				<div className="flex items-center justify-center px-6">
					<Skeleton className="h-4 w-16 rounded" />
				</div>
				<div className="flex items-center justify-center w-40">
					<Skeleton className="h-4 w-12 rounded" />
				</div>
			</div>
		</div>
	);
};

export default OffersDashboard;
