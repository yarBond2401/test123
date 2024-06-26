import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useUserInfo from '@/hooks/useUserInfo';
import { useRouter } from 'next/navigation';
import { useRequireLogin } from '@/hooks/useRequireLogin';

const StripeAccountCard = () => {
	const router = useRouter();
	const { user } = useRequireLogin({
		onUnauthenticated: () => {
			router.push("/auth/signin");
		},
	});
	const { userInfo } = useUserInfo(user);

	const [accountCreatePending, setAccountCreatePending] = useState(false);
	const [accountLinkCreatePending, setAccountLinkCreatePending] = useState(false);
	const [error, setError] = useState(false);
	const [stripeAccountStatus, setStripeAccountStatus] = useState('not_created');

	useEffect(() => {
		if (userInfo && userInfo.stripeAccountId) {
			setStripeAccountStatus('created');
			checkAccountStatus(userInfo.stripeAccountId);
		}
	}, [userInfo]);

	const checkAccountStatus = async (accountId) => {
		try {
			const response = await axios.get(`/api/account_status/${accountId}`);
			const { status } = response.data;
			setStripeAccountStatus(status === 'active' ? 'linked' : 'created');
		} catch (err) {
			console.error("Error checking account status:", err);
			setError(true);
		}
	};

	const createStripeAccount = async () => {
		setAccountCreatePending(true);
		setError(false);
		try {
			const response = await axios.post("/api/account");
			const { account } = response.data;

			if (account) {
				setStripeAccountStatus('created');
				// You might want to update the user's info in your backend here
			}
		} catch (err) {
			setError(true);
			console.error("Error creating Stripe account:", err);
		} finally {
			setAccountCreatePending(false);
		}
	};

	const createAccountLink = async () => {
		setAccountLinkCreatePending(true);
		setError(false);
		try {
			const response = await axios.post("/api/account_link", {
				account: userInfo.stripeAccountId,
			});
			const { url } = response.data;

			if (url) {
				window.location.href = url;
			}
		} catch (err) {
			setError(true);
			console.error("Error creating account link:", err);
		} finally {
			setAccountLinkCreatePending(false);
		}
	};

	return (
		<Card className="w-full min-h-96 md:col-span-2 lg:col-span-4 flex flex-col justify-between">
			<CardHeader>
				<CardTitle>Stripe Account</CardTitle>
				<CardDescription>Connect your Stripe account to start accepting payments.</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4 max-w-xl">
				{stripeAccountStatus === 'not_created' && (
					<div className="flex flex-col items-center gap-4">
						<CreditCardIcon className="h-12 w-12 text-muted" />
						<div className="text-center space-y-2">
							<h3 className="font-semibold">Create a Stripe Account</h3>
							<p className="text-muted-foreground">You need to create a Stripe account to start accepting payments.</p>
						</div>
					</div>
				)}
				{stripeAccountStatus === 'created' && (
					<div className="flex flex-col items-center gap-4">
						<CircleCheckIcon className="h-12 w-12 text-green-500" />
						<div className="text-center space-y-2">
							<h3 className="font-semibold">Stripe Account Created</h3>
							<p className="text-muted-foreground">
								Your Stripe account is created. Please complete the onboarding process to start accepting payments.
							</p>
						</div>
					</div>
				)}
				{stripeAccountStatus === 'linked' && (
					<div className="flex flex-col items-center gap-4">
						<CircleCheckIcon className="h-12 w-12 text-green-500" />
						<div className="text-center space-y-2">
							<h3 className="font-semibold">Stripe Account Linked</h3>
							<p className="text-muted-foreground">
								Your Stripe account is fully set up and ready to accept payments.
							</p>
						</div>
					</div>
				)}
				{accountCreatePending && (
					<div className="flex flex-col items-center gap-4">
						<LoaderIcon className="h-12 w-12 animate-spin text-primary" />
						<div className="text-center space-y-2">
							<h3 className="font-semibold">Account Creation Pending</h3>
							<p className="text-muted-foreground">
								We&apos;re setting up your Stripe account. This may take a few seconds.
							</p>
						</div>
					</div>
				)}
				{error && (
					<div className="flex flex-col items-center gap-4">
						<TriangleAlertIcon className="h-12 w-12 text-red-500" />
						<div className="text-center space-y-2">
							<h3 className="font-semibold">Stripe Account Error</h3>
							<p className="text-muted-foreground">
								There was an error with your Stripe account. Please try again.
							</p>
						</div>
					</div>
				)}
			</CardContent>
			<CardFooter className='max-w-xl'>
				{stripeAccountStatus === 'not_created' && !accountCreatePending && (
					<Button onClick={createStripeAccount} className="w-full">
						Create Stripe Account
					</Button>
				)}
				{stripeAccountStatus === 'created' && !accountLinkCreatePending && (
					<Button onClick={createAccountLink} className="w-full">
						Complete Onboarding
					</Button>
				)}
				{stripeAccountStatus === 'linked' && (
					<Button onClick={() => window.open('https://dashboard.stripe.com', '_blank')} className="w-full">
						Go to Stripe Dashboard
					</Button>
				)}
			</CardFooter>
		</Card>
	);
};

export default StripeAccountCard;

function CircleCheckIcon(props) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<circle cx="12" cy="12" r="10" />
			<path d="m9 12 2 2 4-4" />
		</svg>
	)
}


function CreditCardIcon(props) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<rect width="20" height="14" x="2" y="5" rx="2" />
			<line x1="2" x2="22" y1="10" y2="10" />
		</svg>
	)
}


function LoaderIcon(props) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M12 2v4" />
			<path d="m16.2 7.8 2.9-2.9" />
			<path d="M18 12h4" />
			<path d="m16.2 16.2 2.9 2.9" />
			<path d="M12 18v4" />
			<path d="m4.9 19.1 2.9-2.9" />
			<path d="M2 12h4" />
			<path d="m4.9 4.9 2.9 2.9" />
		</svg>
	)
}


function TriangleAlertIcon(props) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
			<path d="M12 9v4" />
			<path d="M12 17h.01" />
		</svg>
	)
}
