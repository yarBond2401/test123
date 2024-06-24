"use client";

import { Spinner } from '@/components/ui/spinner';
import React, { createContext, useContext, useState, ReactNode } from 'react';

const PaymentLoadingBanner = () => {
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center">
      <div className="absolute inset-0 bg-gray-600 bg-opacity-50 blur-sm"></div>
      <Spinner />
    </div>
  );
};

type PaymentLoadingContextType = {
  isPaymentLoading: boolean;
  setPaymentLoading: (isPaymentLoading: boolean) => void;
};

const defaultState: PaymentLoadingContextType = {
  isPaymentLoading: false,
  setPaymentLoading: () => { }
};

const PaymentLoadingContext = createContext<PaymentLoadingContextType>(defaultState);

export const usePaymentLoading = () => useContext(PaymentLoadingContext);

interface PaymentLoadingProviderProps {
  children: ReactNode;
}

export const PaymentLoadingProvider: React.FC<PaymentLoadingProviderProps> = ({ children }) => {
  const [isPaymentLoading, setPaymentLoading] = useState<boolean>(false);

  return (
    <PaymentLoadingContext.Provider value={{ isPaymentLoading, setPaymentLoading }}>
      {isPaymentLoading && <PaymentLoadingBanner />}
      {children}
    </PaymentLoadingContext.Provider>
  );
};
