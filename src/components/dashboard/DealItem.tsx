import { FC } from "react";

import Image from "next/image";
import { Separator } from "../ui/separator";
import { format } from "date-fns";
import { capitalize, cn } from "@/lib/utils";
import { useOfferDetails } from "@/hooks/useOfferDetails";
import { Button } from "../ui/button";

interface Props {
  deal: any;
  isVendor?: boolean;
}

export const DealItem: FC<Props> = ({ deal, isVendor }) => {
  console.log(deal);

  const costs = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(isVendor ? deal.vendorСosts : deal.withoutTax);

  const { openDialog } = useOfferDetails();

  return (
    <div className="flex flex-col w-full">
      <Separator />

      <div className="2xl:px-6 xl:px-4 lg:px-2 px-6 py-4 flex-row w-full justify-between md:flex hidden">
        <div className="flex flex-row xl:gap-4 gap-2 items-center xl:w-1/3 w-20">
          <Image
            src={deal?.otherUserDetails?.photoURL}
            height={40}
            width={40}
            alt={deal?.otherUserDetails?.displayName}
          />

          <div className="flex flex-col">
            <p className="text-sm font-medium text-dashboard-main">
              {deal?.otherUserDetails?.displayName}
            </p>
            <p className="text-sm font-regular text-dashboard-secondary xl:block hidden">
              {deal?.otherUserDetails?.email}
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center 2xl:px-6 pl-4 pr-0 2xl:w-1/4">
          <p className="2xl:text-base text-sm leading-5 font-regular text-dashboard-main">
            {/* {deal.name} */}
            {isVendor ? "Deal" : "Offer"}
          </p>
          <p className="text-sm font-regular text-dashboard-secondary">
            {format(deal.offerDate.toDate(), "dd/MM/yyyy")}
          </p>
        </div>

        <div className="flex 2xl:px-6 px-4 items-center justify-center 2xl:min-w-36 min-w-20">
          <div
            className={cn(
              "rounded-full px-[10px] py-[2px] text-sm leading-4 self-center",
              {
                "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400":
                  deal?.status === "pending",
                "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400":
                  deal?.status === "accepted",
                "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400":
                  deal?.status === "rejected",
                "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400":
                  deal?.status === "completed",
              },
            )}
          >
            {capitalize(deal?.status)}
          </div>
        </div>

        <div className="flex 2xl:px-6 xl:px-3 lg:px-0 items-center justify-center">
          <p className="text-base leading-5 font-medium text-dashboard-main">
            {costs}
          </p>
        </div>

        <div className="flex 2xl:pl-6 pl-4 items-center justify-center 2xl:w-40 w-12">
          <Button
            variant="link"
            className="text-base leading-5 text-[#5352BF]"
            onClick={() => openDialog(deal.id)}
          >
            View
          </Button>
        </div>
      </div>

      <div className="px-6 py-4 flex-row w-full justify-between md:hidden flex ">
        <div className="flex flex-col gap-3 items-start justify-between">
          <div className="flex flex-row gap-2 items-center">
            <Image
              src={deal?.otherUserDetails?.photoURL}
              height={40}
              width={40}
              alt={deal?.otherUserDetails?.displayName}
              className="rounded-full"
            />

            <div className="flex flex-col">
              <p className="text-sm font-medium text-dashboard-main">
                {deal?.otherUserDetails?.displayName}
              </p>
              <p className="text-sm font-regular text-dashboard-secondary">
                {deal?.otherUserDetails?.email}
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-base leading-5 font-medium text-dashboard-main">
              {isVendor ? "Deal" : "Offer"}
            </p>
            <p className="text-sm font-regular text-dashboard-secondary">
              {format(deal.offerDate.toDate(), "dd/MM/yyyy")}
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-between items-center">
          <div className="flex">
            <div
              className={cn(
                "rounded-full px-[10px] py-[2px] text-sm leading-4 self-center",
                {
                  "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400":
                    deal?.status === "pending",
                  "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400":
                    deal?.status === "accepted",
                  "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400":
                    deal?.status === "rejected",
                  "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400":
                    deal?.status === "completed",
                },
              )}
            >
              {capitalize(deal?.status)}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <p className="text-base leading-5 font-medium text-dashboard-main">
              {costs}
            </p>
          </div>

          <div className="flex items-center justify-center w-12">
            <Button
              variant="link"
              className="text-base leading-5 text-[#5352BF]"
              onClick={() => openDialog(deal.id)}
            >
              View
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
