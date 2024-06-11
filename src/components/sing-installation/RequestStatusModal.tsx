import { FC, useState } from "react";
import { Dialog, DialogContent, DialogClose, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { add, format } from "date-fns";
import { TimePicker12 } from '@/components/ui/time-picker';
import { singInRequestsWithApprovedDateSchema } from "@/app/dashboard/requests/schema";

interface DialogFormProps {
	title: string;
	isLoading: boolean;
	closeDialog: () => void;
	confirmApprovalAndSubmit: (formData: any) => void;
	defaultValues: {
		approvedDate: Date;
		status: string;
		requestedDate: Date;
	};
}

const RequestStatusModal: FC<DialogFormProps> = ({ title, isLoading, closeDialog, confirmApprovalAndSubmit, defaultValues }) => {
	const form = useForm({
		resolver: zodResolver(singInRequestsWithApprovedDateSchema.pick({ approvedDate: true, status: true, requestedDate: true })),
		defaultValues,
	});

	const { handleSubmit: handleFormSubmit, control } = form;

	return (
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
								<FormLabel>Date and time</FormLabel>
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
												className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
											>
												<CalendarIcon className="mr-2 h-4 w-4" />
												{field.value ? format(field.value, "PPPp") : <span>Pick a date</span>}
											</Button>
										</PopoverTrigger>
										<PopoverContent className="flex flex-col w-auto p-0">
											<Calendar
												mode="single"
												selected={field.value}
												onSelect={(date) => {
													if (!date) {
														field.onChange(date!);
													} else {
														const newDate = field.value
															? new Date(
																date.getFullYear(),
																date.getMonth(),
																date.getDate(),
																field.value.getHours(),
																field.value.getMinutes(),
																field.value.getSeconds(),
																field.value.getMilliseconds()
															)
															: date;
														field.onChange(newDate);
													}
												}}
												disabled={(date) => date < add(new Date(), { days: -1 })}
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
						<Button variant="secondary" onClick={closeDialog}>Cancel</Button>
						<Button variant="default" type="submit" disabled={isLoading}>
							{isLoading && <Loader2 className="w-6 h-6 mr-2 animate-spin" />}
							Submit
						</Button>
					</DialogFooter>
				</form>
			</Form>
		</DialogContent>
	);
};

export default RequestStatusModal;
