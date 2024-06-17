"use client";

import { getDocs, collection } from "firebase/firestore";
import { db } from "@/app/firebase";
import { useRouter } from "next/navigation";
import { RequestItem } from "@/components/sing-installation/Request";
import { Th } from "@/components/Th";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { useEffect, useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { ServiceSignInRequestSchema } from "../requests/schema";
import { useRequireLogin } from "@/hooks/useRequireLogin";
import { ArrowUpDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const SignInstallation = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { user } = useRequireLogin({
    onUnauthenticated: () => {
      router.push("/auth/signin");
    },
  });
  const [requests, setRequests] = useState<ServiceSignInRequestSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");


  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const data = await getDocs(collection(db, "signInRequests"));
      const currentRequests: ServiceSignInRequestSchema[] = [];

      for (const docItem of data.docs) {
        currentRequests.push({ ...docItem.data(), id: docItem.id } as ServiceSignInRequestSchema)
      };

      setRequests(currentRequests);
      setLoading(false);
    }

    fetch();
  }, []);

  const handleSort = () => {
    const direction = sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(direction);
  };

  const filteredRequests = requests
    .filter(
      (request) =>
        request.firstName.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        request.requestName.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        request.description.toLowerCase().includes(searchQuery.trim().toLowerCase())
    )
    .sort((a, b) => {
      const dateA = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000 + a.createdAt.nanoseconds / 1000000) : new Date(0);
      const dateB = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000 + b.createdAt.nanoseconds / 1000000) : new Date(0);
      return sortDirection === "asc" ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    });

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
          <div className="flex flex-row justify-between w-full py-3 px-4 items-center gap-2">
            <Th styles="flex w-32">Created by</Th>
            <Th styles="justify-center w-52 md:flex hidden">Phone number</Th>
            <Th styles="md:flex hidden w-[150px] cursor-pointer" >
              <Button variant="ghost" className="w-[150px] p-0" onClick={handleSort}>
                Date of creation <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </Th>

            <Th styles="justify-center xl:w-52 w-44 flex">Notes</Th>
            <Th styles="justify-center flex xl:w-56 w-44 px-4">Sign Status</Th>
          </div>
          <div className="flex flex-col">
            {loading ? (
              <div className="flex justify-center items-center my-20">
                <Loader2 className="animate-spin text-gray-500" size={34} />
              </div>
            ) : !!filteredRequests.length ? (
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
