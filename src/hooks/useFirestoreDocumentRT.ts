"use client";

import useSWR from "swr";
import { useEffect, useState } from "react";
import { getDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "@/app/firebase";

export const useFirestoreDocumentRT = <T>(path: string | null) => {
  const [data, setData] = useState<T | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!path) {
      return;
    }
    const unsubscribe = onSnapshot(doc(db, path), (docSnap) => {
      if (!docSnap.exists()) {
        setData(undefined);
        setLoading(false);
        return;
      }
      setData({
        id: docSnap.id,
        ...docSnap.data(),
      } as T);
      setLoading(false);
    });
    return unsubscribe;
  }, [path]);

  return { data, loading, error };
};
