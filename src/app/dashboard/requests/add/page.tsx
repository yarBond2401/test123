"use client";

import { format } from 'date-fns';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Calendar as CalendarIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { db } from '@/app/firebase';
import { BrokerType } from '@/app/firestoreTypes';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { useFirestoreQuery } from '@/hooks/useFirestoreQuery';
import { useRequireLogin } from '@/hooks/useRequireLogin';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';

import { ServiceRequestCreate, serviceRequestCreateSchema } from '../schema';
import { ServicePicker } from './components/service-picker';
import { TimePicker12 } from '@/components/ui/time-picker';
import { add } from 'date-fns';


const DynamicGeoPicker = dynamic(() => import("./components/geo-picker").then(module => module.GeoPicker), {
  ssr: false,
});


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

  const form = useForm<ServiceRequestCreate>({
    resolver: zodResolver(serviceRequestCreateSchema),
    defaultValues: {
      datetime: new Date(),
      userId: user?.uid ?? "",
      brokerId: broker?.id ?? "",
      requestName: "",
      status: "issued",
      services: [],
    }
  })

  useEffect(() => {
    if (user) {
      form.setValue("userId", user.uid);
    }
    if (broker) {
      form.setValue("brokerId", broker.id);
    }
  }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    , [broker, user]);

  const onSubmit = async (data: ServiceRequestCreate) => {
    const requestData = {
      ...data,
      createdAt: serverTimestamp(),
    };

    console.log("Request data", requestData)

    const colRef = collection(db, "requests");
    await addDoc(colRef, requestData);
    router.push("/dashboard/requests");
  }

  return (
    <div className="grid px-6 pt-6 2xl:container grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="w-full md:col-span-2 lg:col-span-4 p-4 flex flex-col gap-4">
        <div className="mb-2 flex justify-between items-center max-w-xl">
          <div>
            <h3 className="text-lg font-medium">Create a broker</h3>
            <p className="text-sm text-muted-foreground">
              Fill the form below to create a broker
            </p>
          </div>
          <Button
            onClick={() => router.push("/dashboard/requests")}
            type="button"
          >
            Go back
          </Button>
        </div>
        <Separator />
        <Form {...form}>
          <form className="max-w-xl">
            <FormField
              control={form.control}
              name="requestName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Request name</FormLabel>
                  <FormDescription>
                    Choose a descriptive name you can remember
                  </FormDescription>
                  <FormControl>
                    <Input
                      placeholder="Request name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="datetime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Date and time
                  </FormLabel>
                  <FormDescription>
                    Choose a default date and time for the request
                  </FormDescription>
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {/* Date with time format */}
                          {
                            field.value
                              ? format(field.value, "PPPp")
                              : <span>Pick a date</span>
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="flex flex-col w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          //select date without changed time using date-fns
                          onSelect={
                            (date) => {
                              if (!date) {
                                field.onChange(date!)
                              } else {
                                const newDate = new Date(
                                  date.getFullYear(),
                                  date.getMonth(),
                                  date.getDate(),
                                  field.value.getHours(),
                                  field.value.getMinutes(),
                                  field.value.getSeconds(),
                                  field.value.getMilliseconds()
                                );
                                field.onChange(newDate);
                              }
                            }
                          }
                          disabled={(date) => date < add(new Date(), { days: - 1 })}
                          initialFocus
                        />
                        <TimePicker12
                          className="self-center mb-2"
                          value={field.value}
                          onChange={(date) => field.onChange(date)}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DynamicGeoPicker form={form} />
            <ServicePicker form={form} />
            <Button
              type="submit"
              className="w-full mt-4"
              onClick={form.handleSubmit(onSubmit)}
              disabled={form.formState.isSubmitting}
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
