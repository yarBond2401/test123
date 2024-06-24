// @ts-nocheck

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import { capitalize, cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import { CardContent, CardFooter, CardHeader, CardTitle, Card, CardDescription } from '../ui/card';
import { CheckIcon, PlusIcon } from 'lucide-react';
import { Badge } from '../ui/badge';
import { AnimatedNumber } from '../ui/animated-numbers';
import { ExtendedButton } from '../ui/extended-button';
import { pricingDescriptions, pricingModels } from '@/lib/pricing-models';
import { createCheckoutSession } from '@/lib/checkout';
import { usePathname } from 'next/navigation';

interface AddPostsModalProps {
	userInfo: any;
	userEmail: string;
	userId: string;
}

const AddPostsModal: React.FC<AddPostsModalProps> = ({ userInfo, userEmail, userId }) => {
	const [open, setOpen] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
	const pathname = usePathname();

	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

	const availablePlans = ["bronze", "silver", "gold"];
	const currentPlan = userInfo?.level;
	const additionalPlans = availablePlans.filter(plan => plan !== currentPlan);

	const [prices, setPrices] = useState({
		currentPlanPrice: 0,
		currentPlanPostPrice: 0,
		additionalPlans: {
			bronze: { price: 0, postPrice: 0 },
			silver: { price: 0, postPrice: 0 },
			gold: { price: 0, postPrice: 0 },
		},
	});

	const handleSelectPlan = async (plan: string) => {
		setSelectedPlan(plan);
		localStorage.setItem("lastPath", pathname);

		console.log("Creating checkout session for plan:", plan);
		console.log("User info:", userInfo, "userId", userId, "userEmail", userEmail);

		const uniqueId = Math.random().toString(36).substring(7);
		const { url, session } = await createCheckoutSession({
			id: uniqueId,
			userId: userId,
			email: userEmail,
			region: userInfo.pricingRegion,
			plan: plan,
		});

		window.location.href = url;
	};

	useEffect(() => {
		if (open) {
			if (userInfo) {
				const newPrices = {
					currentPlanPrice: pricingModels[userInfo.pricingRegion][userInfo.level].price,
					currentPlanPostPrice: pricingModels[userInfo.pricingRegion][userInfo.level].postPrice,
					additionalPlans: additionalPlans.reduce((acc, plan) => {
						acc[plan] = {
							price: pricingModels[userInfo.pricingRegion][plan].price,
							postPrice: pricingModels[userInfo.pricingRegion][plan].postPrice,
						};
						return acc;
					}, {}),
				};
				setTimeout(() => setPrices(newPrices), 100);
			}
		} else {
			setPrices({
				currentPlanPrice: 0,
				currentPlanPostPrice: 0,
				additionalPlans: {
					bronze: { price: 0, postPrice: 0 },
					silver: { price: 0, postPrice: 0 },
					gold: { price: 0, postPrice: 0 },
				},
			});
		}
	}, [open, userInfo]);

	return (
		<>
			<ExtendedButton onClick={handleOpen} variant="shine">
				<PlusIcon className="mr-2" />
				Add More Posts
			</ExtendedButton>
			<Dialog open={open} onOpenChange={setOpen} className="min-w-[500px]">
				<DialogContent className="md:min-w-fit">
					{userInfo ? (
						<div className="space-y-4">
							<DialogHeader>
								<DialogTitle>Add more posts</DialogTitle>
								<DialogDescription>Proceed with your current plan</DialogDescription>
							</DialogHeader>
							<Card className={cn("min-w-[180px] transition-colors duration-300", userInfo?.level !== "silver" ? "bg-secondary" : "")}>
								<CardHeader className="text-center pb-2">
									{userInfo?.level == "silver" && (
										<Badge className="uppercase w-max self-center mb-3">Most popular</Badge>
									)}
									<CardTitle className="mb-5">{capitalize(userInfo?.level)} Plan</CardTitle>
									<span className="font-bold text-4xl">
										$<AnimatedNumber value={prices.currentPlanPrice} />
									</span>
								</CardHeader>
								<CardDescription className="text-center">
									{pricingDescriptions[userInfo?.level]}
								</CardDescription>
								<CardContent>
									<ul className="mt-5 space-y-2 text-sm">
										<li className="flex space-x-2">
											<CheckIcon className="flex-shrink-0 mt-0.5 h-4 w-4" />
											<span className="text-muted-foreground">
												$<AnimatedNumber value={prices.currentPlanPostPrice} /> per post
											</span>
										</li>
										<li className="flex space-x-2">
											<CheckIcon className="flex-shrink-0 mt-0.5 h-4 w-4" />
											<span className="text-muted-foreground">{pricingModels[userInfo?.pricingRegion][userInfo?.level].maxPosts} posts in plan</span>
										</li>
									</ul>
								</CardContent>
								<CardFooter>
									<Button
										variant="outline"
										className={cn("w-full transition-all duration-300", userInfo?.level !== "silver" ? "bg-primary text-white" : "bg-white text-primary border border-primary")}
										onClick={() => handleSelectPlan(userInfo?.level)}
										disabled={selectedPlan !== null}
									>
										{selectedPlan === userInfo?.level ? <Spinner /> : 'Proceed'}
									</Button>
								</CardFooter>
							</Card>
							<div className="text-center my-4">
								or select a new one
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
								{additionalPlans.map((plan) => (
									<Card key={plan} className={cn("min-w-[200px] transition-colors duration-300", userInfo?.level !== plan ? "bg-secondary" : "")}>
										<CardHeader className="text-center pb-2">
											<CardTitle className="mb-5">{plan.charAt(0).toUpperCase() + plan.slice(1)} Plan</CardTitle>
											<span className="font-bold text-4xl">
												$<AnimatedNumber value={prices.additionalPlans[plan]?.price || 0} />
											</span>
										</CardHeader>
										<CardDescription className="text-center">
											{pricingDescriptions[plan]}
										</CardDescription>
										<CardContent>
											<ul className="mt-5 space-y-2 text-sm">
												<li className="flex space-x-2">
													<CheckIcon className="flex-shrink-0 mt-0.5 h-4 w-4" />
													<span className="text-muted-foreground">
														$<AnimatedNumber value={prices.additionalPlans[plan]?.postPrice || 0} /> per post
													</span>
												</li>
												<li className="flex space-x-2">
													<CheckIcon className="flex-shrink-0 mt-0.5 h-4 w-4" />
													<span className="text-muted-foreground">{pricingModels[userInfo?.pricingRegion][plan].maxPosts} posts in plan</span>
												</li>
											</ul>
										</CardContent>
										<CardFooter>
											<Button
												variant="outline"
												className={cn("w-full transition-all duration-300", userInfo?.level !== plan ? "bg-primary text-white" : "bg-white text-primary border border-primary")}
												onClick={() => handleSelectPlan(plan)}
												disabled={selectedPlan !== null}
											>
												{selectedPlan === plan ? <Spinner /> : 'Select'}
											</Button>
										</CardFooter>
									</Card>
								))}
							</div>
						</div>
					) : <Spinner />}
				</DialogContent>
			</Dialog>
		</>
	);
};

export default AddPostsModal;
