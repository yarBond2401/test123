import Link from "next/link";
import { FC } from "react";
import * as Avatar from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

import { InboxItemType } from "@/mock/types";
import Image from "next/image";

interface Props {
  item: InboxItemType;
}

export const InboxItem: FC<Props> = ({ item }) => {
  return (
    <Link href="/dashboard/chat">
      <div className="flex flex-row gap-3.5 2xl:px-[15px] px-1 py-[10px] items-center hover:bg-[#F9FAFB] rounded-[5px]">
        {/* <Avatar.Root className="rounded-full h-11 w-11">
          <Avatar.Image src={item.photo} height={44} width={44} alt={item.name} />
        </Avatar.Root> */}
        <div className="relative 2xl:h-11 2xl:w-11 md:h-8 md:w-8 h-11 w-11">
          <Image src={item.photo} alt={item.name} className="w-full h-auto"/>
          <div className={cn(
            item.online ? "bg-green-400" : "bg-red-500", 
            "2xl:w-3 2xl:h-3 md:w-2 md:h-2 w-3 h-3 rounded-full 2xl:border-[2px] md:border border-[2px] border-white absolute bottom-0 right-0 box-border"
          )}/>
        </div>

        <div className="flex flex-col">
          <p className="2xl:text-base md:text-sm text-base leading-[22px] font-medium text-dashboard-main">{item.name}</p>
          <p className="2xl:text-sm md:text-xs text-sm font-medium text-dashboard-secondary">{item.massage}</p>
        </div>
      </div>
    </Link>
  );
};
