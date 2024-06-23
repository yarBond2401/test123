"use client";

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import React from 'react';

export function PaymentErrorModal({
	isOpen,
	onClose,
	onRetry,
	error,
	children,
}: Readonly<{
	isOpen: boolean;
	error: string;
	onRetry?: () => void;
	onClose?: () => void;
	children?: React.ReactNode;
}>) {
	return (
		<Dialog isOpen={isOpen} onClose={onClose}>
			<DialogHeader>
				<DialogTitle>Payment Error</DialogTitle>
			</DialogHeader>
			<DialogContent>
				<DialogDescription>{error}</DialogDescription>
				{children}

				<Button onClick={onRetry}>Retry</Button>
			</DialogContent>
		</Dialog>
	);
}