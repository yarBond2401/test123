"use client";
import { db } from "@/app/firebase";
import { doc, getDoc } from "firebase/firestore";
import React from "react";

import { SWRConfig } from "swr";
interface SWRCustomConfigProps {
  children: React.ReactNode;
}

const SWRCustomConfig: React.FC<SWRCustomConfigProps> = ({ children }) => {
  return (
    <SWRConfig
      value={{
        suspense: false,
        fetcher: (resouse: string) =>
          getDoc(doc(db, resouse)).then((doc) => doc.data()),
        revalidateOnFocus: false,
        refreshInterval: 0,
        revalidateOnReconnect: true,
        onError: (err) => {
          console.error(err);
        },
      }}
    >
      {children}
    </SWRConfig>
  );
};

export default SWRCustomConfig;
