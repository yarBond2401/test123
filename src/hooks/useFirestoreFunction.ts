"use client";

import useSWR from "swr";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/app/firebase";

interface FirestoreFunction {
  name: string;
  payload: any | null;
}

export const useFirestoreFunction = <T, >({ name, payload }: FirestoreFunction) => {
  const swrData = useSWR<T, Error>(
    payload?.uids ? [name, payload] : null,
    async ([name, payload]) => {
      const functionRef = httpsCallable(functions, name);
      const response = await functionRef(payload)
      return response.data as T;
    }
  );
  return swrData;
};
