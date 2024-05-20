"use client";

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

import { BrokerType } from '@/app/firestoreTypes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestoreFunction } from '@/hooks/useFirestoreFunction';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { useRequireLogin } from '@/hooks/useRequireLogin';

import { columns } from './components/columns';
import { DataTable } from './components/data-table';
import { serviceRequestSchema } from './schema';

const Requests = () => {
  const router = useRouter();
  const { user } = useRequireLogin({
    onUnauthenticated: () => {
      router.push("/auth/signin");
    }
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
      orderDirection: "desc"
    }
  );

  const { data: usersDetails } = useFirestoreFunction({
    name: "get_users_info",
    // @ts-ignore
    payload: requestsData?.length ?
      { uids: requestsData?.map(request => request.userId) } : null
  })


  const requests = useMemo(() => {
    let parsed = z.array(serviceRequestSchema).parse(
      requestsData ?? []
    )
    parsed = parsed.map((request, idx) => ({
      ...request,
      // @ts-ignore
      createdAt: requestsData[idx].createdAt
    }));

    // @ts-ignore
    if (usersDetails) {
      parsed = parsed.map((request) => ({
        ...request,
        // @ts-ignore
        userDetails: usersDetails.find((user: any) => user.uid === request.userId) as {
          displayName: string;
          photoURL: string;
          email: string;
        }
      }))
    }

    return parsed;
  }, [requestsData, usersDetails]);


  // useEffect(() => {
  //   console.log(requests);
  //   console.log(usersDetails);
  // }, [requests, usersDetails]);


  return (
    <div className="grid px-6 pt-6 2xl:container grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="w-full md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle>
            Service Requests
          </CardTitle>
          <CardDescription>
            {"This is where you can view and manage all your and member's service requests"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="mb-4"
            onClick={() => router.push("/dashboard/requests/add")}
            type="button"
          >
            Add a service request
          </Button>
          <Button
              className="mb-4 ml-2"
              onClick={() => router.push("/dashboard/requests/signInRequest")}
              type="button"
          >
            Add a Sign In service request
          </Button>
          <DataTable
            columns={columns}
            // @ts-ignore
            rows={requests}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Requests;
