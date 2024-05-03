import Link from "next/link";
import { FC } from "react";
import * as Avatar from "@radix-ui/react-avatar";

import { DealType, InboxItemType } from "@/mock/types";
import Image from "next/image";
import { Separator } from "../ui/separator";

interface Props {
  deal: DealType;
}

export const DealItem: FC<Props> = ({ deal }) => {
  return (
    <div className="flex flex-col w-full">
      <Separator />

      <div className="px-6 py-4 flex flex-row">
        <div className="flex flex-row gap-4 items-center w-1/3">
          {/* <Avatar.Root className="rounded-full h-11 w-11">
            <Avatar.Image src={deal.partner.avatar} height={40} width={40} alt={deal.partner.name} />
          </Avatar.Root> */}
          <Image
            src={deal.partner.avatar}
            height={40}
            width={40}
            alt={deal.partner.name}
          />

          <div className="flex flex-col">
            <p className="text-sm font-medium text-dashboard-main">
              {deal.partner.name}
            </p>
            <p className="text-sm font-regular text-dashboard-secondary">
              {deal.partner.mail}
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center px-6 w-1/4">
          <p className="text-base leading-5 font-regular text-dashboard-main">
            {deal.deal}
          </p>
          <p className="text-sm font-regular text-dashboard-secondary">
            {deal.date}
          </p>
        </div>

        <div className="flex px-6 items-center justify-center min-w-36">
          {deal.isCompleted ? (
            <div className="bg-emerald-100 text-emerald-800 px-[10px] py-[2px] rounded-full text-sm leading-4 self-center">
              <p>Completed</p>
            </div>
          ) : (
            <div className="bg-red-100 text-red-800 px-[10px] py-[2px] rounded-full text-sm leading-4 self-center">
              <p>Active</p>
            </div>
          )}
        </div>

        <div className="flex px-6 items-center justify-center">
          <p className="text-base leading-5 font-medium text-dashboard-main">${deal.income}</p>
        </div>

        <div className="flex px-6 items-center justify-center w-40">
          <Link href="/" className="text-base leading-5 text-[#5352BF]">View</Link>
        </div>
      </div>
    </div>
  );
};
