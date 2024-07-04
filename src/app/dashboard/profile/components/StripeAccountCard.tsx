import { useState, useEffect } from 'react';
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
import { Spinner } from '@/components/ui/spinner';
import { API_BASE_URL } from '@/app/constants';
import { AlertTriangle, CheckCircle, CreditCard, InfoIcon } from 'lucide-react';

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
	const [accountStatusLoading, setAccountStatusLoading] = useState(false);

	useEffect(() => {
		if (userInfo && userInfo.stripeAccountId) {
			setStripeAccountStatus('created');
			checkAccountStatus(userInfo.stripeAccountId);
		}
	}, [userInfo]);

	const checkAccountStatus = async (accountId: string) => {
		setAccountStatusLoading(true);
		setError(false);
		try {
			const response = await axios.get(`${API_BASE_URL}/account_status/${accountId}`);
			const { status } = response.data;

			console.log("Account status:", status);
			setStripeAccountStatus(status === 'active' ? 'linked' : 'created');
		} catch (err) {
			console.error("Error checking account status:", err);
			setError(true);
		} finally {
			setAccountStatusLoading(false);
		}
	};

	const createStripeAccount = async () => {
		setAccountCreatePending(true);
		setError(false);
		try {
			const response = await axios.post(`${API_BASE_URL}/create-connect-account`, {
				email: user?.email,
				vendorId: user?.uid,
			});
			console.log(response.data);
			const { url } = response.data;

			setAccountCreatePending(false);

			if (url) {
				setStripeAccountStatus('created');
				window.location.href = url;
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
			const response = await axios.post(`${API_BASE_URL}/link-connect-account`, {
				account: userInfo?.stripeAccountId,
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
				{accountStatusLoading || !userInfo ? (
					<div className="flex flex-col items-center gap-4">
						<Spinner className="h-12 w-12 text-primary" />
						<div className="text-center space-y-2">
							<h3 className="font-semibold">Checking Account Status</h3>
							<p className="text-muted-foreground">
								We&apos;re verifying your Stripe account status. This may take a few seconds.
							</p>
						</div>
					</div>
				) : (
					<>
						{stripeAccountStatus === 'not_created' && !accountCreatePending && !error && (
							<div className="flex flex-col items-center gap-4">
								<CreditCard className="h-12 w-12 text-primary" />
								<div className="text-center space-y-2">
									<h3 className="font-semibold">Create a Stripe Account</h3>
									<p className="text-muted-foreground">You need to create a Stripe account to start accepting payments.</p>
								</div>
							</div>
						)}
						{stripeAccountStatus === 'created' && !accountCreatePending && !error && (
							<div className="flex flex-col items-center gap-4">
								<InfoIcon className="h-12 w-12 text-orange-400" />
								<div className="text-center space-y-2">
									<h3 className="font-semibold">Stripe Account Created</h3>
									<p className="text-muted-foreground">
										Please complete the onboarding process to start accepting payments.
									</p>
								</div>
							</div>
						)}
						{stripeAccountStatus === 'linked' && !accountCreatePending && !error && (
							<div className="flex flex-col items-center gap-4">
								<CheckCircle className="h-12 w-12 text-green-500" />
								<div className="text-center space-y-2">
									<h3 className="font-semibold">Stripe Account Linked</h3>
									<p className="text-muted-foreground">
										Your Stripe account is fully set up and ready to accept payments.
										You can now manage your accoun and payments on the Stripe dashboard.
									</p>
								</div>
							</div>
						)}
						{accountCreatePending && (
							<div className="flex flex-col items-center gap-4">
								<Spinner className="h-12 w-12 text-primary" />
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
								<AlertTriangle className="h-12 w-12 text-red-500" />
								<div className="text-center space-y-2">
									<h3 className="font-semibold">Stripe Account Error</h3>
									<p className="text-muted-foreground">
										There was an error with your Stripe account. Please try again.
									</p>
								</div>
							</div>
						)}
					</>
				)}
			</CardContent>
			<CardFooter className='max-w-xl'>
				{!accountStatusLoading && (
					<>
						{stripeAccountStatus === 'not_created' && !accountCreatePending && (
							<Button onClick={() => createStripeAccount()} className="w-full">
								Create Stripe Account
							</Button>
						)}
						{stripeAccountStatus === 'created' && !accountLinkCreatePending && (
							<Button onClick={() => createAccountLink()} className="w-full bg-orange-500 hover:bg-orange-400">
								Complete Onboarding
							</Button>
						)}
						{stripeAccountStatus === 'linked' && (
							<Button onClick={() => window.open('https://dashboard.stripe.com', '_blank')} className="w-full">
								Go to Stripe Dashboard
							</Button>
						)}
					</>
				)}
			</CardFooter>
		</Card >
	);
};

export default StripeAccountCard;