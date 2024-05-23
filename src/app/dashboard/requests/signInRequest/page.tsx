"use client";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import React, { forwardRef, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import PhoneInput from "react-phone-number-input";
import 'react-phone-number-input/style.css';

import { db } from "@/app/firebase";
import { BrokerType } from "@/app/firestoreTypes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { useFirestoreQuery } from "@/hooks/useFirestoreQuery";
import { useRequireLogin } from "@/hooks/useRequireLogin";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  ServiceSignInRequestCreate,
  signInRequestCreateSchema,
} from "../schema";
import { Textarea } from "@/components/ui/textarea";
import useUserInfo from "@/hooks/useUserInfo";

const Requests = () => {
  const router = useRouter();
  const { user } = useRequireLogin({
    onUnauthenticated: () => {
      router.push("/auth/signin");
    },
  });

  const {mockUser, userInfo, loading, error, updateUserInfo} = useUserInfo(user);
  const { data: brokerData } = useFirestoreQuery<BrokerType[]>(
    "brokers",
    "users",
    "array-contains",
    user?.uid
  );

  const broker: BrokerType | undefined = brokerData?.[0];

  const form = useForm<ServiceSignInRequestCreate>({
    resolver: zodResolver(signInRequestCreateSchema),
    defaultValues: {
      firstName: "",
      phoneNumber: "",
      description: "",
      userInfo: {
          email: user?.email || '',
          photoURL: user?.photoURL || '',
          uid: user?.uid || '',
          displayName: user?.displayName || '',
      },
      signInApprover: null,
      userId: user?.uid ?? "",
      requestName: "",
      status: "Pending Install",
      photoUrl: user?.photoURL ?? "",
    },
  });

  useEffect(() => {
    if (user) {
      form.setValue("userId", user.uid);
      form.setValue("userInfo", {
            email: user?.email || '',
            photoURL: user?.photoURL || '',
            uid: user?.uid || '',
            displayName: user?.displayName || ''
        });
    }
  }, [user]);

  const onSubmit = async (data: ServiceSignInRequestCreate) => {
    console.log(data);
    const requestData = {
      ...data,
      createdAt: serverTimestamp(),
    };

    console.log("Sign in Requests data", requestData);

    const colRef = collection(db, "signInRequests");
    await addDoc(colRef, requestData);
    await updateUserInfo({availablePosts: `${Number(mockUser?.postsAvailable) - 1}`, postInstalled: `${Number(mockUser?.postsInstalled) + 1}`})
    router.push("/dashboard/requests");
  };

  const availablePosts = mockUser?.postsAvailable ? Number(mockUser?.postsAvailable) : 0;

  return (
    <div className="grid px-6 pt-6 2xl:container grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="w-full md:col-span-2 lg:col-span-4 p-4 flex flex-col gap-4">
          <div className="mb-2 flex justify-between items-center max-w-xl">
              <div>
                  <h3 className="text-lg font-medium">Create a broker</h3>
                  <p className="text-sm text-muted-foreground">
                      Fill the form below to create a broker
                  </p>
                  <p className="text-sm text-muted-foreground pt-2">
                      {`Available Requests: ${availablePosts}`}
                  </p>
              </div>
              <Button
                  onClick={() => router.push("/dashboard/requests")}
                  type="button"
              >
                  Go back
              </Button>
          </div>
          <Separator/>
          <Form {...form}>
              <form className="max-w-xl">
                  <FormField
                      control={form.control}
              name="requestName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your request Name</FormLabel>
                  <FormDescription>
                    Please put your request name
                  </FormDescription>
                  <FormControl>
                    <Input placeholder="Request name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem className="mt-2">
                  <FormLabel>Your name</FormLabel>
                  <FormDescription>Please put your first name</FormDescription>
                  <FormControl>
                    <Input placeholder="First name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem className="mt-2">
                  <FormLabel>Phone number</FormLabel>
                  <FormDescription>
                    Please put your phone number
                  </FormDescription>
                  <FormControl>
                    <PhoneInput
                      className="flex h-10 w-full important:outline-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground "
                      placeholder="Enter phone number"
                      {...field}
                    />
                    
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex flex-col mt-2">
                  <FormLabel>Notes</FormLabel>
                  <FormDescription>Please put your Notes</FormDescription>
                  <FormControl>
                    <Textarea
                      {...field}
                      maxLength={500}
                      // @ts-ignore
                      style={{ fieldSizing: "content" }}
                      placeholder="Please put your Notes"
                    />
                  </FormControl>
                  <FormDescription className="self-end text-sm text-gray-500 mt-1">
                    {form.watch("description")?.length || 0} / 500
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full mt-4"
              onClick={form.handleSubmit(onSubmit)}
              disabled={form.formState.isSubmitting || availablePosts < 1}
            >
              Create request
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default Requests;
