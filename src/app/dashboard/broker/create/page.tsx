"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useFirestoreQuery } from "@/hooks/useFirestoreQuery";
import { useRequireLogin } from "@/hooks/useRequireLogin";
import { BrokerType } from "@/app/firestoreTypes";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createBrokerSchema } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { addDoc, collection } from "firebase/firestore";
import ImageInput from "@/components/ImageInput";
import { db } from "@/app/firebase";

const CreateBroker = () => {
  const router = useRouter();

  const { user, loading } = useRequireLogin({
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

  useEffect(() => {
    if (brokerData?.length) {
      router.push("/dashboard/broker");
    }
  }, [brokerData, router]);

  const form = useForm<z.infer<typeof createBrokerSchema>>({
    resolver: zodResolver(createBrokerSchema),
    defaultValues: {
      users: [],
      admins: [],
      name: "",
      image: "",
    },
    mode: "all",
  });

  const onSubmit = async (data: z.infer<typeof createBrokerSchema>) => {
    if (!user?.uid) return;
    const collectionRef = collection(db, "brokers");
    await addDoc(collectionRef, {
      ...data,
      users: [user.uid],
      admins: [user?.uid],
    });
    router.push("/dashboard/broker");
  };

  return (
    <div className="grid px-6 pt-6 2xl:container grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {user?.uid && (
        <Card className="w-full md:col-span-2 lg:col-span-4 p-4 flex flex-col gap-4">
          <div className="mb-2 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Create a broker</h3>
              <p className="text-sm text-muted-foreground">
                Fill the form below to create a broker
              </p>
            </div>
            <Button
              onClick={() => router.back()}
              type="button"
            >
              Go back
            </Button>
          </div>
          <Separator />
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-lg">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Awesome Broker" {...field} />
                    </FormControl>
                    <FormDescription>Public broker name</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/image.png"
                        type="text"
                        {...field}
                        className="hidden"
                      />
                    </FormControl>
                    <ImageInput
                      storagePath="brokers/"
                      value={field.value}
                      onChange={(url) => field.onChange(url)}
                    />
                    <FormDescription>Public broker image</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={!form.formState.isValid}
                className="mt-4 w-full"
              >
                Create broker
              </Button>
            </form>
          </Form>
        </Card>
      )}
    </div>
  );
};

export default CreateBroker;
