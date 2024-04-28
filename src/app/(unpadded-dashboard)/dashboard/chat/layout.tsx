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

  useEffect(() => {
    console.log("chatList", chatList)
  }, [chatList])

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

  const chats = useMemo(() => {
    // compare shapes if mismatched do not update
    if (!chatList || !usersDetails) return chatList;
    // else, merge userDetails into the chatList

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

  const currentChatDetails = useMemo(() => {
    return chats?.find((chat: any) => chat.id === chatId);
  }, [chats, chatId]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 h-[calc(100vh-4rem)] p-4 gap-4">
      <Card
        className={cn(
          "col-span-1 md:col-span-2 xl:col-span-1 overflow-hidden relative",
          pathname !== "/dashboard/chat" ? "hidden md:flex" : "flex"
        )}
      >
        <ScrollArea className="flex flex-col h-full w-full">
          {chats &&
            chats.map((chat: any) => (
              <Link
                className="flex relative h-20"
                key={chat.id}
                href={`/dashboard/chat/${chat.id}`}
              >
                <div
                  className={cn(
                    "flex flex-row py-4 px-2 gap-1 absolute h-full w-full",
                    chatId === chat.id ? "bg-slate-100" : "hover:bg-slate-100"
                  )}
                >
                  {chat.userDetails?.photoURL ? (
                    <Image
                      src={chat.userDetails.photoURL}
                      alt="user profile"
                      className="w-12 h-12 rounded-full flex-none object-cover"
                      width={48}
                      height={48}
                    />
                  ) : (
                    <Skeleton className="w-10 h-10 rounded-full" />
                  )}
                  <div className="relative flex flex-col w-full max-w-full flex-1 min-w-0">
                    <div className="flex flex-row justify-between items-center gap-1 min-w-0 flex-1">
                      <div className="flex flex-1 min-w-0">
                        {chat.userDetails?.displayName ? (
                          <span className="font-bold truncate flex-1 inline-block">
                            {chat.userDetails.displayName}
                          </span>
                        ) : (
                          <Skeleton className="w-24 h-4" />
                        )}
                      </div>
                      <div className="flex-1 max-w-fit">
                        <p className="text-xs text-slate-500 max-w-fit">
                          {/* Format example:  */}
                          {chat?.last_time &&
                            formatChatMessageTime(chat.last_time.toDate())
                          }
                        </p>
                      </div>
                    </div>
                    <p className="text-sm truncate text-slate-500 min-w-0">
                      {chat?.last_text}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
        </ScrollArea>
      </Card>
      <CurrentChatContext.Provider value={currentChatDetails}>
        <UserContext.Provider value={user}>{children}</UserContext.Provider>
      </CurrentChatContext.Provider>
    </div>
  );
};

export default Layout;
