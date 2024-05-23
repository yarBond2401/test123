import { FC, ReactNode } from "react";

interface Props {
  children: ReactNode;
  onClick: () => void;
  type: "button" | "submit" | "reset";
}

export const NewButton: FC<Props> = ({ children, onClick, type }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className="md:px-6 px-3 md:py-[10px] py-2 bg-[#5352BF] hover:bg-[#1B44C8] md:text-base text-sm md:font-medium font-normal text-white rounded-md"
    >
      {children}
    </button>
  );
};
