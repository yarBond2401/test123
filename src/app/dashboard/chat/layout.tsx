"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

import { auth } from "@/app/firebase";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useChatList } from "@/hooks/useChatList";
import { useFirestoreFunction } from "@/hooks/useFirestoreFunction";
import { cn, formatChatMessageTime } from "@/lib/utils";
import { User } from "firebase/auth";
import { CurrentChatContext, UserContext } from "./utils";
import { useIsVendor } from "@/hooks/useIsVendor";
import defaultAvatar from "@/images/default-user-picture.jpg";
import { Separator } from "@/components/ui/separator";
import { SearchBar } from "@/components/SearchBar";
import { InboxItem } from "@/components/chatItem/InboxItem";
import { subscribeUserStatus } from "@/hooks/useUsersStatuses";

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const chatId = useMemo(() => pathname.split("/").pop(), [pathname]);
  const chatList = useChatList(user);
  const isVendor = useIsVendor(user);
  const [searchQuery, setSearchQuery] = useState("");
  const [userStatuses, setUserStatuses] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

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

  useEffect(() => {
    let unsubscribe: any;
    if (chatList.length) {
      const list = isVendor ? chatList?.map((chat: any) => chat.agent) : chatList?.map((chat: any) => chat.vendor);
      unsubscribe = subscribeUserStatus(list, isVendor, setUserStatuses);
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, chatList, isVendor]);

  const chats = useMemo(() => {
    if (!chatList || !usersDetails) return chatList;

    // @ts-ignore
    return chatList.map((chat, idx) => {
      // @ts-ignore
      const userDetails = usersDetails[idx];
      const status = (userStatuses.find((obj: any) => obj.id === userDetails.uid) as any)?.online;
      return {
        ...chat,
        userDetails,
        status,
      };
    });
  }, [chatList, userStatuses, usersDetails]);

  let filteredChats = chats;

  if (chats) {
    filteredChats = chats.filter((chat: any) => chat.userDetails?.displayName.toLowerCase().includes(searchQuery.trim().toLowerCase()));
  }

  const currentChatDetails = useMemo(() => {
    return chats?.find((chat: any) => chat.id === chatId);
  }, [chats, chatId]);

  return (
    <>
      <h2 className="p-6 text-2xl font-semibold">Chat</h2>
      <div className="grid grid-cols-1 xl:grid-cols-3 md:grid-cols-2 h-[calc(100vh-12rem)] p-4 gap-10">
        <Card
          className={cn(
            "col-span-1 overflow-hidden relative flex-col",
            pathname !== "/dashboard/chat" ? "hidden md:flex" : "flex"
          )}
        >
          <div className="flex flex-row p-5 gap-3 text-[#111928] items-center">
            <p className="text-xl font-medium ">Active Conversations</p>
            <div className="py-[2px] px-[10px] text-base leading-4 font-medium bg-gray-100 border border-[#DFE4EA] rounded-md">
              <p>{chats.length}</p>
            </div>
          </div>
          <Separator />

          <ScrollArea className="flex flex-col h-full w-full p-5">
            <SearchBar searchQuery={searchQuery} onChange={setSearchQuery} />
            <div className="mt-7">
              {filteredChats.length ?
                filteredChats.map((chat: any) => (
                  <InboxItem
                    item={chat}
                    key={chat.id}
                    chatId={chatId}
                    messageStyles="text-dashboard-main font-normal"
                  />
                )) : (
                  <div className="flex items-center justify-center pt-4">
                    <p className="xl:text-base text-sm leading-5 text-dashboard-main font-medium">
                      No chats match your search query.
                    </p>
                  </div>
                )}
            </div>
          </ScrollArea>
        </Card>
        <CurrentChatContext.Provider value={currentChatDetails}>
          <UserContext.Provider value={user}>{children}</UserContext.Provider>
        </CurrentChatContext.Provider>
      </div>
    </>
  );
};

export default Layout;