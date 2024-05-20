import Link from "next/link";
import { FC } from "react";
import { cn } from "@/lib/utils";

import { ChatItem } from "@/mock/types";
import Image from "next/image";
import { Skeleton } from "../ui/skeleton";

interface Props {
  item: ChatItem,
  chatId?: string,
  messageStyles?: string,
}

export const InboxItem: FC<Props> = ({ item, chatId, messageStyles }) => {
  return (
    <Link href={`/dashboard/chat/${item.id}`}>
      <div
        className={cn(
          "flex flex-row gap-3.5 2xl:px-[15px] px-1 py-[10px] items-center rounded-[5px]",
          chatId === item.id ? "bg-[#F9FAFB]" : "hover:bg-[#F9FAFB]"
        )}
      >
        <div className="relative 2xl:h-11 2xl:w-11 md:h-8 md:w-8 h-11 w-11 shrink-0">
          {item.userDetails.photo ? (
            <Image src={item.userDetails.photo} alt={item.userDetails.name} className="w-full h-auto rounded-full" />
          ) : (
            <Skeleton className="w-10 h-10 rounded-full" />
          )}

          <div
            className={cn(
              item.userDetails.online ? "bg-green-400" : "bg-red-500",
              "2xl:w-3 2xl:h-3 md:w-2 md:h-2 w-3 h-3 rounded-full 2xl:border-[2px] md:border border-[2px] border-white absolute bottom-0 right-0 box-border"
            )}
          />
        </div>

        <div className="flex flex-col w-full overflow-hidden">
          {item.userDetails.name ? (
            <p className="2xl:text-base md:text-sm text-base leading-[22px] font-medium text-dashboard-main">
              {item.userDetails.name}
            </p>
          ) : (
            <Skeleton className="w-24 h-4" />
          )}

          <p className={cn(
              "2xl:text-sm md:text-xs text-sm text-nowrap w-full",
              messageStyles,
            )}>
            {item.lastMessage}
          </p>
        </div>
      </div>
    </Link>
  );
};
