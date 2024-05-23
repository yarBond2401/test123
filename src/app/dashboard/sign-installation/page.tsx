"use client";

import { getDocs, collection, QuerySnapshot, doc, getDoc, DocumentData } from "firebase/firestore";
import { db } from "@/app/firebase";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { RequestItem } from "@/components/sing-installation/Request";
import { Th } from "@/components/Th";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { superRequests } from "@/mock/requests";

import { useEffect, useMemo, useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import {serviceRequestSchema, ServiceSignInRequestSchema, signInRequestWithUsersSchema} from "../requests/schema";
import { useFirestoreQuery } from "@/hooks/useFirestoreQuery";
import { useFirestoreFunction } from "@/hooks/useFirestoreFunction";
import { BrokerType } from "@/app/firestoreTypes";
import { useRequireLogin } from "@/hooks/useRequireLogin";

const SignInstallation = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { user } = useRequireLogin({
    onUnauthenticated: () => {
      router.push("/auth/signin");
    },
  });
  const [requests, setRequests] = useState<ServiceSignInRequestSchema[]>([]);

  useEffect(() => {
    async function fetch() {
    const data = await getDocs(collection(db, "signInRequests"));
    const currentRequests: ServiceSignInRequestSchema[] = [];

    for (const docItem of data.docs) {
      currentRequests.push({...docItem.data(), id: docItem.id} as ServiceSignInRequestSchema)
    };

    setRequests(currentRequests);
    }

    fetch();
},[]);

  const filteredRequests = requests.filter(
    (request) =>
      request.firstName
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase()) ||
      request.requestName.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      request.description.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="w-full flex justify-between flex-row items-center">
          <CardTitle>Sign Installation Request</CardTitle>
          <div className="w-64">
            <SearchBar searchQuery={searchQuery} onChange={setSearchQuery} />
          </div>
        </div>
        <Separator />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col bg-white border border-gray-200 rounded-10 w-full shadow">
          <div className="flex flex-row justify-between w-full py-3 px-4 items-center">
            <Th styles="flex w-32">Created by</Th>
            <Th styles="justify-center w-52 md:flex hidden">Phone number</Th>
            <Th styles="md:flex hidden justify-center w-[130px]">
              Date of work
            </Th>
            <Th styles="justify-center pl-4 xl:w-52 w-44 flex">Notes</Th>
            <Th styles="flex justify-center xl:w-56 w-40 px-4">Sign Status</Th>
            <Th styles="xl:w-32 md:w-28 w-20" />
          </div>
          <div className="flex flex-col">
            {!!filteredRequests.length ? (
              filteredRequests.map((request, i) => (
                <RequestItem key={i} user={user} request={request} />
              ))
            ) : (
              <div className="flex flex-col w-full">
                <Separator />
                <div className="flex items-center justify-center p-10">
                  <p className="xl:text-base text-sm leading-5 text-dashboard-main font-medium">
                    Unfortunately, no requests match your search query.
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
