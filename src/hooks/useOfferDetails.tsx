"use client";

import ServiceDetailsDialog from '@/app/dashboard/chat/[id]/components/ServiceDetailsDialog';
import React, { createContext, useContext, useState, FC, ReactNode } from 'react';

interface OfferDetailsContextType {
	openDialog: (id: string) => void;
	closeDialog: () => void;
	dialogId: string | null;
}

const OfferDetailsContext = createContext<OfferDetailsContextType | undefined>(undefined);

export const OfferDetailsProvider: FC<{ children: ReactNode }> = ({ children }) => {
	const [dialogId, setDialogId] = useState<string | null>(null);

	const openDialog = (id: string) => {
		setDialogId(id);
	};

	const closeDialog = () => {
		setDialogId(null);
	};

	return (
		<OfferDetailsContext.Provider value={{ openDialog, closeDialog, dialogId }}>
			{children}
			{dialogId && <ServiceDetailsDialog id={dialogId} onClose={closeDialog} />}
		</OfferDetailsContext.Provider>
	);
};

export const useOfferDetails = () => {
	const context = useContext(OfferDetailsContext);
	if (!context) {
		throw new Error('useOfferDetails must be used within a OfferDetailsProvider');
	}
	return context;
};
