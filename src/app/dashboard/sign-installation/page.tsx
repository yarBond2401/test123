"use client";

import Image from "next/image";
import { RequestItem } from "@/components/sing-installation/Request";
import { Th } from "@/components/Th";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { superRequests } from "@/mock/requests";
import SearchIcon from "@/icons/icon=search.svg";
import { useState } from "react";
import { cn } from "@/lib/utils";

const SignInstallation = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const filteredRequests = superRequests.filter(
    (request) =>
      request.createdBy
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase()) ||
      request.email.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      request.notes.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="w-full flex justify-between flex-row items-center">
          <CardTitle>Sign Installation Request</CardTitle>
          <div
            className={cn(
              "flex flex-row gap-1 pl-5 pr-4 py-3 border border-[#DFE4EA] rounded-md items-center xl:text-base text-sm text-dashboard-secondary hover:border-[#3758F9]",
              isFocused && "border-[#ADBCF2]"
            )}
          >
            <input
              type="text"
              className="border-0 outline-none"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onSubmit={() => setIsFocused(false)}
            />
            <Image src={SearchIcon} alt="search" width={16} height={16} />
          </div>
        </div>
        <Separator />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col bg-white border border-gray-200 rounded-10 w-full shadow">
          <div className="flex flex-row justify-between w-full py-3 px-4 items-center">
            <Th styles="flex w-32">Created by</Th>
            <Th styles="justify-center w-52 md:flex hidden">Email</Th>
            <Th styles="md:flex hidden justify-center w-[130px]">
              Date of work
            </Th>
            <Th styles="justify-center pl-4 xl:w-52 w-44 flex">Notes</Th>
            <Th styles="flex justify-center xl:w-56 w-40 px-4">Sign Status</Th>
            <Th styles="xl:w-32 md:w-28 w-20" />
          </div>
          <div className="flex flex-col">
            {!!filteredRequests.length ? (
              filteredRequests.map((request) => {
                return <RequestItem key={request.id} request={request} />;
              })
            ) : (
              <div className="flex flex-col w-full">
                <Separator />
                <div className="flex items-center justify-center p-10">
                  <p className="xl:text-base text-sm leading-5 text-dashboard-main font-medium">
                    Unfortunately no requests match your search query.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignInstallation;
