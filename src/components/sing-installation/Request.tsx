import { db } from "@/app/firebase";
import { doc, updateDoc, DocumentData } from "firebase/firestore";
import { toast } from "@/components/ui/use-toast";

import Image from "next/image";
import * as Select from "@radix-ui/react-select";
import { FC, useState } from "react";
import { Separator } from "../ui/separator";
import DropdownIcon from "@/icons/icon=chevron-down-grey.svg";
import { NewButton } from "../ui/new-button";
import defaultAvatar from "@/images/default-user-picture.jpg";
import { format } from "date-fns";
import {ServiceSignInRequestSchema} from "@/app/dashboard/requests/schema";
import type {User} from "firebase/auth";

interface Props {
  user: User | null;
  request: ServiceSignInRequestSchema;
}

export const RequestItem: FC<Props> = ({ request, user }) => {
  const dealStatus = ["Approved", "Pending Install", "Installed"];
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(request.status);

  const handleSubmit = async (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setIsLoading(true);
    let docRef = doc(db, "signInRequests", request.id);
    await updateDoc(docRef, {
      status: selectedStatus,
      signInApprover: {
        email: user?.email || '',
        photoURL: user?.photoURL || '',
        uid: user?.uid || '',
        displayName: user?.displayName || '',
      },
    });
    toast({
      title: "Success",
      description: "Submitted",
    });
    setIsLoading(false);
    console.log("submit");
  };



  return (
    <div className="flex flex-col w-full">
      <Separator />
      <div className="flex flex-row w-full py-3 items-center px-4 justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-row w-32 gap-3 items-center box-border">
            <Image
                width={32}
                height={32}
              src={request.userInfo?.photoURL || defaultAvatar}
              alt={'photo'}
              className="h-10 w-10 rounded-full"
            />
            <p className="text-sm text-dashboard-main font-medium">
              {request.firstName}
            </p>
          </div>
          <div className="flex flex-col gap-2 md:hidden">
            <p className="text-sm leading-5 text-dashboard-main font-medium ">
              {request.phoneNumber}
            </p>
            <p className="xl:text-base text-sm leading-5 text-dashboard-main font-medium">
              {format(request.createdAt.toDate(), "dd/MM/yyyy")}
            </p>
          </div>
        </div>
        <div className="md:flex w-52 justify-center hidden">
          <p className="xl:text-base text-sm leading-5 text-dashboard-main font-medium">
            {request.phoneNumber}
          </p>
        </div>
        <div className="md:flex w-32 justify-center hidden">
          <p className="xl:text-base text-sm leading-5 text-dashboard-main font-medium">
          {format(request.createdAt.toDate(), "dd/MM/yyyy")}
          </p>
        </div>
        <div className="flex w-52 pl-4 justify-center">
          <p className="xl:text-base text-sm leading-5 text-dashboard-main font-medium">
            {request.description}
          </p>
        </div>
        <div className="flex xl:w-56 pl-3 w-40 justify-center">
          <Select.Root value={selectedStatus} onValueChange={(value: string) => {
            if (value === "Approved" || value === "Pending Install" || value === "Installed") {
              setSelectedStatus(value);
            } else {
              console.error("Invalid status: ", value);
            }
          }}>
            <Select.Trigger className="flex flex-row w-40 gap-[10px] xl:px-3 px-2 py-2 border justify-between border-[#DFE4EA] rounded-md outline-none items-center xl:text-base text-sm text-dashboard-secondary hover:border-[#3758F9]">
              <Select.Value />
              <Select.Icon>
                <Image src={DropdownIcon} alt="icon" height={18} width={18} />
              </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
              <Select.Content className="bg-white border border-[#DFE4EA] rounded-md outline-none">
                <Select.Viewport className="xl:text-base text-sm text-dashboard-secondary">
                  <Select.Item
                    value={dealStatus[0]}
                    className="xl:px-3 px-1 md:py-2 py-1 outline-none rounded-md hover:bg-[#3758F9] hover:text-white"
                  >
                    <Select.ItemText>{dealStatus[0]}</Select.ItemText>
                  </Select.Item>
                  <Select.Item
                    value={dealStatus[1]}
                    className="xl:px-3 px-1 md:py-2 py-1 outline-none rounded-md hover:bg-[#3758F9] hover:text-white"
                  >
                    <Select.ItemText>{dealStatus[1]}</Select.ItemText>
                  </Select.Item>
                  <Select.Item
                    value={dealStatus[2]}
                    className="xl:px-3 px-1 md:py-2 py-1 outline-none rounded-md hover:bg-[#3758F9] hover:text-white"
                  >
                    <Select.ItemText>{dealStatus[2]}</Select.ItemText>
                  </Select.Item>
                </Select.Viewport>
                <Select.Arrow />
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>
        <div className="flex md:w-32 pl-3 justify-center">
          <button disabled={isLoading}
            className="md:px-6 px-3 md:py-[10px] py-2 bg-[#5352BF] hover:bg-[#1B44C8] md:text-base text-sm md:font-medium font-normal text-white rounded-md"
            type="submit"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};
