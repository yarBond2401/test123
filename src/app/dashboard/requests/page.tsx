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
import { DataTable, SingInDataTable } from "./components/data-table";
import {
  serviceRequestSchema,
  ServiceSignInRequestSchema,
} from "./schema";
import { useFirestoreSnapshot } from "@/hooks/useFirestoreSnapshot";

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

  const { data: requestsData } = useFirestoreSnapshot<any[]>(
    "requests",
    "brokerId",
    "==",
    broker?.id,
    {
      orderField: "createdAt",
      orderDirection: "desc",
    }
  );

  const requests = useMemo(() => {
    let parsed = z.array(serviceRequestSchema).parse(requestsData ?? []);
    parsed = parsed.map((request, idx) => ({
      ...request,
      // @ts-ignore
      createdAt: requestsData[idx].createdAt,
    }));

    parsed = parsed.map((request) => ({
      ...request,
      // @ts-ignore
      userDetails: { displayName: user?.displayName || '', photoURL: user?.photoURL || '', email: user?.email || '' } as {
        displayName: string;
        photoURL: string;
        email: string;
      },
    }));

    return parsed;
  }, [requestsData]);

  const [singInRequests, setRequests] = useState<ServiceSignInRequestSchema[]>([]);

  async function getSignInRequest() {
    const data = await getDocs(collection(db, "signInRequests"));
    const currentRequests: ServiceSignInRequestSchema[] = [];

    for (const docItem of data.docs) {
      currentRequests.push({ ...docItem.data(), id: docItem.id } as ServiceSignInRequestSchema)
    };

    setRequests(currentRequests);
  }

  useEffect(() => {
    getSignInRequest();
  }, []);

  return (
    <div className="grid px-6 pt-6 2xl:container grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="w-full md:col-span-2 lg:col-span-4">
        <Tabs.Root defaultValue="tab1">
          <CardHeader>
            <Tabs.List className="flex flex-row gap-4 border-b" aria-label="Manage your account">
              <Tabs.Trigger className="duration-100 data-[state=active]:border data-[state=active]:border-b-0 data-[state=active]:rounded-t-lg data-[state=active]:z-10 data-[state=active]:translate-y-px data-[state=active]:bg-white p-3" value="tab1">
                <CardTitle >Service Requests</CardTitle>
              </Tabs.Trigger>
              {/* <Tabs.Trigger className="duration-100 data-[state=active]:border data-[state=active]:border-b-0 data-[state=active]:rounded-t-lg data-[state=active]:z-10 data-[state=active]:translate-y-px data-[state=active]:bg-white p-3" value="tab2">
                <CardTitle >Sign Installation Requests</CardTitle>
              </Tabs.Trigger> */}
            </Tabs.List>
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
        </Tabs.Root>
      </Card>
    </div>
  );
};

export default Requests;
