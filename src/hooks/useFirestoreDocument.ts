"use client";

import useSWR from "swr";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/app/firebase";

export const useFirestoreDocument = <T,>(path: string | null) => {
  const swrData = useSWR(path, async (path) => {
    const docSnap = await getDoc(doc(db, path));
    if (!docSnap.exists()) {
      return null;
    }
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as T;
  });
  return swrData;
};
