"use client";

import { useIsVendor } from "@/hooks/useIsVendor";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import Link from "next/link";
import React, { useMemo } from "react";
import useSWR from "swr";
import { db } from "../firebase";
import { LoadingMessagesPopover } from "@/components/LoadingMessagesPopover";
import { InboxItem } from "@/components/chatItem/InboxItem";
import { Separator } from "@/components/ui/separator";
import { useFirestoreFunction } from "@/hooks/useFirestoreFunction";
import { useChatList } from "@/hooks/useChatList";

interface Props {
	user: User
}

export const InboxCard: React.FC<Props> = ({ user }) => {
	const isVendor = useIsVendor(user);
	const chatList = useChatList(user, 4);

	const otherRole = isVendor ? "agent" : "vendor";
	const { data: usersDetails } = useFirestoreFunction({
		name: "get_users_info",
		// @ts-ignore
		payload: chatList?.length
			? {
				// @ts-ignore
				uids: isVendor ? chatList?.map((chat) => chat.agent) : chatList?.map((chat) => chat.vendor),
			}
			: null,
	});

	const chats = useMemo(() => {
		if (!chatList || !usersDetails) return chatList;

		// @ts-ignore
		return chatList.map((chat, idx) => {
			// @ts-ignore
			const userDetails = usersDetails[idx];
			return {
				...chat,
				userDetails,
			};
		});
	}, [chatList, usersDetails]);


	return (
		<div className="flex shadow flex-col bg-white border border-[#DFE4EA] rounded-10 lg:col-span-1">
			<div className="flex flex-row justify-between p-5 items-center">
				<p className="text-dashboard-main xl:text-xl leading-6 font-medium md:text-base text-xl">
					Inbox
				</p>
				<Link href="/dashboard/chat" className="xl:text-lg md:text-sm text-lg leading-[22px] font-medium text-[#5352BF]">
					View all
				</Link>
			</div>
			<Separator />
			<div className="flex flex-col px-3 pt-5">
				{
					chats && usersDetails ? chats.map((item, index) => (
						<InboxItem
							key={`${item.id}-${index}`}
							item={item}
							messageStyles="font-medium text-dashboard-secondary"
						/>
					)) : <LoadingMessagesPopover count={4} />
				}
			</div>
		</div>
	);
};
