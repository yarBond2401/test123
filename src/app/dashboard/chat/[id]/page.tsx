"use client";

import { format, sub } from "date-fns";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React, { useContext, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useChat } from "@/hooks/useChat";
import { useIsVendor } from "@/hooks/useIsVendor";
import { cn, formatChatMessageTime } from "@/lib/utils";

import { CurrentChatContext, UserContext } from "../utils";

import PaperclipIcon from "@/icons/icon=paperclip.svg";
import SmileIcon from "@/icons/icon=smile.svg";
import SendIcon from "@/icons/icon=send.svg";
import MoreIcon from "@/icons/icon=more.svg";
import defaultAvatar from "@/images/default-user-picture.jpg";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/app/firebase";
import { useRequest } from "@/components/RequestContext";


interface Props {
  params: {
    id: string;
  };
}

const ChatItem = ({ data, chatDetails }: any) => {
  const user = useContext(UserContext);

  const isSender = useMemo(
    () => user?.uid === data.sender,
    [user, data.sender]
  );

  if (!user) return null;

  return (
    <div className="flex flex-col justify-start gap-2">
      {(!isSender && chatDetails?.userDetails) && (
        <div className="flex flex-col">
          <p className="text-sm leading-5 text-[#637381] self-start">{chatDetails.userDetails.displayName}</p>
        </div>
      )}
      <div className={cn(
        "flex flex-col px-5 py-3",
        isSender
          ? "self-end items-end bg-[#5296BF] text-white rounded-t-2xl rounded-bl-2xl"
          : "self-start items-start bg-gray-100 text-dashboard-main rounded-b-2xl rounded-tr-2xl"
      )}>
        <p className="text-lg font-normal">{data.text}</p>
      </div>
      <p className={cn("text-xs leading-5 text-[#637381]", isSender ? "self-end" : "self-start")}>
        {data.time ? formatChatMessageTime(data.time.toDate()) : "Sending..."}
      </p>
    </div>
  );
};

const ChatTab: React.FC<Props> = ({ params }) => {
  const router = useRouter();
  const pathname = usePathname();
  const user = useContext(UserContext);
  const chatDetails = useContext(CurrentChatContext);
  const chatId = useMemo(() => params.id, [params.id]);
  const [message, setMessage] = useState("");
  const { messages, sendMessage } = useChat({ chatId, user });
  const isVendor = useIsVendor(user);
  const { requestId } = useRequest();

  const submitOffer = () => {
    if (isVendor) return;
    router.push(`/dashboard/requests/${requestId}`);
  }

  useEffect(() => {
    console.log('chatDetails', chatDetails);
  }, [chatDetails]);

  return (
    <Card
      className={cn(
        "col-span-1 xl:col-span-2 flex-col overflow-hidden max-w-full",
        pathname === "/dashboard/chat" ? "hidden md:flex" : "flex"
      )}
    >
      <div className="flex justify-between p-6 pt-5 items-center">
        <div className="flex h-full items-center">
          <div className="relative 2xl:h-11 2xl:w-11 md:h-8 md:w-8 h-11 w-11 shrink-0">
            {chatDetails?.userDetails ? (
              <>
                <Image
                  src={chatDetails.userDetails.photoURL || defaultAvatar}
                  alt={chatDetails.userDetails.displayName}
                  className="w-full h-auto rounded-full"
                  width={44}
                  height={44}
                />
                <div
                  className={cn(
                    chatDetails.userDetails.online ? "bg-green-400" : "bg-red-500",
                    "2xl:w-3 2xl:h-3 md:w-2 md:h-2 w-3 h-3 rounded-full 2xl:border-[2px] md:border border-[2px] border-white absolute bottom-0 right-0 box-border"
                  )}
                />
              </>
            ) : (
              <Skeleton className="w-10 h-10 rounded-full" />
            )}
          </div>

          <div className="flex flex-col ml-4">
            {chatDetails?.userDetails ? (
              <p className="font-medium text-lg leading-6 text-dashboard-main">{chatDetails.userDetails.displayName}</p>
            ) : (
              <Skeleton className="h-4 w-24" />
            )}
            <p className="font-normal text-sm text-dashboard-secondary">Reply to message</p>
          </div>
        </div>

        <div className="flex flex-row gap-3 items-center">
          <button
            type="button"
            className="py-[10px] px-10 bg-[#52BF56] hover:bg-green-600 text-white rounded-md text-base font-medium"
            onClick={() => submitOffer()}
          >
            {isVendor ? "Accept the contract" : "Send an offer"}
          </button>
          <button type="button" className="p-[9px] bg-gray-100 border border-[#DFE4EA] rounded">
            <Image src={MoreIcon} alt="more" width={22} height={22} />
          </button>
        </div>

        <Button
          type="button"
          className="md:hidden"
          onClick={() => router.push("/dashboard/chat")}
        >
          Back
        </Button>
      </div>
      <Separator />
      <div className="flex flex-1 overflow-y-scroll py-6">
        <div className="min-w-full min-h-full flex flex-col-reverse px-7 py-4 gap-8 justify-end">
          {messages.length !== 0
            ? messages.map((message: any) => (
              <ChatItem
                key={message.id}
                data={message}
                chatDetails={chatDetails}
              />
            ))
            : null}
        </div>
      </div>
      <Separator />
      <form
        className="flex items-center gap-4 p-6"
        onSubmit={(e) => {
          e.preventDefault();

          if (!message.trim().length) {
            return;
          }
          sendMessage(message);
          setMessage("");
        }}
      >
        <div className="bg-gray-100 border border-[#DFE4EA] w-full flex flex-row gap-3 px-5 py-3 rounded-md">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type something here..."
            autoFocus={true}
            className="outline-none text-base leading-[22px] font-normal placeholder:text-[#8899A8] bg-gray-100 w-full"
          />
          <button>
            <Image
              src={PaperclipIcon}
              alt="add a file"
              height={18}
              width={18}
            />
          </button>
          <button>
            <Image src={SmileIcon} alt="add an emoji" height={18} width={18} />
          </button>
        </div>
        <button
          type="submit"
          className="p-[14px] bg-[#5352BF] rounded-md hover:bg-[#1B44C8]"
        >
          <Image src={SendIcon} alt="send" height={20} width={20} />
        </button>
      </form>
    </Card>
  );
};

export default ChatTab;