"use client";

import { format } from 'date-fns';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import React, { useContext, useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useChat } from '@/hooks/useChat';
import { cn, formatChatMessageTime } from '@/lib/utils';

import { CurrentChatContext, UserContext } from '../utils';

interface Props {
  params: {
    id: string;
  };
}

const ChatItem = ({ data, chatDetails }: any) => {
  const user = useContext(UserContext);

  const isSender = useMemo(() =>
    user?.uid === data.sender,
    [user, data.sender]
  );

  if (!user) return null;

  return (
    <Card
      className={cn(
        "flex flex-col justify-start p-2 my-1",
        isSender
          ? "self-end items-end bg-slate-100 ml-6"
          : "self-start items-start bg-sky-100 mr-6"
      )}
    >
      {/* <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <p className="text-sm font-semibold">{isSender ? user.displayName : chatDetails?  .userDetails?.displayName}</p>
        </div>
      </div> */}
      <div className="flex flex-col">
        <p className="text-sm">{data.text}</p>
      </div>
      <p className="text-xs text-slate-500 self-end">
        {
          data.time
            ? formatChatMessageTime(data.time.toDate())
            : "Sending..."
        }
      </p>
    </Card>
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

  useEffect(() => {
    console.log(chatDetails);
  }, [chatDetails]);

  return (
    <Card
      className={cn(
        "col-span-1 md:flex md:col-span-2 xl:col-span-3 flex-col overflow-hidden max-w-full",
        pathname === "/dashboard/chat" ? "hidden md:flex" : "flex"
      )}
    >
      <div className="flex h-20 justify-between p-4 items-center">
        <div className="flex h-full items-center">
          {
            chatDetails?.userDetails ?
              <Image
                src={chatDetail?.userDetails?.photoURL}
                alt="Profile Picture"
                width={64}
                height={64}
                className="rounded-full flex-none h-16 w-16 object-cover"
              />
              : <Skeleton className="h-16 w-16 rounded-full" />
          }
          <div className="flex flex-col ml-4 h-full justify-around">
            {
              chatDetails?.userDetails ?
                <p className="font-bold">{chatDetails.userDetails.displayName}</p>
                : <Skeleton className="h-4 w-24" />
            }
          </div>
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
      <div className="relative flex flex-col-reverse flex-1 overflow-y-scroll">
        <div className="min-w-full min-h-full flex flex-col-reverse bottom-0 px-4">
          {
            messages.length !== 0
              ? messages.map((message: any) => (
                <ChatItem key={message.id} data={message} chatDetails={chatDetails} />
              ))
              : null
          }
          <span />
        </div>
      </div>
      <Separator />
      <form className=" flex h-16 items-center gap-4 p-4" onSubmit={(e) => {
        e.preventDefault();
        sendMessage(message);
        setMessage("")
      }}>
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message" autoFocus={true} />
        <Button
          type="submit"
        >Send</Button>
      </form>
    </Card>
  );
};

export default ChatTab;
