"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFirestoreFunction } from "@/hooks/useFirestoreFunction";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  query,
  updateDoc,
  where
} from "firebase/firestore";
import { type ServiceRequest } from "../schema";
import React, { useMemo } from "react";
import { format } from "date-fns";
import { UsersV1Type } from "@/app/firestoreTypes";
import { MdCheck, MdClose, MdMessage, MdOutlineStar, MdOutlineStarBorder, MdOutlineStarHalf } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { db } from "@/app/firebase";
import { useRequireLogin } from "@/hooks/useRequireLogin";
import { useRouter } from "next/navigation";
import { useFirestoreDocumentRT } from "@/hooks/useFirestoreDocumentRT";
import { OFFERED_SERVICES } from "@/app/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dot } from "@/lib/utils";
import { useRequest } from "@/components/RequestContext";


interface Props {
  params: {
    id: string;
  };
}

const starsRender = (score: number) => {
  const stars = []
  for (let i = 0; i < 5; i++) {
    if (score >= i + 1) {
      stars.push(<MdOutlineStar key={i} className="text-yellow-500" />)
    } else if (score > i) {
      stars.push(<MdOutlineStarHalf key={i} className="text-yellow-500" />)
    } else {
      stars.push(<MdOutlineStarBorder key={i} className="text-yellow-500" />)
    }
  }
  return stars
}

const RequestDetailsPage: React.FC<Props> = ({ params }) => {
  const router = useRouter();
  const [durations, setDurations] = React.useState<number[]>([]);
  const { user } = useRequireLogin({
    onUnauthenticated: () => {
      router.push("/auth/signin");
    },
  });

  // const { data, isLoading } = useFirestoreDocument<ServiceRequest>(`requests/${params.id}`)
  const { data, loading } = useFirestoreDocumentRT<ServiceRequest>(`requests/${params.id}`)
  const { setRequestId } = useRequest();

  const users = useMemo(() => {
    if (data) {
      setDurations(data.services.map(service => 1))
      return data.services.reduce(
        (acc, service) => {
          let users = service.candidates.map(candidate => candidate.vendorId)
          return acc.concat(users)
        }
        , [] as string[])
    }
    return null
  }, [data])

  const { data: usersData } = useFirestoreFunction<UsersV1Type>({
    name: "get_users_info_v1",
    payload: { uids: users }
  })

  const handleChat = async (vendorId: string) => {
    setRequestId(params.id);

    if (!user) return
    const checkQ = query(
      collection(db, "chats"),
      where("agent", "==", user.uid),
      where("vendor", "==", vendorId),
      limit(1)
    )

    const chatId = await getDocs(checkQ)
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          return querySnapshot.docs[0].id
        }
        return null
      })

    if (chatId) {
      router.push(`/dashboard/chat/${chatId}`)
      return
    }

    const newChatRef = await addDoc(collection(db, "chats"), {
      agent: user.uid,
      vendor: vendorId,
    })

    router.push(`/dashboard/chat/${newChatRef.id}`)
  }

  const handleSelect = async (vendorId: string, serviceIndex: number) => {
    if (!data) return
    let docRef = doc(db, `requests/${params.id}`)
    let newServices = data.services.map((service, index) => {
      return {
        ...service,
        ...(serviceIndex === index && { selected: vendorId })
      }
    })
    await updateDoc(docRef, { services: newServices })
  }

  const handleUnselect = async (serviceIndex: number) => {
    if (!data) return
    let docRef = doc(db, `requests/${params.id}`)
    let newServices = data.services.map((service, index) => {
      return {
        ...service,
        ...(serviceIndex === index && { selected: null })
      }
    })
    await updateDoc(docRef, { services: newServices })
  }

  const handleDurationChange = (value: number, index: number) => {
    let newDurations = [...durations]
    newDurations[index] = value
    setDurations(newDurations)
  }

  const total = useMemo(() => {
    if (!data) return 0;
    let selected = data.services.map((service) => service.selected)
    // @ts-ignore
    let prices: number[] = data.services.map((service, index) => {
      return service.candidates.find(candidate => candidate.vendorId === selected[index])?.pricing
    })
    if (prices.length !== durations.length) return 0

    return dot(prices, durations) || 0
  }, [data, durations])

  if (!data && !loading) {
    return (
      <div className="grid px-6 pt-6 2xl:container grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="w-full md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle>Service Requests</CardTitle>
            <CardDescription>
              {
                "This is where you can view and manage all your and member's service requests."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <h4>
              Request not found
            </h4>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid px-6 pt-6 2xl:container grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="w-full md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle>Service Requests</CardTitle>
          <CardDescription>
            {
              "This is where you can view and manage all your and member's service requests."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {
            !loading && data
              ? <>
                <h4 className="text-xl font-semibold">
                  {data.requestName}
                </h4>
                <CardDescription className="mb-4">
                  Service for {`${format(data.datetime.toDate(), "dd/MM/yyyy, HH:mm")}`}
                </CardDescription>
                {data.services.map((service, serviceIndex) => (
                  <React.Fragment key={`${serviceIndex}`}>
                    <div className="flex flex-row items-center gap-2">
                      <h5 className="text-lg font-semibold mt-4 mb-2">
                        {
                          OFFERED_SERVICES.find((offeredService) => offeredService.id === service.serviceName)?.name
                        }
                      </h5>
                      {
                        durations?.length
                          ? (<Select
                            defaultValue="1"
                            onValueChange={(value) => {
                              handleDurationChange(parseInt(value), serviceIndex)
                            }}
                            value={durations[serviceIndex].toString()}
                          >
                            <SelectTrigger className="max-w-32 h-8">
                              <SelectValue placeholder="Duration" />
                            </SelectTrigger>
                            <SelectContent className="w-32">
                              <SelectItem value="1">1 h</SelectItem>
                              <SelectItem value="2">2 h</SelectItem>
                              <SelectItem value="3">3 h</SelectItem>
                            </SelectContent>
                          </Select>) : null
                      }
                    </div>
                    <ScrollArea>
                      <div className="flex w-max gap-4">
                        {
                          service.candidates.map((candidate, candidateIndex) => (
                            <Card key={candidateIndex} className="flex flex-col min-w-80 aspect-video shadow-none p-2 justify-between">
                              <div className="flex items-center gap-2 mb-2">
                                {
                                  usersData && usersData[candidate.vendorId]
                                    ? <img
                                      src={usersData[candidate.vendorId].photoURL}
                                      alt="vendor"
                                      className="w-20 h-20 rounded-md object-cover"
                                    />
                                    : <Skeleton className="w-20 h-20 rounded-md" />
                                }
                                <div>
                                  {
                                    usersData && usersData[candidate.vendorId]
                                      ? <h5 className="text-lg font-semibold">
                                        {usersData[candidate.vendorId].displayName}
                                      </h5>
                                      : <Skeleton className="w-40 h-4" />
                                  }
                                  <div className="flex flex-row items-center">
                                    {
                                      starsRender(4.9)
                                    }
                                    <small className="ml-4 text-gray-500">
                                      {"(300)"}
                                    </small>
                                  </div>
                                  <Badge>
                                    ${candidate.pricing}/hr
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                <div className="flex flex-row gap-1">
                                  {
                                    !candidate?.insurance && (
                                      <Badge>
                                        Insurance
                                      </Badge>
                                    )
                                  }
                                  {
                                    candidate?.experience && (
                                      <Badge variant="secondary">
                                        {candidate.experience} years exp
                                      </Badge>
                                    )
                                  }
                                </div>
                                <div className="flex flex-row gap-2">
                                  {
                                    service.selected === candidate.vendorId
                                      ? (
                                        <Button
                                          variant="default"
                                          className="flex flex-1 gap-2 items-center"
                                          onClick={() => handleUnselect(serviceIndex)}
                                        >
                                          Unselect
                                          <MdClose />
                                        </Button>
                                      )
                                      : (

                                        <>
                                          <Button
                                            variant="secondary"
                                            className="flex flex-1 gap-2 items-center"
                                            onClick={() => handleChat(candidate.vendorId)}
                                          >
                                            Message
                                            <MdMessage />
                                          </Button>
                                          <Button
                                            variant="default"
                                            className="flex flex-1 gap-2 items-center"
                                            onClick={() => handleSelect(candidate.vendorId, serviceIndex)}
                                          >
                                            Hire
                                            <MdCheck />
                                          </Button>
                                        </>
                                      )
                                  }
                                </div>
                              </div>
                            </Card>
                          ))
                        }
                      </div>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                  </React.Fragment>
                ))}
                <div className="flex flex-row justify-between mt-2 max-w-xl">
                  <span className="font-semibold text-slate-500">
                    Subtotal
                  </span>
                  <span className="text-slate-500">
                    ${total}
                  </span>
                </div>
                <div className="flex flex-row justify-between mt-2 max-w-xl">
                  <span className="font-semibold text-slate-500">
                    Tax
                  </span>
                  <span className="text-slate-500">
                    $0
                  </span>
                </div>
                <div className="flex flex-row justify-between mt-2 max-w-xl">
                  <span className="font-semibold">
                    Total
                  </span>
                  <span className="text-xl font-semibold">
                    ${total}
                  </span>
                </div>
                <Button
                  variant="default"
                  className="flex flex-1 mt-4 items-center w-full max-w-xl"
                  disabled={total === 0}
                >
                  Proceed to payment
                </Button>
              </>
              : <>
                <Skeleton className="w-80 h-6 mb-4" />
                <Skeleton className="w-80 aspect-video mb-4" />
                <Skeleton className="w-80 h-4 mb-2" />
                <Skeleton className="w-80 h-4 mb-4" />
                <div className="flex flex-row gap-4 mb-4">
                  {[1, 2, 3].map((item) => (
                    <Skeleton key={item} className="w-60 aspect-video" />
                  ))
                  }
                </div>
                <Skeleton className="w-80 h-6 mb-4" />
                <Skeleton className="w-80 aspect-video mb-4" />
                <Skeleton className="w-80 h-4 mb-2" />
                <Skeleton className="w-80 h-4 mb-4" />
              </>
          }
          {
            !data && !loading && (
              <h4>
                Request not found
              </h4>
            )
          }
        </CardContent>
      </Card >
    </div >
  );
};

export default RequestDetailsPage;
