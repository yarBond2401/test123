import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { db } from '@/app/firebase';
import { collection, addDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { useForm, FormProvider, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { TimePicker12 } from '@/components/ui/time-picker';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form';
import { add } from 'date-fns';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { toast, ToastType } from '@/components/ui/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { AutosizeTextarea } from '@/components/ui/autosize-textarea';
import useUserInfo from '@/hooks/useUserInfo';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const offerSchema = z.object({
	datetime: z.date(),
	costs: z.number().min(1, "Offered price must be greater than 0"),
	message: z.string().optional(),
});

interface SendOfferDialogProps {
	vendorId: string;
	agentId: string;
	isVendor: boolean;
	userInfo: ReturnType<typeof useUserInfo>;
}

const SendOfferDialog: React.FC<SendOfferDialogProps> = ({ vendorId, agentId, isVendor, userInfo }) => {
	const [open, setOpen] = useState<boolean>(false);
	const formMethods = useForm({
		resolver: zodResolver(offerSchema),
		defaultValues: {
			datetime: new Date(),
			costs: 0,
			message: "",
		},
	});

	const { handleSubmit, formState: { errors }, reset, control } = formMethods;
	const [loading, setLoading] = useState<boolean>(false);

	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

	const onSubmit = async (data: any) => {
		setLoading(true);
		try {
			const { datetime, costs, message } = data;
			let withoutTax, withTax, vendorCosts;

			if (isVendor) {
				vendorCosts = costs;
				withoutTax = withTax = vendorCosts / 0.9;
			} else {
				withoutTax = withTax = costs;
				vendorCosts = withTax * 0.9;
			}

			const offerData = {
				vendorId,
				agentId,
				offerDate: Timestamp.fromDate(new Date(datetime)),
				costs,
				withoutTax,
				withTax,
				vendorCosts,
				message,
				createdAt: serverTimestamp(),
				status: 'pending',
				issuer: isVendor ? 'vendor' : 'agent',
			};

			// Add vendorStripeAccountId only for vendors with a Stripe account
			if (isVendor && userInfo?.stripeAccountId) {
				offerData.vendorStripeAccountId = userInfo.stripeAccountId;
			}

			await addDoc(collection(db, 'offers'), offerData);

			handleClose();
			reset();
			toast({
				title: "Success",
				description: "Offer sent successfully",
				toastType: "success",
			});
		} catch (error) {
			console.error("Error adding document: ", error);
			toast({
				title: "Error",
				description: "Failed to send offer. Please try again.",
				toastType: "error",
			});
		} finally {
			setLoading(false);
		}
	};

	const isButtonDisabled = isVendor && !userInfo?.stripeAccountId;

	return (
		<div>
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							onClick={handleOpen}
							disabled={isButtonDisabled}
							className="bg-[#52BF56] hover:bg-green-600 text-white"
						>
							Send Offer
						</Button>
					</TooltipTrigger>
					<TooltipContent>
						{isVendor && !userInfo?.stripeAccountId && (
							<p className="text-sm text-red-500 dark:text-red-400">
								Please connect your Stripe account in Profile to send an offer
							</p>
						)}
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Send an offer</DialogTitle>
						<DialogClose />
					</DialogHeader>
					<FormProvider {...formMethods}>
						<form onSubmit={handleSubmit(onSubmit)}>
							<FormField
								control={control}
								name="costs"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Offered Price</FormLabel>
										<FormDescription>Enter the price for the offer</FormDescription>
										<FormControl>
											<Input
												type="number"
												step="1"
												{...field}
												onChange={(e) => {
													const value = e.target.value;
													field.onChange(value === '' ? '' : parseFloat(value));
												}}
											/>
										</FormControl>
										<FormMessage>{errors.costs && <span>{errors.costs.message}</span>}</FormMessage>
									</FormItem>
								)}
							/>
							<FormField
								control={control}
								name="datetime"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Date and time</FormLabel>
										<FormDescription>Choose a date and time for the offer</FormDescription>
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
														{field.value ? format(field.value, "PPPp") : <span>Pick a date</span>}
													</Button>
												</PopoverTrigger>
												<PopoverContent className="flex flex-col w-auto p-0">
													<Calendar
														mode="single"
														selected={field.value}
														onSelect={(date) => {
															if (date) {
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
															} else {
																field.onChange(date!);
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
										<FormMessage>{errors.datetime && <span>{errors.datetime.message}</span>}</FormMessage>
									</FormItem>
								)}
							/>
							<FormField
								control={control}
								name="message"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Message</FormLabel>
										<FormDescription>Enter optional message</FormDescription>
										<FormControl>
											<AutosizeTextarea
												{...field}
												placeholder="Enter a message"
											/>
										</FormControl>
										<FormMessage>{errors.costs && <span>{errors.costs.message}</span>}</FormMessage>
									</FormItem>
								)}
							/>
							<DialogFooter className="mt-2">
								<Button type="button" variant="secondary" onClick={handleClose} disabled={loading}>Close</Button>
								<Button type="submit" disabled={loading || isButtonDisabled} className="min-w-20">
									{loading ? <Spinner size="small" /> : "Send offer"}
								</Button>
							</DialogFooter>
						</form>
					</FormProvider>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default SendOfferDialog;
