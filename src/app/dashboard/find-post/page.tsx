"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import iconFilter from "@/icons/icon=filter.svg";
import { Th } from "@/components/Th";
import { posts } from "@/mock/postsMock";
import { PostItem } from "@/components/find-post/Post";

const FindPost = () => {
  const filterHandler = () => {
    console.log("filter");
  };

  return (
    <Card className="w-full md:col-span-2 lg:col-span-4">
      <CardHeader>
        <div className="w-full flex justify-between flex-row items-center">
          <CardTitle>Find Post</CardTitle>
          <button type="button" onClick={filterHandler}>
            <Image src={iconFilter} alt="filter" />
          </button>
        </div>
        <Separator />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col shadow bg-white border border-gray-200 rounded-10 w-full">
          <div className="flex flex-row justify-between w-full py-3 px-4 items-center">
            <Th styles="flex w-40">Created by</Th>
            <Th styles="justify-center w-36 md:flex hidden">Date of work</Th>
            <Th styles="flex justify-center xl:w-[168px] w-28 shrink-0">Service needed</Th>
            <Th styles="justify-center xl:w-40 xl:flex hidden">Number of service</Th>
            <Th styles="md:flex hidden justify-center xl:w-32 px-4">Budget</Th>
            <Th styles="md:w-28 w-24" />
            <Th styles="md:w-40 w-24" />
          </div>
          <div className="flex flex-col">
            {posts.map((post) => {
              return <PostItem key={post.id} post={post} />;
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FindPost;
