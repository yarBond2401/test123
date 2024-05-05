import Image from "next/image";
import { FC } from "react";

import iconArrow from "@/icons/icon=arrow-up.svg";

interface Props {
  icon: string;
  result: string;
  total: string;
  grow: string;
}

export const Statistics: FC<Props> = ({ icon, result, total, grow }) => {
  return (
    <div className="flex bg-white border border-[#DFE4EA] rounded-10 flex-col w-full xl:p-22 p-4 gap-5">
      <div className="flex items-center justify-center rounded-full bg-[#5296BF] w-[50px] h-[50px]">
        <Image src={icon} alt="dollar" height={24} width={24} />
      </div>
      <div className="flex xl:flex-row lg:flex-col flex-row gap-2 justify-between w-full">
        <div className="flex flex-col gap-2 justify-between h-full">
          <p className="text-dashboard-main xl:text-2xl lg:text-lg text-2xl leading-[29px] font-bold">
            {result}
          </p>
          <p className="text-dashboard-secondary leading-[22px] font-medium 2xl:text-base lg:text-sm text-base">
            Total {total}
          </p>
        </div>
        <div className="flex flex-row gap-1 items-end self-end">
          <p className="text-[#089348] leading-[22px] font-bold 2xl:text-lg lg:text-base text-lg">
            {grow}
          </p>
          <Image src={iconArrow} alt="dollar" height={24} width={24} />
        </div>
      </div>
    </div>
  );
};
