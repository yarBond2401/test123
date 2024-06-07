// @ts-nocheck
import { db } from "@/app/firebase";
import { doc, updateDoc, DocumentData } from "firebase/firestore";
import { toast } from "@/components/ui/use-toast";

import Image from "next/image";
import * as Select from "@radix-ui/react-select";
import { FC, useState } from "react";
import { Separator } from "../ui/separator";
import DropdownIcon from "@/icons/icon=chevron-down-grey.svg";
import defaultAvatar from "@/images/default-user-picture.jpg";
import { add, format } from "date-fns";
import { ServiceSignInRequestWithApprovedDateSchema, singInRequestsWithApprovedDateSchema } from "@/app/dashboard/requests/schema";
import type { User } from "firebase/auth";

import { TimePicker12 } from '@/components/ui/time-picker';
import { Calendar as CalendarIcon } from 'lucide-react';
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
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  user: User | null;
  request: ServiceSignInRequestWithApprovedDateSchema;
}

type DealStatus = "Approved" | "Pending Install" | "Installed" | "Pending Removal" | "Removed";

export const RequestItem: FC<Props> = ({ request, user }) => {
  const dealStatus: DealStatus[] = ["Approved", "Pending Install", "Installed", "Pending Removal", "Removed"];
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(request.status);
  const [previousStatus, setPreviousStatus] = useState(request.status);
  const [selectedApprovedDate, setSelectedApprovedDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const router = useRouter();

  const [title, setTitle] = useState("");

  const form = useForm({
    resolver: zodResolver(singInRequestsWithApprovedDateSchema.pick({ approvedDate: true, status: true, requestedDate: true })),
    defaultValues: {
      approvedDate: request?.approvedDate && 'seconds' in request.approvedDate ? new Date(request.approvedDate.seconds * 1000) : request?.approvedDate || new Date(),
      status: request?.status || "Pending Install",
      requestedDate: request?.requestedDate && 'seconds' in request.requestedDate ? new Date(request.requestedDate.seconds * 1000) : request?.requestedDate || new Date(),
    },
  });

  const { setValue, getValues, handleSubmit: handleFormSubmit, control } = form;

  const handleStatusChange = (value: DealStatus) => {
    if (value !== selectedStatus) {
      setPreviousStatus(selectedStatus);
      setSelectedStatus(value);
      if (value === "Approved" || value === "Installed" || value === "Removed") {
        setIsDialogOpen(true);
        setTitle(value);
      } else {
        setValue('status', value);
        submitData(value);
      }
    }
  };

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

    if (formData) {
      if (status === "Approved") {
        updateData["approvedDate"] = formData.requestedDate;
      } else if (status === "Installed") {
        updateData["installedDate"] = formData.requestedDate;
      } else if (status === "Removed") {
        updateData["removedDate"] = formData.requestedDate;
      }
    }

    console.log("Update data", updateData, status);
    await updateDoc(docRef, updateData);

    toast({
      title: "Success",
      type: "success",
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
    submitData(title, formData);
  };

  function getDate(request: ServiceSignInRequestWithApprovedDateSchema) {
    const date = request?.createdAt;
    if (date && 'seconds' in date)
      return format(new Date(date.seconds * 1000), "dd/MM/yyyy");

    return date ? format(date, "dd/MM/yyyy") : '';
  }


  return (
    <>
      <div className="flex flex-col w-full">
        <Separator />
        <div className="flex flex-row w-full py-3 items-center px-4 justify-between cursor-pointer transition-colors hover:bg-muted/50" onClick={() => {
          router.push(`/dashboard/sign-installation/${request.id}`);
        }}>
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
            <p className="xl:text-base text-sm leading-5 text-dashboard-main font-medium w-[150px] flex flex-row justify-center">
              {getDate(request)}
            </p>
          </div>
          <div className="flex xl:w-52 w-44 pl-4 justify-center">
            <p className="xl:text-base text-sm leading-5 text-dashboard-main font-medium">
              {request.description.length > 40 ? `${request.description.slice(0, 40)}...` : request.description}
            </p>
          </div>
          <div className="flex xl:w-56 pl-3 w-44 justify-center">
            <Select.Root value={selectedStatus} onValueChange={handleStatusChange} disabled={isLoading}>
              <Select.Trigger
                className={cn(
                  "flex flex-row w-40 gap-[10px] xl:px-3 px-2 py-2 border justify-between border-[#DFE4EA] rounded-md outline-none items-center xl:text-base text-sm text-dashboard-secondary hover:border-[#3758F9]",
                  {
                    "opacity-50 cursor-not-allowed": isLoading
                  }
                )}
              >
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
                        className="xl:px-3 px-1 md:py-2 py-1 outline-none rounded-md hover:bg-[#3758F9] hover:text-white cursor-pointer duration-150"
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
        </div>
      </div >
      <Dialog open={isDialogOpen} onOpenChange={() => closeDialog()}>
        <DialogContent className="flex flex-col p-4 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex flex-row justify-between items-center">
              {title === "Approved" && "Approve Installation Request"}
              {title === "Installed" && "Mark as Installed Request"}
              {title === "Removed" && "Mark as Removed Request"}
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
                      {title === "Approved" && "Choose a default date and time for the request"}
                      {title === "Installed" && "Choose date and time of installation"}
                      {title === "Removed" && "Choose date and time of removal"}
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
              <DialogFooter className="flex flex-row gap-2 pt-2">
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
                  {isLoading && <Loader2 className="w-6 h-6 mr-2 animate-spin" />}
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
