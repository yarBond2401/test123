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

      <div className="2xl:px-6 xl:px-4 lg:px-2 px-6 py-4 flex-row w-full justify-between md:flex hidden">
        <div className="flex flex-row xl:gap-4 gap-2 items-center xl:w-1/3 w-20">
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
            <p className="text-sm font-regular text-dashboard-secondary xl:block hidden">
              {deal.partner.mail}
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center 2xl:px-6 pl-4 pr-0 2xl:w-1/4">
          <p className="2xl:text-base text-sm leading-5 font-regular text-dashboard-main">
            {deal.deal}
          </p>
          <p className="text-sm font-regular text-dashboard-secondary">
            {deal.date}
          </p>
        </div>

        <div className="flex 2xl:px-6 px-4 items-center justify-center 2xl:min-w-36 min-w-20">
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

        <div className="flex 2xl:px-6 xl:px-3 lg:px-0 items-center justify-center">
          <p className="text-base leading-5 font-medium text-dashboard-main">
            ${deal.income}
          </p>
        </div>

        <div className="flex 2xl:pl-6 pl-4 items-center justify-center 2xl:w-40 w-12">
          <Link href="/" className="text-base leading-5 text-[#5352BF]">
            View
          </Link>
        </div>
      </div>

      <div className="px-6 py-4 flex-row w-full justify-between md:hidden flex ">
        <div className="flex flex-col gap-3 items-start justify-between">
          <div className="flex flex-row gap-2 items-center">
            <Image
              src={deal.partner.avatar}
              height={40}
              width={40}
              alt={deal.partner.name}
              className="rounded-full"
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
          <div className="flex flex-col justify-center">
            <p className="text-base leading-5 font-medium text-dashboard-main">
              {deal.deal}
            </p>
            <p className="text-sm font-regular text-dashboard-secondary">
              {deal.date}
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between items-center">
        <div className="flex ">
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

          <div className="flex items-center justify-center">
          <p className="text-base leading-5 font-medium text-dashboard-main">
            ${deal.income}
          </p>
        </div>

        <div className="flex items-center justify-center w-12">
          <Link href="/" className="text-base leading-5 text-[#5352BF]">
            View
          </Link>
        </div>
        </div>
      </div>
    </div>
  );
};
