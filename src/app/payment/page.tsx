"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { checkPaymentStatus, createCheckoutSession } from '@/lib/checkout';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const PaymentHandler = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [paymentType, setPaymentType] = useState<'default' | 'connect' | null>(null);
	const [paymentStatus, setPaymentStatus] = useState<'success' | 'pending' | 'failed' | null>(null);
	const [paymentData, setPaymentData] = useState<any>(null);
	const [loadingRetry, setLoadingRetry] = useState(false);

	const [paymentInformation, setPaymentInformation] = useState<any>(null);

	useEffect(() => {
		const success = searchParams.get('success');
		const canceled = searchParams.get('canceled');
		const sessionId = searchParams.get('session_id');
		const offerId = searchParams.get('offerId');

		const handlePaymentStatus = async () => {
			setIsLoading(true);
			try {
				if (sessionId) {
					const paymentInfo = await checkPaymentStatus(sessionId);
					setPaymentInformation(paymentInfo);

					if (offerId || (paymentInfo.metadata && paymentInfo.metadata.offerId)) {
						// Connect payment
						setPaymentType('connect');
						console.log('Payment info:', paymentInfo);
						await handleConnectPayment(paymentInfo, offerId || paymentInfo.metadata.offerId);
					} else {
						// Default payment
						setPaymentType('default');
						await handleDefaultPayment(paymentInfo);
					}
				} else if (success === 'true') {
					// Handle success without session ID (legacy support)
					setPaymentStatus('success');
					showSuccessToast();
				} else if (canceled === 'true') {
					setError("Payment was canceled. Please try again.");
					setPaymentStatus('failed');
				} else {
					setError("Invalid payment session. Please try again.");
					setPaymentStatus('failed');
				}
			} catch (error) {
				console.error("Error checking payment status:", error);
				setError("An error occurred while processing your payment.");
				setPaymentStatus('failed');
			} finally {
				setIsLoading(false);
			}
		};

		handlePaymentStatus();
	}, [router, searchParams]);

	const handleConnectPayment = async (paymentInfo: any, offerId: string) => {
		setPaymentData(paymentInfo);
		console.log('Payment info:', paymentInfo);
		if (paymentInfo.status === 'paid') {
			setPaymentStatus('success');
			await fetchTransactionDetails(offerId);
		} else if (paymentInfo.status === 'unpaid' || paymentInfo.status === 'pending') {
			setPaymentStatus('pending');
		} else {
			setPaymentStatus('failed');
			setError("Payment was not completed successfully.");
		}
	};

	const handleDefaultPayment = async (paymentInfo: any) => {
		setPaymentData(paymentInfo);
		if (paymentInfo.status === 'paid' || paymentInfo.status === 'complete') {
			setPaymentStatus('success');
			const userId = localStorage.getItem("userId");
			if (userId) {
				await updateDoc(doc(db, "userInfo", userId), {
					paymentPending: false,
				});
			}
			showSuccessToast();
		} else if (paymentInfo.status === 'unpaid' || paymentInfo.status === 'pending') {
			setPaymentStatus('pending');
		} else {
			setPaymentStatus('failed');
			setError("Payment was not completed successfully.");
		}
	};

	const handleRetry = async () => {
		if (paymentType === 'connect') {
			await handleRetryConnectPayment();
		} else {
			await handleRetryDefaultPayment();
		}
	};

	const handleRetryConnectPayment = async () => {
		setLoadingRetry(true);
		try {
			await axios.post(`${API_BASE_URL}/cancel-payment`, {
				paymentIntentId: paymentData.metadata.paymentIntentId,
			});

			const response = await axios.post(`${API_BASE_URL}/create-connect-checkout-session`, {
				amount: paymentData.metadata.amount,
				currency: 'usd',
				vendorId: paymentData.metadata.vendorId,
				customerEmail: paymentData.customerEmail,
				metadata: {
					offerId: paymentData.metadata.offerId,
					vendorId: paymentData.metadata.vendorId,
					customerId: paymentData.metadata.customerId,
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

	const handleRetryDefaultPayment = async () => {
		const userEmail = localStorage.getItem("userEmail");
		const pricingRegion = localStorage.getItem("pricingRegion");
		const pricingModel = localStorage.getItem("pricingModel");
		const userId = localStorage.getItem("userId");
		const isNewUser = localStorage.getItem("isNewUser");

		if (!userEmail || !pricingRegion || !pricingModel || !userId) {
			setError("Missing user information. Please try signing up again.");
			return;
		}

		try {
			const uniqueId = Math.random().toString(36).substring(7);
			const { url } = await createCheckoutSession({
				id: uniqueId,
				userId,
				email: userEmail,
				region: pricingRegion,
				plan: pricingModel,
				isNewUser: isNewUser === "true",
			});
			window.location.href = url;
		} catch (error) {
			console.error("Error creating checkout session:", error);
			setError("Failed to initiate payment. Please try again.");
		}
	};

	const fetchTransactionDetails = async (offerId: string) => {
		try {
			const offerDoc = await getDoc(doc(db, "offers", offerId));
			if (offerDoc.exists()) {
				const offerData = offerDoc.data();
				setPaymentData((prevData: any) => ({ ...prevData, transactionDetails: offerData }));
			}
		} catch (error) {
			console.error('Error fetching transaction details:', error);
			toast({
				title: "Error",
				description: "Failed to fetch transaction details.",
				toastType: "error",
			});
		}
	};

	const showSuccessToast = () => {
		toast({
			toastType: "success",
			title: "Payment successful!",
			description: "Your payment was processed successfully",
		});
	};

	if (isLoading) {
		return (
			<div className="flex flex-col justify-center items-center w-full h-screen">
				<Card className="min-w-[300px] max-w-[400px]">
					<CardHeader>
						<CardTitle>Payment</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-col justify-center items-center w-full">
						<CardDescription>Processing payment</CardDescription>
						<Spinner className="w-8 h-8" />
					</CardContent>
				</Card>
			</div>
		);
	}

	if (paymentStatus === 'failed' || error) {
		return (
			<div className="flex flex-col justify-center items-center w-full h-screen">
				<Card className="max-w-[400px]">
					<CardHeader>
						<CardTitle>Payment Failed</CardTitle>
					</CardHeader>
					<CardContent>
						<CardDescription>{error || "An error occurred during payment."}</CardDescription>
					</CardContent>
					<CardFooter className="flex flex-row gap-4">
						<Button className="w-full" variant="outline" onClick={() => router.push('/')}>Go Home</Button>
						<Button className="w-full" onClick={handleRetry} disabled={loadingRetry}>
							{loadingRetry ? <Spinner className="w-4 h-4 mr-2" /> : null}
							Retry Payment
						</Button>
					</CardFooter>
				</Card>
			</div>
		);
	}

	if (paymentStatus === 'success') {
		return (
			<div className="flex flex-col justify-center items-center w-full h-screen">
				<Card className="max-w-[400px]">
					<CardHeader>
						<CardTitle>Payment Successful</CardTitle>
					</CardHeader>
					<CardContent>
						<CardDescription>
							{paymentType === 'connect' && paymentData?.transactionDetails ? (
								<>
									<p>
										Your payment of ${paymentData?.transactionDetails?.withoutTax} has been processed successfully.

									</p>
									<p>
										Transaction ID: {paymentData.transactionDetails.paymentIntentId}
									</p>
								</>
							) : (
								"Your payment has been processed successfully."
							)}
						</CardDescription>
					</CardContent>
					<CardFooter>
						<Button className="w-full" onClick={() => router.push('/dashboard/offers')}>Continue</Button>
					</CardFooter>
				</Card>
			</div>
		);
	}

	if (paymentStatus === 'pending' && !paymentInformation.metadata.offerId) {
		return (
			<div className="flex flex-col justify-center items-center w-full h-screen">
				<Card className="max-w-[400px]">
					<CardHeader>
						<CardTitle>Payment Pending</CardTitle>
					</CardHeader>
					<CardContent>
						<CardDescription>
							Your payment is being processed. Please check back later for the status.
						</CardDescription>
					</CardContent>
					<CardFooter>
						<Button className="w-full" onClick={() => router.push('/')}>Go Home</Button>
					</CardFooter>
				</Card>
			</div>
		);
	}

	if (paymentStatus === 'pending' && paymentInformation.metadata.offerId) {
		return (
			<div className="flex flex-col justify-center items-center w-full h-screen">
				<Card className="max-w-[400px]">
					<CardHeader>
						<CardTitle>Payment Succeed</CardTitle>
					</CardHeader>
					<CardContent>
						<CardDescription>
							The funds have been blocked. After the offer is completed, they will be sent to vendor.
						</CardDescription>
					</CardContent>
					<CardFooter>
						<Button className="w-full" onClick={() => router.push('/dashboard/offers')}>Continue</Button>
					</CardFooter>
				</Card>
			</div>
		);
	}

	return null;
};

export default PaymentHandler;