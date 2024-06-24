import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";

import SWRCustomConfig from "@/components/SWRCustomConfig";
import AppCheckProvider from "@/components/AppCheckProvider";
import "@/app/globals.css";
import { RequestProvider } from "@/components/RequestContext";
import { OfferDetailsProvider } from "@/hooks/useOfferDetails";
import { PaymentLoadingProvider } from "@/hooks/usePaymentLoading";


const fontSans = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "MRK IT",
  description: "Your Real Estate business success partner",
  robots: {
    index: false,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-y-scroll">
      <SWRCustomConfig>
        <AppCheckProvider>
          <RequestProvider>
            <PaymentLoadingProvider>
              <OfferDetailsProvider>
                <body
                  className={`min-h-screen bg-psecondary font-sans antialiased ${fontSans.variable}`}
                >
                  {children}
                  <Toaster />
                </body>
              </OfferDetailsProvider>
            </PaymentLoadingProvider>
          </RequestProvider>
        </AppCheckProvider>
      </SWRCustomConfig>
    </html>
  );
}
