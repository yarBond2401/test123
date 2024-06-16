import React, { useState, useEffect, FC } from "react";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogDescription,
	DialogHeader,
	DialogClose,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { db } from "@/app/firebase";
import {
	collection,
	query,
	where,
	getDocs,
	getDoc,
	DocumentData,
	doc,
	updateDoc,
	serverTimestamp,
	deleteDoc,
} from "firebase/firestore";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/use-toast";
import { NewButton } from "@/components/ui/new-button";
import { useIsVendor } from "@/hooks/useIsVendor";
import { format, addDays, set } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useRequireLogin } from "@/hooks/useRequireLogin";
import { useRouter } from "next/navigation";

interface ServiceDetailsDialogProps {
	id: string;
	onClose: () => void;
}

const ServiceDetailsDialog: FC<ServiceDetailsDialogProps> = ({
	id,
	onClose,
}) => {
	const router = useRouter();

	const { user } = useRequireLogin({
		onUnauthenticated: () => {
			router.push("/auth/signin");
		},
	});


	const [data, setData] = useState<any | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loadingAccept, setLoadingAccept] = useState<boolean>(false);
	const [loadingReject, setLoadingReject] = useState<boolean>(false);
	const [loadingDelete, setLoadingDelete] = useState<boolean>(false);

	const isVendor = useIsVendor(user);

	const handleAccept = async () => {
		setLoadingAccept(true);
		let docRef = doc(db, "offers", id);
		await updateDoc(docRef, {
			status: "accepted",
			acceptedAt: serverTimestamp(),
		});
		setLoadingAccept(false);
		onClose();
		toast({
			title: "Success",
			description: "Offer accepted",
			toastType: "success",
		});
	};

	const handleReject = async () => {
		setLoadingReject(true);
		let docRef = doc(db, "offers", id);
		await updateDoc(docRef, {
			status: "rejected",
			rejectedAt: serverTimestamp(),
		});
		setLoadingReject(false);
		onClose();
		toast({
			title: "Success",
			description: "Offer rejected",
			toastType: "success",
		});
	};

	const handleDelete = async () => {
		setLoadingDelete(true);
		let docRef = doc(db, "offers", id);
		await deleteDoc(docRef);
		setLoadingDelete(false);
		onClose();
		toast({
			title: "Success",
			description: "Offer deleted",
			toastType: "success",
		});
	};

	useEffect(() => {
		if (id) {
			getDoc(doc(db, "offers", id)).then((doc) => {
				setData(doc.data());
			});
		}
	}, [id]);

	console.log("Data: ", data?.status, "User: ", user, "IsVendor: ", isVendor);

	return (
		<Dialog open={true} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[600px] min-h-96 flex flex-col justify-between">
				{!data && user ? (
					<div className="w-full h-64 flex flex-col justify-betweenr">
						<Spinner />
					</div>
				) : (
					<>
						<div className="grid gap-6 p-1">
							<div className="grid gap-1">
								<div className="flex items-center justify-between align-middle">
									<h3 className="text-lg font-medium">Offer Details</h3>
									<div
										className={cn(
											'rounded-full px-3 py-1 text-sm font-medium',
											{
												'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400': data?.status === 'pending',
												'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400': data?.status === 'accepted',
												'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400': data?.status === 'rejected',
												'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400': data?.status === 'done',
											}
										)}
									>
										{data?.status}
									</div>
								</div>
								{data?.status === "pending" && (
									<p className="text-gray-500 dark:text-gray-400">
										Offer - Expires:{" "}
										{format(
											addDays(data.offerDate.toDate(), 1),
											"dd/MM/yyyy 'at' HH:mm",
										)}
									</p>
								)}
							</div>
							<Separator />
							<div className="grid gap-4">
								<div className="grid grid-cols-[120px_1fr] items-start gap-x-6">
									<p className="text-gray-500 dark:text-gray-400">Offer Date:</p>
									<p>
										{data?.offerDate &&
											format(data.offerDate.toDate(), "dd/MM/yyyy 'at' HH:mm")}
									</p>
								</div>
								{/* <div className="grid grid-cols-[120px_1fr] items-start gap-x-6">
							<p className="text-gray-500 dark:text-gray-400">Location</p>
							<p>123 Main St, Anytown USA</p>
						</div> */}
								<div className="grid grid-cols-[120px_1fr] items-start gap-x-6">
									<p className="text-gray-500 dark:text-gray-400">Costs:</p>
									<div className="grid gap-1">
										{!isVendor && (
											<>
												<div className="flex items-center justify-between">
													<p>Without tax</p>
													<p>
														{new Intl.NumberFormat("en-US", {
															style: "currency",
															currency: "USD",
														}).format(data?.withTax)}
													</p>
												</div>
												<div className="flex items-center justify-between">
													<p>Tax</p>
													<p>
														{new Intl.NumberFormat("en-US", {
															style: "currency",
															currency: "USD",
														}).format(data?.withoutTax - data?.withTax)}
													</p>
												</div>
											</>
										)}
										<div className="flex items-center justify-between font-medium">
											<p>Total</p>
											<p>
												{isVendor
													? new Intl.NumberFormat("en-US", {
														style: "currency",
														currency: "USD",
													}).format(data?.vendorСosts)
													: new Intl.NumberFormat("en-US", {
														style: "currency",
														currency: "USD",
													}).format(data?.withoutTax)}
											</p>
										</div>
									</div>
								</div>

								{data?.message && (
									<div className="grid grid-cols-[120px_1fr] items-start gap-x-6">
										<p className="text-gray-500 dark:text-gray-400">
											Description:
										</p>
										<p>{data?.message}</p>
									</div>
								)}
							</div>
						</div>
						<DialogFooter className="w-full align-middle flex flex-row justify-between sm:justify-between mt-2">
							<Button variant="secondary" onClick={onClose}>
								Close
							</Button>
							{data?.status === "pending" && isVendor ? (
								<div className="flex flex-row gap-2">
									<Button onClick={() => handleReject()} variant="outline">
										{loadingReject ? <Spinner /> : "Reject"}
									</Button>
									<Button className="px-6" onClick={() => handleAccept()}>
										{loadingAccept ? <Spinner /> : "Accept"}
									</Button>
								</div>
							) : null}
							{status === "pending" && !isVendor && (
								<div className="flex flex-row gap-2">
									<Button onClick={() => handleDelete()} variant="destructive">
										{loadingDelete ? <Spinner /> : "Delete"}
									</Button>
								</div>
							)}
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
};

export default ServiceDetailsDialog;
