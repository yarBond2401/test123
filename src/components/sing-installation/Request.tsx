import { SuperRequest } from "@/mock/types";
import Image from "next/image";
import * as Select from "@radix-ui/react-select";
import { FC, useState } from "react";
import { Separator } from "../ui/separator";
import DropdownIcon from "@/icons/icon=chevron-down-grey.svg";

interface Props {
  request: SuperRequest;
}

export const RequestItem: FC<Props> = ({ request }) => {
  const dealStatus = ["Installed", "Resolved", "Issued"];
  const [selectedStatus, setSelectedStatus] = useState(dealStatus[0]);

  const handleSubmit = () => {
    console.log("submit");
  };

  return (
    <div className="flex flex-col w-full">
      <Separator />
      <div className="flex flex-row w-full py-3 items-center px-4 justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-row w-32 gap-3 items-center box-border">
            <Image
              src={request.photo}
              alt={request.createdBy}
              className="h-10 w-10 rounded-full"
            />
            <p className="text-sm text-dashboard-main font-medium">
              {request.createdBy}
            </p>
          </div>
          <div className="flex flex-col gap-2 md:hidden">
            <p className="text-sm leading-5 text-dashboard-main font-medium ">
              {request.email}
            </p>
            <p className="xl:text-base text-sm leading-5 text-dashboard-main font-medium">
              {request.date}
            </p>
          </div>
        </div>
        <div className="md:flex w-52 justify-center hidden">
          <p className="xl:text-base text-sm leading-5 text-dashboard-main font-medium">
            {request.email}
          </p>
        </div>
        <div className="md:flex w-32 justify-center hidden">
          <p className="xl:text-base text-sm leading-5 text-dashboard-main font-medium">
            {request.date}
          </p>
        </div>
        <div className="flex w-52 pl-4 justify-center">
          <p className="xl:text-base text-sm leading-5 text-dashboard-main font-medium">
            {request.notes}
          </p>
        </div>
        <div className="flex xl:w-56 pl-3 w-40 justify-center">
          <Select.Root value={selectedStatus} onValueChange={setSelectedStatus}>
            <Select.Trigger className="flex flex-row gap-[10px] xl:px-3 px-2 py-2 border border-[#DFE4EA] rounded-md outline-none items-center xl:text-base text-sm text-dashboard-secondary hover:border-[#3758F9]">
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
          <button
            type="button"
            onClick={handleSubmit}
            className="xl:px-6 px-3 xl:py-[10px] py-2 bg-[#5352BF] hover:bg-[#1B44C8] xl:text-base text-sm xl:font-medium font-normal text-white rounded-md"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};