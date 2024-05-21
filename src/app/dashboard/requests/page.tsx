"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import * as Tabs from "@radix-ui/react-tabs";

import { getDocs, collection, QuerySnapshot, doc, getDoc, DocumentData } from "firebase/firestore";
import { db } from "@/app/firebase";
import { BrokerType } from "@/app/firestoreTypes";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useFirestoreFunction } from "@/hooks/useFirestoreFunction";
import { useFirestoreQuery } from "@/hooks/useFirestoreQuery";
import { useRequireLogin } from "@/hooks/useRequireLogin";

import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { serviceRequestSchema, signInRequestCreateSchema } from "./schema";
import { Separator } from "@/components/ui/separator";
import { NewButton } from "@/components/ui/new-button";

const Requests = () => {
  const router = useRouter();
  const { user } = useRequireLogin({
    onUnauthenticated: () => {
      router.push("/auth/signin");
    },
  });

  const { data: brokerData } = useFirestoreQuery<BrokerType[]>(
    "brokers",
    "users",
    "array-contains",
    user?.uid
  );
  const broker: BrokerType | undefined = brokerData?.[0];

  const { data: requestsData } = useFirestoreQuery<any[]>(
    "requests",
    "brokerId",
    "==",
    broker?.id,
    {
      orderField: "createdAt",
      orderDirection: "desc",
    }
  );

  const { data: usersDetails } = useFirestoreFunction({
    name: "get_users_info",
    // @ts-ignore
    payload: requestsData?.length
      ? { uids: requestsData?.map((request) => request.userId) }
      : null,
  });

  const requests = useMemo(() => {
    let parsed = z.array(serviceRequestSchema).parse(requestsData ?? []);
    parsed = parsed.map((request, idx) => ({
      ...request,
      // @ts-ignore
      createdAt: requestsData[idx].createdAt,
    }));

    // @ts-ignore
    if (usersDetails) {
      parsed = parsed.map((request) => ({
        ...request,
        // @ts-ignore
        userDetails: usersDetails.find(
          (user: any) => user.uid === request.userId
        ) as {
          displayName: string;
          photoURL: string;
          email: string;
        },
      }));
    }

    return parsed;
  }, [requestsData, usersDetails]);

  const [singInRequests, setSingInRequests] = useState<DocumentData[]>([]);

  useEffect(() => {
    async function fetch() {
    const data = await getDocs(collection(db, "signInRequests"));
    const currentRequests: DocumentData[] = [];

    for (const docItem of data.docs) {
    // data.forEach((docItem) => {
      // const userRef = doc(db, "brokers", docItem.data().userId);
      // let userSnap = await getDoc(userRef);
      const date = new Date(docItem.data().createdAt);
      const formattedDate = date.getDate() + "/" + date.getMonth()+1 + "/" + date.getFullYear();
      console.log(date);
      currentRequests.push({...docItem.data(), id: docItem.id})
    };

    setSingInRequests(currentRequests);
    }

    fetch();
},[]);

  // useEffect(() => {
  //   console.log(requests);
  //   console.log(usersDetails);
  // }, [requests, usersDetails]);

  return (
    <div className="grid px-6 pt-6 2xl:container grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="w-full md:col-span-2 lg:col-span-4">
        <Tabs.Root className="" defaultValue="tab1">
          <CardHeader>
            <Tabs.List className="flex flex-row gap-4" aria-label="Manage your account">
              <Tabs.Trigger className="data-[state=active]:underline" value="tab1">
                <CardTitle className="">Service Requests</CardTitle>
              </Tabs.Trigger>
              <Tabs.Trigger className="data-[state=active]:underline" value="tab2">
                <CardTitle className="">Sing Installation Requests</CardTitle>
              </Tabs.Trigger>
            </Tabs.List>
            <Separator />
          </CardHeader>
          <Tabs.Content className="" value="tab1">
            <CardContent>
              <Button 
                onClick={() => router.push("/dashboard/requests/add")}
                type="button"
              >
                Add a service request
              </Button>
              <DataTable
                columns={columns}
                // @ts-ignore
                rows={requests}
              />
            </CardContent>
          </Tabs.Content>
          <Tabs.Content className="TabsContent" value="tab2">
            <CardContent>
              <Button
                onClick={() => router.push("/dashboard/requests/signInRequest")}
                type="button"
              >
                Add a Sign Installation Request
              </Button>
              <DataTable
                columns={columns}
                // @ts-ignore
                rows={singInRequests}
              />
            </CardContent>
          </Tabs.Content>
        </Tabs.Root>
      </Card>
    </div>
  );
};

export default Requests;
