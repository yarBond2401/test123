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
import axios from "axios";
import { API_BASE_URL } from "@/app/constants";
import { Loader2 } from "lucide-react";

const loaderStyles = "text-white w-6 h-6 animate-spin";

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

	const [stripeAccountStatus, setStripeAccountStatus] = useState<string>('');
	const [accountStatusLoading, setAccountStatusLoading] = useState<boolean>(false);

	const isVendor = useIsVendor(user);

	const { userInfo } = useUserInfo(user);

	const checkAccountStatus = async (accountId: string) => {
		setAccountStatusLoading(true);
		setError(false);
		try {
			const response = await axios.get(`${API_BASE_URL}/account_status/${accountId}`);
			const { status } = response.data;

			console.log("Account status:", status);
			setStripeAccountStatus(status);
		} catch (err) {
			console.error("Error checking account status:", err);
			setError(true);
		} finally {
			setAccountStatusLoading(false);
		}
	};

	useEffect(() => {
		if (isVendor && userInfo && userInfo.stripeAccountId) {
			checkAccountStatus(userInfo.stripeAccountId);
		} else if (data?.vendorStripeAccountId) {
			checkAccountStatus(data.vendorStripeAccountId)
		} else {
			setStripeAccountStatus('not_created');
		}
	}, [userInfo, data?.vendorStripeAccountId, isVendor]);

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
			console.log("Payment data:", {
				amount: data.withoutTax * 100,
				currency: 'usd',
				vendorId: data.vendorId,
				vendorStripeAccountId: data.vendorStripeAccountId,
				customerEmail: user?.email,
				metadata: {
					offerId: id,
					vendorId: data.vendorId,
					customerId: user?.uid,
				}
			});

			const response = await axios.post(`${API_BASE_URL}/create-connect-checkout-session`, {
				amount: data.withoutTax * 100,
				currency: 'usd',
				vendorId: data.vendorId,
				vendorStripeAccountId: data.vendorStripeAccountId,
				customerEmail: user?.email,
				metadata: {
					offerId: id,
					vendorId: data.vendorId,
					customerId: user?.uid,
				}
			});

			if (response.data.url) {
				window.location.href = response.data.url;
			} else {
				throw new Error('No checkout URL received');
			}
		} catch (error) {
			console.error('Error creating checkout session:', error);
			if ((error as any).response) {
				console.error('Error response:', (error as any).response.data);
			}
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
			console.log("Complete transaction data:", {
				paymentIntentId: data.paymentIntentId,
				offerId: id,
			});

			await updateOfferStatus(id, 'completed');

			const response = await axios.post(`${API_BASE_URL}/complete-transaction`, {
				paymentIntentId: data.paymentIntentId,
				offerId: id,
			});

			console.log("Complete transaction response:", response.data);

			// if (response.data.status === 'success') {
			// 	onClose();
			// 	toast({
			// 		title: "Success",
			// 		description: "Order completed and payment transferred to vendor",
			// 		toastType: "success",
			// 	});
			// } else {
			// 	throw new Error('Failed to complete transaction');
			// }
		} catch (error) {
			console.error('Error completing transaction:', error);
			// toast({
			// 	title: "Error",
			// 	description: "Failed to complete the order. Please try again.",
			// 	toastType: "error",
			// });
		} finally {
			setLoadingComplete(false);
		}
	};

	const updateOfferStatus = async (offerId: string, status: string) => {
		try {
			const offerRef = doc(db, "offers", offerId);
			await updateDoc(offerRef, {
				status: status,
				completedAt: serverTimestamp(),
			});
			setData((prevData: any) => ({ ...prevData, status: status }));
		} catch (error) {
			console.error('Error updating offer status:', error);
			toast({
				title: "Error",
				description: "Failed to update offer status. Please try again.",
				toastType: "error",
			});
		}
	};

	const handleCancelPayment = async () => {
		try {
			const response = await axios.post(`${API_BASE_URL}/cancel-payment`, {
				paymentIntentId: data.paymentIntentId,
			});

			if (response.data.success) {
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
				customerEmail: user?.email,
				metadata: {
					offerId: id,
					vendorId: data.vendorId,
					customerId: user?.uid,
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
				if (offerData?.status === 'in progress' || offerData?.status === 'payment_failed' || offerData?.status === 'completed') {
					fetchTransactionDetails(offerData.paymentIntentId);
				}
			});
		}
	}, [id]);

	const fetchTransactionDetails = async (paymentIntentId: string) => {
		try {
			const response = await axios.get(`${API_BASE_URL}/stripe-transaction-details`, {
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
		const buttonStyles = "min-w-[120px] flex justify-center items-center";

		if (isVendor) {
			return null;
		}

		switch (data?.status) {
			case "accepted":
				return (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<span>
									<Button
										className={buttonStyles}
										onClick={() => handlePay()}
										disabled={stripeAccountStatus !== 'active'}
									>
										{loadingPay ? <Loader2 className={loaderStyles} /> : "Proceed to Pay"}
									</Button>
								</span>
							</TooltipTrigger>
							<TooltipContent>
								{stripeAccountStatus !== 'active' && (
									<p className="text-sm text-red-500 dark:text-red-400">
										The vendor hasn&apos;t completed their payment setup. Please contact them to resolve this issue.
									</p>
								)}
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				);
			case "in progress":
				return (
					<Button className={buttonStyles} onClick={() => handleComplete()}>
						{loadingComplete ? <Loader2 className={loaderStyles} /> : "Complete Order"}
					</Button>
				);
			case "payment_failed":
				return (
					<Button className={buttonStyles} onClick={() => handleRetryPayment()} variant="outline">
						{loadingRetry ? <Loader2 className={loaderStyles} /> : "Retry Payment"}
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
										{/* {!isVendor && (
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
										)} */}
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
							{!userInfo?.stripeAccountId && userInfo && isVendor && (
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
													disabled={!userInfo?.stripeAccountId || stripeAccountStatus !== 'active' || accountStatusLoading}
												>
													{loadingAccept ? <Spinner /> : "Accept"}
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												{!userInfo?.stripeAccountId && !accountStatusLoading && (
													<p className="text-sm text-red-500 dark:text-red-400">
														Please connect your Stripe account in Profile
													</p>
												)}
												{accountStatusLoading && (
													<p className="text-sm text-gray-500 dark:text-gray-400">
														Checking account status to accept the offer
													</p>
												)}
												{stripeAccountStatus !== 'active' && !accountStatusLoading && (
													<p className="text-sm text-red-500 dark:text-red-400">
														Your Stripe account is not active. Please complete the onboarding process in Profile
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
		status: string;
	};
}

const TransactionReceipt: React.FC<TransactionReceiptProps> = ({ details }) => {
	return (
		<div className="space-y-4">
			<h3 className="text-md font-semibold">Transaction Details</h3>
			<div className="grid grid-cols-2 gap-2">
				<p>Total Amount:</p>
				<p>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(details.amount / 100)}</p>
				<p>Platform Fee:</p>
				<p>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(details.fees / 100)}</p>
				<p>Net Amount (Vendor Receives):</p>
				<p>{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(details.net / 100)}</p>

				{details.status !== "requires_capture" && (
					<>
						<p>Status:</p>
						<p>{details.status}</p>
					</>
				)}
				<p className="text-sm text-gray-400">Payment ID:</p>
				<p className="text-sm text-gray-400">{details.paymentIntentId}</p>
			</div>
			<Button
				variant="link"
				onClick={() => window.open(details.receiptUrl, '_blank')}
				className="text-blue-500 hover:underline p-0"
			>
				View Full Receipt
			</Button>
		</div>
	);
};