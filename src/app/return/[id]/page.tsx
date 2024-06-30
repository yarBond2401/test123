"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserCheck } from 'lucide-react';

const Return = () => {
	const router = useRouter();

	const handleGoToProfile = () => {
		router.push('/dashboard/profile');
	};

	return (
		<div className="flex flex-col justify-center items-center w-full h-screen">
			<Card className="min-w-[300px] max-w-[400px]">
				<CardHeader>
					<CardTitle>Account Linked</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col items-center justify-center">
					<div className="bg-green-400 rounded-full p-3 my-2">
						<UserCheck className="w-6 h-6 text-white" />
					</div>
					<p>That&apos;s everything we need for now</p>
				</CardContent>
				<CardFooter className="flex flex-col items-start">
					<Button onClick={handleGoToProfile} className="w-full">
						Back to Profile
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
};

export default Return;