import { db } from "@/app/firebase";
import { doc, updateDoc, DocumentData } from "firebase/firestore";
import { toast } from "@/components/ui/use-toast";

import Image from "next/image";
import * as Select from "@radix-ui/react-select";
import { FC, useEffect, useState } from "react";
import { Separator } from "../ui/separator";
import DropdownIcon from "@/icons/icon=chevron-down-grey.svg";
import { NewButton } from "../ui/new-button";
import defaultAvatar from "@/images/default-user-picture.jpg";
import { add, format } from "date-fns";
import { ServiceSignInRequestWithApprovedDateSchema, singInRequestsWithApprovedDateSchema } from "@/app/dashboard/requests/schema";
import type { User } from "firebase/auth";

import { TimePicker12 } from '@/components/ui/time-picker';
import { Calendar as CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogClose, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface Props {
  user: User | null;
  request: ServiceSignInRequestWithApprovedDateSchema;
}

export const RequestItem: FC<Props> = ({ request, user }) => {
  const dealStatus = ["Approved", "Pending Install", "Installed", "Pending Removal", "Removed"];
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(request.status);
  const [previousStatus, setPreviousStatus] = useState(request.status);
  const [selectedApprovedDate, setSelectedApprovedDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(singInRequestsWithApprovedDateSchema.pick({ approvedDate: true })),
    defaultValues: {
      approvedDate: request?.approvedDate || new Date(),
    },
  });

  const { setValue, getValues, handleSubmit: handleFormSubmit, control } = form;

  const handleStatusChange = (value: string) => {
    if (value !== selectedStatus) {
      setPreviousStatus(selectedStatus);
      setSelectedStatus(value);
      if (value === "Approved") {
        setIsDialogOpen(true);
      } else {
        setValue('status', value);
        submitData(value);
      }
    }
  };

  useEffect(() => {
    console.log("Form", form.formState.errors);
  }, [form.formState.errors]);

  const submitData = async (status: string, formData?: any) => {
    setIsLoading(true);
    let docRef = doc(db, "signInRequests", request.id);
    let updateData: DocumentData = {
      status: status,
      signInApprover: {
        email: user?.email || '',
        photoURL: user?.photoURL || '',
        uid: user?.uid || '',
        displayName: user?.displayName || '',
      }
    };

    if (status === "Approved" && formData) {
      updateData["approvedDate"] = formData.approvedDate;
    }

    console.log("Update data", updateData, status);
    await updateDoc(docRef, updateData);

    toast({
      title: "Success",
      description: `Request status updated to ${status}.`,
    });
    setIsLoading(false);
    setIsDialogOpen(false);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedStatus(previousStatus);
  };

  const confirmApprovalAndSubmit = (formData: any) => {
    submitData("Approved", formData);
  };

  function getDate(request: ServiceSignInRequestWithApprovedDateSchema) {
    const date = request?.approvedDate ? request?.approvedDate : request?.requestedDate;
    return date ? format(date.toDate(), "dd/MM/yyyy") : '';
  }

  return (
    <>
      <div className="flex flex-col w-full">
        <Separator />
        <div className="flex flex-row w-full py-3 items-center px-4 justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex flex-row w-32 gap-3 items-center box-border">
              <Image
                width={32}
                height={32}
                src={request.userInfo?.photoURL || defaultAvatar}
                alt={'photo'}
                className="h-10 w-10 rounded-full"
              />
              <p className="text-sm text-dashboard-main font-medium">
                {request.firstName}
              </p>
            </div>
          </div>
          <div className="md:flex md:w-52 justify-center hidden">
            <p className="xl:text-base text-sm leading-5 text-dashboard-main font-medium">
              {request.phoneNumber}
            </p>
          </div>
          <div className="md:flex w-32 justify-center hidden">
            <p className="xl:text-base text-sm leading-5 text-dashboard-main font-medium">
              {getDate(request)}
            </p>
          </div>
          <div className="flex w-52 pl-4 justify-center">
            <p className="xl:text-base text-sm leading-5 text-dashboard-main font-medium">
              {request.description}
            </p>
          </div>
          <div className="flex xl:w-56 pl-3 w-40 justify-center">
            <Select.Root value={selectedStatus} onValueChange={handleStatusChange}>
              <Select.Trigger className="flex flex-row w-40 gap-[10px] xl:px-3 px-2 py-2 border justify-between border-[#DFE4EA] rounded-md outline-none items-center xl:text-base text-sm text-dashboard-secondary hover:border-[#3758F9]">
                <Select.Value />
                <Select.Icon>
                  <Image src={DropdownIcon} alt="icon" height={18} width={18} />
                </Select.Icon>
              </Select.Trigger>

              <Select.Portal>
                <Select.Content className="bg-white border border-[#DFE4EA] rounded-md outline-none">
                  <Select.Viewport className="xl:text-base text-sm text-dashboard-secondary">
                    {dealStatus.map((status, index) => (
                      <Select.Item
                        key={index}
                        value={status}
                        className="xl:px-3 px-1 md:py-2 py-1 outline-none rounded-md hover:bg-[#3758F9] hover:text-white cursor-pointer duration-400"
                      >
                        <Select.ItemText>{status}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                  <Select.Arrow />
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </div>
          <div className="flex md:w-32 pl-3 justify-center">
            <button disabled={isLoading}
              className="md:px-6 px-3 md:py-[10px] py-2 bg-[#5352BF] hover:bg-[#1B44C8] md:text-base text-sm md:font-medium font-normal text-white rounded-md"
              type="submit"
              onClick={() => submitData(selectedStatus)}
              style={{
                visibility: selectedStatus === "Approved" ? "hidden" : "visible",
              }}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={() => closeDialog()}>
        <DialogContent className="flex flex-col p-4 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex flex-row justify-between items-center">
              Approve Installation Request
            </DialogTitle>
            <DialogClose className="cursor-pointer" />
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={handleFormSubmit(confirmApprovalAndSubmit)} className="max-w-xl">
              <FormField
                control={form.control}
                name="requestedDate"
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
                            onSelect={
                              (date) => {
                                if (!date) {
                                  field.onChange(date!)
                                } else {
                                  const newDate = field.value ? new Date(
                                    date.getFullYear(),
                                    date.getMonth(),
                                    date.getDate(),
                                    field.value.getHours(),
                                    field.value.getMinutes(),
                                    field.value.getSeconds(),
                                    field.value.getMilliseconds()
                                  ) : date;
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
              <DialogFooter>
                <Button
                  variant="secondary"
                  onClick={closeDialog}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  type="submit"
                  disabled={isLoading}
                >
                  Submit
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};
