"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

type RequestContextType = {
	requestId: string | null;
	setRequestId: (id: string | null) => void;
};

const RequestContext = createContext<RequestContextType | undefined>(undefined);

export const RequestProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [requestId, setRequestId] = useState<string | null>(null);

	const value: RequestContextType = { requestId, setRequestId };

	return (
		<RequestContext.Provider value={value}>
			{children}
		</RequestContext.Provider>
	);
};

export const useRequest = (): RequestContextType => {
	const context = useContext(RequestContext);
	if (context === undefined) {
		throw new Error('useRequest must be used within a RequestProvider');
	}
	return context;
};
