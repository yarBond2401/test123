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
import useUserInfo from "@/hooks/useUserInfo";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
	const [loadingPay, setLoadingPay] = useState<boolean>(false);
	const [loadingComplete, setLoadingComplete] = useState<boolean>(false);
	const [loadingRetry, setLoadingRetry] = useState<boolean>(false);
	const [transactionDetails, setTransactionDetails] = useState<any | null>(null);

	const isVendor = useIsVendor(user);

	const { userInfo } = useUserInfo(user);

	const handleAccept = async () => {
		setLoadingAccept(true);
		let docRef = doc(db, "offers", id);
		await updateDoc(docRef, {
			status: "accepted",
			vendorStripeAccountId: userInfo?.stripeAccountId,
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

	const handlePay = async () => {
		setLoadingPay(true);
		try {
			const response = await axios.post(`${API_BASE_URL}/create-connect-checkout-session`, {
				amount: data.withoutTax * 100,
				currency: 'usd',
				vendorStripeAccountId: data.vendorStripeAccountId,
				customerEmail: user.email,
				metadata: {
					offerId: id,
					vendorId: data.vendorId,
					customerId: user.uid,
				}
			});

			if (response.data.url) {
				window.location.href = response.data.url;
			} else {
				throw new Error('No checkout URL received');
			}
		} catch (error) {
			console.error('Error creating checkout session:', error);
			toast({
				title: "Error",
				description: "Failed to initiate payment. Please try again.",
				toastType: "error",
			});
		} finally {
			setLoadingPay(false);
		}
	};

	const handleComplete = async () => {
		setLoadingComplete(true);
		try {
			const response = await axios.post(`${API_BASE_URL}/complete-transaction`, {
				paymentIntentId: data.paymentIntentId,
			});

			if (response.data.status === 'success') {
				let docRef = doc(db, "offers", id);
				await updateDoc(docRef, {
					status: "completed",
					completedAt: serverTimestamp(),
				});
				onClose();
				toast({
					title: "Success",
					description: "Order completed and payment transferred to vendor",
					toastType: "success",
				});
			} else {
				throw new Error('Failed to complete transaction');
			}
		} catch (error) {
			console.error('Error completing transaction:', error);
			toast({
				title: "Error",
				description: "Failed to complete the order. Please try again.",
				toastType: "error",
			});
		} finally {
			setLoadingComplete(false);
		}
	};

	const handleCancelPayment = async () => {
		try {
			const response = await axios.post(`${API_BASE_URL}/cancel-payment`, {
				paymentIntentId: data.paymentIntentId,
			});

			if (response.data.success) {
				// Update local state or refresh data
				toast({
					title: "Success",
					description: "Payment has been canceled successfully.",
					toastType: "success",
				});
			}
		} catch (error) {
			console.error('Error canceling payment:', error);
			toast({
				title: "Error",
				description: "Failed to cancel payment. Please try again.",
				toastType: "error",
			});
		}
	};

	const handleRetryPayment = async () => {
		setLoadingRetry(true);
		try {
			await axios.post(`${API_BASE_URL}/cancel-payment`, {
				paymentIntentId: data.paymentIntentId,
			});

			const response = await axios.post(`${API_BASE_URL}/create-connect-checkout-session`, {
				amount: data.withoutTax * 100,
				currency: 'usd',
				vendorStripeAccountId: data.vendorStripeAccountId,
				customerEmail: user.email,
				metadata: {
					offerId: id,
					vendorId: data.vendorId,
					customerId: user.uid,
				}
			});

			if (response.data.url) {
				window.location.href = response.data.url;
			} else {
				throw new Error('No checkout URL received');
			}
		} catch (error) {
			console.error('Error retrying payment:', error);
			toast({
				title: "Error",
				description: "Failed to retry payment. Please try again.",
				toastType: "error",
			});
		} finally {
			setLoadingRetry(false);
		}
	};

	useEffect(() => {
		if (id) {
			getDoc(doc(db, "offers", id)).then((doc) => {
				const offerData = doc.data();
				setData(offerData);
				if (offerData?.status === 'pending_capture' || offerData?.status === 'payment_failed') {
					fetchTransactionDetails(offerData.paymentIntentId);
				}
			});
		}
	}, [id]);

	const fetchTransactionDetails = async (paymentIntentId: string) => {
		try {
			const response = await axios.get(`${API_BASE_URL}/transaction-details`, {
				params: { paymentIntentId }
			});
			setTransactionDetails(response.data);
		} catch (error) {
			console.error('Error fetching transaction details:', error);
			toast({
				title: "Error",
				description: "Failed to fetch transaction details.",
				toastType: "error",
			});
		}
	};

	console.log("Data: ", data?.status, "User: ", user, "IsVendor: ", isVendor, "offerData: ", data);

	const renderActionButton = () => {
		if (isVendor) {
			return null;
		}

		switch (data?.status) {
			case "accepted":
				return (
					<Button onClick={() => handlePay()}>
						{loadingPay ? <Spinner /> : "Proceed to Pay"}
					</Button>
				);
			case "pending_capture":
				return (
					<Button onClick={() => handleComplete()}>
						{loadingComplete ? <Spinner /> : "Complete Order"}
					</Button>
				);
			case "payment_failed":
				return (
					<Button onClick={() => handleRetryPayment()} variant="outline">
						{loadingRetry ? <Spinner /> : "Retry Payment"}
					</Button>
				);
			default:
				return null;
		}
	};

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
												'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400': data?.status === 'paid' || data?.status === 'completed',
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

							{transactionDetails && (
								<>
									<Separator />
									<TransactionReceipt details={transactionDetails} />
								</>
							)}
						</div>
						<div className="flex flex-row justify-center w-full mt-6">
							{!userInfo?.stripeAccountId && userInfo && (
								<p className="text-sm text-red-500 dark:text-red-400">
									Please connect your Stripe account in Profile to accept the offer
								</p>
							)}
						</div>
						<DialogFooter className="w-full align-middle flex flex-row justify-between sm:justify-between mt-2">
							<Button variant="secondary" onClick={onClose}>
								Close
							</Button>
							{data?.status === "pending" && isVendor && (
								<div className="flex flex-row gap-2">
									<Button onClick={() => handleReject()} variant="outline">
										{loadingReject ? <Spinner /> : "Reject"}
									</Button>
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger>
												<Button
													className="px-6"
													onClick={() => handleAccept()}
													disabled={!userInfo?.stripeAccountId}
												>
													{loadingAccept ? <Spinner /> : "Accept"}
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												{!userInfo?.stripeAccountId && (
													<p className="text-sm text-red-500 dark:text-red-400">
														Please connect your Stripe account in Profile
													</p>
												)}
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</div>
							)}
							{data?.status === "pending" && !isVendor && (
								<div className="flex flex-row gap-2">
									<Button onClick={() => handleDelete()} variant="destructive">
										{loadingDelete ? <Spinner /> : "Delete"}
									</Button>
								</div>
							)}
							{renderActionButton()}
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
};

export default ServiceDetailsDialog;


interface TransactionReceiptProps {
	details: {
		amount: number;
		currency: string;
		fees: number;
		net: number;
		paymentIntentId: string;
		receiptUrl: string;
	};
}

const TransactionReceipt: React.FC<TransactionReceiptProps> = ({ details }) => {
	return (
		<div className="space-y-4">
			<h3 className="text-lg font-semibold">Transaction Details</h3>
			<div className="grid grid-cols-2 gap-2">
				<div>Total Amount:</div>
				<div>{(details.amount / 100).toFixed(2)} {details.currency.toUpperCase()}</div>
				<div>Platform Fee:</div>
				<div>{(details.fees / 100).toFixed(2)} {details.currency.toUpperCase()}</div>
				<div>Net Amount (Vendor Receives):</div>
				<div>{(details.net / 100).toFixed(2)} {details.currency.toUpperCase()}</div>
				<div>Payment ID:</div>
				<div>{details.paymentIntentId}</div>
			</div>
			<a href={details.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
				View Full Receipt
			</a>
		</div>
	);
};

export default TransactionReceipt;