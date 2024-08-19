import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Props = {
  text: string;
  icon: React.ReactElement;
  link: string;
};

const DashboardLink: React.FC<Props> = ({ icon, text, link }) => {

  const selected = usePathname() === link;

  return (
    <li>
      <Link
        href={link}
        className={cn(
          selected ? "bg-gray-600" : "",
          "relative flex items-center space-x-4 rounded-xl bg-gradient-to-r  px-4 py-3 text-white group"
        )}
      >
        {
          React.cloneElement(icon, {
            className: "text-2xl group-hover:fill-gray-400",
          })
        }
        <span className="-mr-1 font-medium group-hover:text-gray-400">{text}</span>
      </Link>
    </li>
  );
};

export default DashboardLink;
