import { Post } from "@/mock/types";
import Image from "next/image";
import Link from "next/link";
import { FC } from "react";
import { Separator } from "../ui/separator";
import { NewButton } from "../ui/new-button";

interface Props {
  post: Post;
}

export const PostItem: FC<Props> = ({ post }) => {
  const handleSubmit = () => {
    console.log("submit");
  };

  const budget = post.tax + post.subtotal;

  return (
    <div className="flex flex-col w-full">
      <Separator />
      <div className="flex flex-row w-full py-3 items-center px-4 justify-between">
        <div className="flex flex-row pr-4 w-40 gap-3 items-center box-border">
          <Image
            src={post.photo}
            alt={post.createdBy}
            className="h-10 w-10 rounded-full"
          />
          <p className="text-sm text-dashboard-main font-medium">
            {post.createdBy}
          </p>
        </div>
        <div className="md:flex hidden w-36 justify-center">
          <p className="xl:text-base text-sm leading-5 text-dashboard-main font-medium">
            {post.date}
          </p>
        </div>
        <div className="flex xl:w-[168px] w-32 xl:px-8 px-4 shrink-0 ">
          <p className="text-sm font-medium text-dashboard-main">
            {[...post.services.map((service) => service.name)].join(", ")}
          </p>
        </div>
        <div className="xl:w-40 px-4 justify-center xl:flex hidden ">
          <p className="text-base font-medium text-dashboard-main">
            {post.serviceNumber}
          </p>
        </div>
        <div className="md:flex hidden xl:w-32 px-4 justify-center">
          <p className="text-base font-medium text-dashboard-main">
            ${budget}
          </p>
        </div>
        <div className="flex w-28 justify-center">
          <Link
            href="/dashboard/find-post/[post-id]" as={`/dashboard/find-post/${post.id}`}
            className="text-sm text-[#A652BF] font-normal md:block hidden"
          >
            Get Details
          </Link>
          <Link
            href="/dashboard/find-post/[post-id]" as={`/dashboard/find-post/${post.id}`}
            className="text-sm text-[#A652BF] font-normal md:hidden block"
          >
            Details
          </Link>
        </div>
        <div className="flex md:w-40 justify-center">
          <NewButton
            type="button"
            onClick={handleSubmit}
          >
            Submit
          </NewButton>
        </div>
      </div>
    </div>
  );
};
