"use client";

import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { z } from "zod";

import { db } from "@/app/firebase";
import { BrokerType } from "@/app/firestoreTypes";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { useFirestoreFunction } from "@/hooks/useFirestoreFunction";
import { useFirestoreQuery } from "@/hooks/useFirestoreQuery";
import { useRequireLogin } from "@/hooks/useRequireLogin";
import { PopoverClose } from "@radix-ui/react-popover";

import { columns } from "./components/columns";
import { DataTable } from "./components/data-table";
import { publicUserSchema } from "./schema";
import { TableContext } from "./components/context-table";

const Broker = () => {
  const [copy, setCopy] = useState(false);
  const [addAgentId, setAddAgentId] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const { user } = useRequireLogin({
    onUnauthenticated: () => {
      router.push("/auth/signin");
    },
  });

  const { data: brokerData, mutate } = useFirestoreQuery<BrokerType[]>(
    "brokers",
    "users",
    "array-contains",
    user?.uid
  );
  const broker: BrokerType | undefined = brokerData?.[0];

  const handleCopyClick = () => {
    navigator.clipboard.writeText(user?.uid || "");
    setCopy(true);
  };

  const { data: usersInfoData } = useFirestoreFunction({
    name: "get_users_info",
    payload: broker?.users ? { uids: broker?.users } : null,
  });

  const handleAdd = async () => {
    if (!broker?.id) return;
    if (!addAgentId) return;
    if (broker?.users.includes(addAgentId)) {
      toast({
        title: "Error",
        description: "This agent is already part of the broker",
      });
      return;
    }

    const brokerRef = doc(db, "brokers", broker?.id);
    try {
      await updateDoc(brokerRef, {
        users: arrayUnion(addAgentId),
      });
      toast({
        title: "Success",
        description: "Agent added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while adding the agent",
      });
    }
    setAddAgentId("");
    mutate();
  };

  const isAdmin = useMemo(() => {
    if (!user?.uid || !broker) return false;
    return broker?.admins.includes(user?.uid);
  }, [user, broker]);

  const users = useMemo(() => {
    const parsed = z.array(publicUserSchema).parse(
      usersInfoData
        ? (usersInfoData as any[]).map((u) => ({
            ...u,
            brokerId: broker?.id,
          }))
        : []
    );
    const withAdmin = parsed.map((user) => {
      return {
        ...user,
        admin: broker?.admins.includes(user.uid) || false,
      };
    });
    const withYou = withAdmin.map((currentUser) => {
      return {
        ...currentUser,
        you: currentUser.uid === user?.uid ? true : false,
      };
    });

    return withYou;
  }, [usersInfoData, broker, user]);

  return (
    <TableContext.Provider value={{ mutate }}>
      <div className="grid px-6 pt-6 2xl:container grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {user?.uid && !broker ? (
          <Card className="w-full md:col-span-2 lg:col-span-4">
            <CardHeader>
              <CardTitle>{"You're not part of any broker yet"}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col">
              You can join a broker by sharing your code:
              <div className="flex flex-col gap-2 md:flex-row my-2">
                <Input value={user.uid} readOnly />
                <Button
                  variant="secondary"
                  className="shrink-0"
                  onClick={handleCopyClick}
                >
                  {copy ? "Copied" : "Copy code"}
                </Button>
              </div>
            </CardContent>
            <CardFooter className="gap-2">
              Alternatively, you can create a broker
              <Link href="/dashboard/broker/create" className="underline">
                here
              </Link>
            </CardFooter>
          </Card>
        ) : (
          broker?.admins.length &&
          user?.uid && (
            <Card className="w-full md:col-span-2 lg:col-span-4">
              <CardHeader className="flex flex-col items-center sm:items-start md:flex-row md:h-32 gap-4">
                <figure>
                  <Image
                    src={broker.image}
                    alt={`Image of the broker: ${broker.name}`}
                    width={500}
                    height={500}
                    className="shadow-md w-24 h-24 border rounded-md object-cover"
                  />
                </figure>
                <div className="flex flex-col">
                  <div>
                    <CardTitle>{broker.name}</CardTitle>
                    <CardDescription>
                      {isAdmin
                        ? "You're an admin of this broker"
                        : "You're an agent of this broker"}
                    </CardDescription>
                  </div>
                  {isAdmin && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="secondary"
                          className="w-full md:w-min"
                          onClick={() => {}}
                        >
                          Add agent
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[320px]">
                        <div className="flex flex-col space-y-2 text-center sm:text-left">
                          <h3 className="text-lg font-semibold">
                            Add an agent
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            You can add an agent to your broker by entering his
                            ID
                          </p>
                        </div>
                        <div className="flex flex-col sitems-center pt-4 gap-2">
                          <div className="grid flex-1 gap-2">
                            <Label htmlFor="id" className="sr-only">
                              Agent ID
                            </Label>
                            <Input
                              id="id"
                              className="h-9"
                              value={addAgentId}
                              placeholder="B3jM26v1oX23xGiFuMJ25MAvs1oX"
                              onChange={(e) => setAddAgentId(e.target.value)}
                            />
                          </div>
                          <PopoverClose>
                            <Button
                              className="w-full ms-0"
                              onClick={handleAdd}
                              disabled={!addAgentId}
                              type="submit"
                            >
                              <span className="sr-only">Copy</span>
                              Add
                            </Button>
                          </PopoverClose>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <DataTable columns={columns} rows={users} isAdmin={isAdmin} />
              </CardContent>
            </Card>
          )
        )}
      </div>
    </TableContext.Provider>
  );
};

export default Broker;
