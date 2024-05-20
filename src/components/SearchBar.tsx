import Image from "next/image";
import { cn } from "@/lib/utils";
import SearchIcon from "@/icons/icon=search.svg";
import { FC, useState } from "react";

interface Props {
  searchQuery: string;
  onChange: (value: string) => void;
}

export const SearchBar: FC<Props> = ({ searchQuery, onChange }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className={cn(
        "flex flex-row w-full gap-1 pl-5 pr-4 py-3 border border-[#DFE4EA] rounded-md items-center xl:text-base text-sm text-dashboard-secondary hover:border-[#3758F9]",
        isFocused && "border-[#ADBCF2]"
      )}
    >
      <input
        type="text"
        className="border-0 outline-none w-full"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onSubmit={() => setIsFocused(false)}
      />
      <Image src={SearchIcon} alt="search" width={16} height={16} />
    </div>
  );
};
