// @ts-nocheck
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { addDoc, collection, doc, getDoc, getDocs, limit, query, updateDoc, where } from 'firebase/firestore';
import { db } from "@/app/firebase";
import { useEffect, useState } from 'react';
import { format, add } from 'date-fns';
import { useRequireLogin } from "@/hooks/useRequireLogin";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, CopyIcon, MessageCircleIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import * as Select from "@radix-ui/react-select";
import { cn } from "@/lib/utils";
import DropdownIcon from "@/icons/icon=chevron-down-grey.svg";
import Image from "next/image";
import { MapContainer, ScaleControl, TileLayer, Marker } from "react-leaflet";
import { customIcon } from "@/lib/customIcon";
import { LatLng } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Textarea } from "@/components/ui/textarea";

import { Dialog, DialogContent, DialogClose, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { TimePicker12 } from '@/components/ui/time-picker';
import { singInRequestsWithApprovedDateSchema } from "@/app/dashboard/requests/schema";
import { toast } from "@/components/ui/use-toast";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";

type DealStatus = "Approved" | "Pending Install" | "Installed" | "Pending Removal" | "Removed";

interface Props {
	params: {
		id: string;
	};
}

const SignInRequestsSkeleton = () => (
	<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
		<div className="flex flex-col gap-4 w-full">
			<div className="grid grid-cols-2 gap-6">
				<div className="flex items-center gap-4 mb-4">
					<Skeleton className="h-16 w-16 rounded-full border" />
					<div className="grid">
						<Skeleton className="w-40 h-6 mb-2" />
						<Skeleton className="w-40 h-4 mb-1" />
						<Skeleton className="w-40 h-4 mb-1" />
					</div>
				</div>
				<div className="flex items-center gap-2 justify-end">
					<Skeleton className="h-8 w-40" />
				</div>
			</div>
			<Separator />
			<div className="flex flex-row gap-10">
				<div className="space-y-2">
					<Skeleton className="w-40 h-6 mb-2" />
				</div>
				<div className="space-y-2">
					<Skeleton className="w-40 h-6 mb-2" />
				</div>
			</div>
			<div className="space-y-2">
				<Skeleton className="w-full h-10 mb-2" />
			</div>
			<div className="space-y-2">
				<Skeleton className="w-full h-24 mb-2" />
			</div>
		</div>
		<div className="w-full">
			<div className="flex flex-col gap-2">
				<Skeleton className="w-full h-64 mb-2" />
				<div className="flex flex-row gap-4">
					<div className="flex flex-row gap-10">
						<div className="space-y-2">
							<Skeleton className="w-20 h-6 mb-2" />
						</div>
						<div className="space-y-2">
							<Skeleton className="w-20 h-6 mb-2" />
						</div>
					</div>
					<Skeleton className="h-6 w-6 ml-2" />
				</div>
			</div>
		</div>
	</div>
);

const SignInRequestsPage = ({ params }: Props) => {
	const router = useRouter();
	const { id } = params;
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const [selectedStatus, setSelectedStatus] = useState("");
	const [previousStatus, setPreviousStatus] = useState("");
	const dealStatus: DealStatus[] = ["Approved", "Pending Install", "Installed", "Pending Removal", "Removed"];

	const [position, setPosition] = useState<LatLng | null>(null);
	const [map, setMap] = useState(null);

	const [selectedApprovedDate, setSelectedApprovedDate] = useState(new Date());
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [title, setTitle] = useState("");

	const [showMap, setShowMap] = useState(false);

	const { user } = useRequireLogin({
		onUnauthenticated: () => {
			router.push("/auth/signin");
		},
	});

	const generateInitials = (name: string): string => {
		const [firstName, lastName] = name.split(' ');
		return `${firstName.charAt(0)}${lastName ? lastName.charAt(0) : ''}`;
	};

	const submitData = async (status: string, formData?: any) => {
		setLoading(true);
		let docRef = doc(db, "signInRequests", data.id);
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
			toastType: "success",
			description: `Request status updated to ${status}.`,
		});
		setLoading(false);
		setIsDialogOpen(false);
	};

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

	const closeDialog = () => {
		setIsDialogOpen(false);
		setSelectedStatus(previousStatus);
	};

	const confirmApprovalAndSubmit = (formData: any) => {
		submitData(title, formData);
	};

	function getDate(date: any) {
		if (date && 'seconds' in date)
			return format(new Date(date.seconds * 1000), "dd/MM/yyyy");

		return date ? format(date, "dd/MM/yyyy") : '';
	}

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const docRef = doc(db, "signInRequests", id);
				const docSnap = await getDoc(docRef);

				if (docSnap.exists()) {
					setData({ id: docSnap.id, ...docSnap.data() });
				} else {
					setError("No such document!");
				}
			} catch (err) {
				setError("Failed to fetch the data");
			}
			setLoading(false);
		};

		if (id) {
			fetchData();
		}
	}, [id]);

	useEffect(() => {
		if (data) {
			setSelectedStatus(data?.status);
			setPreviousStatus(data?.status);

			if (data?.location && data?.location?.latitude && data?.location?.longitude) {
				setPosition(new LatLng(data.location.latitude, data.location.longitude));
				setShowMap(true);
			}
		}
	}, [data]);

	useEffect(() => {
		if (position && showMap) {
			setMap(
				<MapContainer
					center={position}
					zoom={13}
					scrollWheelZoom={false}
					className="w-full h-64 z-0 rounded-md"
					dragging={false}
				>
					<ScaleControl position="bottomleft" />
					<TileLayer
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					/>
					<Marker position={position} icon={customIcon} />
				</MapContainer>
			);
		}
	}, [position]);

	const form = useForm({
		resolver: zodResolver(singInRequestsWithApprovedDateSchema.pick({ approvedDate: true, status: true, requestedDate: true })),
		defaultValues: {
			approvedDate: data?.approvedDate && 'seconds' in data.approvedDate ? new Date(data.approvedDate.seconds * 1000) : data?.approvedDate || new Date(),
			status: data?.status || "Pending Install",
			requestedDate: data?.requestedDate && 'seconds' in data.requestedDate ? new Date(data.requestedDate.seconds * 1000) : data?.requestedDate || new Date(),
		},
	});

	const { setValue, getValues, handleSubmit: handleFormSubmit, control } = form;

	const copyToClipboard = (latitude, longitude) => {
		const text = `${latitude}, ${longitude}`;
		navigator.clipboard.writeText(text)
			.then(() => {
				toast({
					title: "Copied",
					toastType: "success",
					description: "Location copied to clipboard.",
				});
			})
			.catch((err) => {
				toast({
					title: "Error",
					toastType: "error",
					description: "Failed to copy location.",
				});
				console.error('Failed to copy text: ', err);
			});
	};

	console.log("Data", data, "User", user);

	const handleChat = async () => {
		if (!user) return
		const checkQ = query(
			collection(db, "chats"),
			where("vendor", "==", user.uid),
			where("agent", "==", data.userId),
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
			vendor: user.uid,
			agent: data.userId,
		})

		router.push(`/dashboard/chat/${newChatRef.id}`)
	}

	return (
		<>
			<div className="grid px-6 pt-6 2xl:container grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card className="w-full md:col-span-2 lg:col-span-4">
					<CardHeader className="flex flex-row items-start bg-muted/50">
						<CardTitle className="group flex items-center justify-between w-full gap-2 text-xl">
							<div className="flex flex-col w-full">
								{`Sign Installation Request`}
								<CardDescription>
									{
										"This is where you can view and manage all your and member's service requests."
									}
								</CardDescription>
							</div>
							<Button className="h-8 w-fit" onClick={() => router.back()}>
								<ArrowLeftIcon className="w-6 h-6 mr-2" />
								Back
							</Button>
						</CardTitle>
					</CardHeader>
					<CardContent className="p-6 text-base">
						{
							!loading && data
								? <>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="flex flex-col gap-4 w-full">
											<div className="grid grid-cols-2 gap-6">
												<div className="flex items-center gap-4 mb-4">
													<Avatar className="h-16 w-16 border">
														{/* eslint-disable-next-line @next/next/no-img-element */}
														<img src={data?.userInfo?.photoURL} alt="avatar" />
														<AvatarFallback>{generateInitials(data?.firstName)}</AvatarFallback>
													</Avatar>
													<div className="grid">
														<div className="font-semibold text-lg">
															{data?.firstName || "No data"}
														</div>
														<div className="text-muted-foreground">
															{data?.userInfo?.email ? <a href={`mailto:${data.userInfo.email}`}>{data.userInfo.email}</a> : "No data"}
														</div>
														<div className="text-muted-foreground">
															{data?.phoneNumber || "No data"}
														</div>
													</div>
												</div>
												<div className="flex items-center gap-2 justify-end">
													<Button variant="outline" className="h-10 gap-1" onClick={() => handleChat()}>
														<MessageCircleIcon className="h-3.5 w-3.5" />
														Message
													</Button>
												</div>
											</div>
											<Separator />
											<div className="flex flex-row gap-10">
												<div className="space-y-2">
													<Label htmlFor="requested-date">Created Date</Label>
													<div className="text-muted-foreground">
														{getDate(data?.createdAt) || "No data"}
													</div>
												</div>
												<div className="space-y-2">
													<Label htmlFor="requested-date">Requested Date</Label>
													<div className="text-muted-foreground">
														{getDate(data?.requestedDate) || "No data"}
													</div>
												</div>
											</div>
											<div className="space-y-2">
												<Label htmlFor="status">Status</Label>
												<Select.Root id="status" value={selectedStatus} onValueChange={handleStatusChange} disabled={loading}>
													<Select.Trigger
														className={cn(
															"flex flex-row w-full gap-[10px] xl:px-3 px-2 py-2 border justify-between border-[#DFE4EA] rounded-md outline-none items-center xl:text-base text-sm text-dashboard-secondary hover:border-[#3758F9]",
															{
																"opacity-50 cursor-not-allowed": loading
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
											<div className="space-y-2">
												<Label htmlFor="requestName">Request Notes</Label>
												<AutosizeTextarea className="w-full cursor-default" value={data?.description} disabled={true} />
											</div>
										</div>
										<div className="w-full">
											<div className="flex flex-col gap-2">
												{showMap ? map : <Skeleton className="w-full h-64 mb-2" />}
												<div className="flex flex-row gap-4">
													<div className="flex flex-row gap-10">
														<div className="space-y-2">
															<Label>Longtitude</Label>
															<div className="text-muted-foreground text-sm">
																{showMap ? (data?.location?.longitude || "No data") : <Skeleton className="w-24 h-6" />}
															</div>
														</div>
														<div className="space-y-2">
															<Label>Latitude</Label>
															<div className="text-muted-foreground text-sm">
																{showMap ? (data?.location?.latitude || "No data") : <Skeleton className="w-24 h-6" />}
															</div>
														</div>
													</div>
													<Label htmlFor="map">
														Location of request
														<Button
															size="icon"
															variant="outline"
															className="h-6 w-6 ml-2 opacity-80 transition-opacity group-hover:opacity-100"
															onClick={() => showMap && copyToClipboard(data?.location?.latitude, data?.location?.longitude)}
														>
															<CopyIcon className="h-3 w-3" />
															<span className="sr-only">Copy location</span>
														</Button>
													</Label>
												</div>
											</div>
										</div>
									</div>
								</>
								: <>
									<SignInRequestsSkeleton />
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
									disabled={loading}
								>
									{loading && <Loader2 className="w-6 h-6 mr-2 animate-spin" />}
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

export default SignInRequestsPage;