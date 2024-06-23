"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { checkPaymentStatus, createCheckoutSession } from '@/lib/checkout';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

const PaymentHandler = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const success = searchParams.get('success');
		const canceled = searchParams.get('canceled');
		const checkoutSessionId = localStorage.getItem("checkoutSessionId");
		const userId = localStorage.getItem("userId");
		const lastPath = localStorage.getItem("lastPath");

		const handlePaymentStatus = async () => {
			setIsLoading(true);
			try {
				console.log("Checking payment status...");
				console.log("success:", success, "canceled:", canceled, "checkoutSessionId:", checkoutSessionId, "userId:", userId);
				if (success && checkoutSessionId && userId) {
					const status = await checkPaymentStatus(checkoutSessionId);
					if (status === 'complete' || status === 'paid') {
						await updateDoc(doc(db, "userInfo", userId), {
							paymentPending: false,
						});
						showSuccessToast();
						router.push(lastPath);
					} else {
						setError("Payment was not completed successfully.");
					}
				} else if (canceled) {
					setError("Payment was canceled. Please try again.");
				}
			} catch (error) {
				console.error("Error checking payment status:", error);
				setError("An error occurred while processing your payment.");
			} finally {
				setIsLoading(false);
			}
		};

		handlePaymentStatus();
	}, [router, searchParams]);

	const handleGoBack = () => {
		const lastPath = localStorage.getItem("lastPath");
		if (lastPath) {
			router.push(lastPath);
		} else {
			router.push("/");
		}
	};

	const handleRetry = async () => {
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
			const { url, session } = await createCheckoutSession({
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

	if (error) {
		return (
			<div className="flex flex-col justify-center items-center w-full h-screen">
				<Card className="max-w-[400px]">
					<CardHeader>
						<CardTitle>Payment</CardTitle>
					</CardHeader>
					<CardContent>
						<CardDescription>{error}</CardDescription>
					</CardContent>
					<CardFooter className="flex flex-row gap-4">
						<Button className="w-full" variant="outline" onClick={handleGoBack}>Go back</Button>
						<Button className="w-full" onClick={handleRetry}>Retry</Button>
					</CardFooter>
				</Card>
			</div>
		);
	}

	return null;
};

export default PaymentHandler;