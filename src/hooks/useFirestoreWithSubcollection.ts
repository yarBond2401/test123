"use client";

import useSWR from "swr";
import { getDoc, doc, collection, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase";

export const useFirestoreWithSubcollections = (
  path: string | null,
  subCollections: string[] = []
) => {
  const swrData = useSWR(path, async (path) => {
    const docRef = doc(db, path);
    const subCollectionsRefs = subCollections.map((subCollection) =>
      collection(docRef, subCollection)
    );

    const docSnap = await getDoc(doc(db, path));
    const subCollectionSnaps = await Promise.all(
      subCollectionsRefs.map((subCollectionRef) => getDocs(subCollectionRef))
    );

    const subCollectionMap = subCollections.reduce(
      (acc, subCollection, index) => {
        acc[subCollection] = subCollectionSnaps[index].docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        return acc;
      },
      {} as Record<string, any>
    );

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
      ...subCollectionMap,
    };
  });
  return swrData;
};
