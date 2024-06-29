import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  WhereFilterOp,
  onSnapshot,
  orderBy,
  FieldPath,
  OrderByDirection,
  QuerySnapshot,
  DocumentData
} from "firebase/firestore";
import { db } from "@/app/firebase";

export const useFirestoreSnapshot = <T>(
  col: string,
  field?: string,
  operator?: WhereFilterOp,
  value?: unknown,
  options: {
    orderField?: string | FieldPath;
    orderDirection?: OrderByDirection;
  } = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const colRef = collection(db, col);
    let q;

    if (field && operator && value && options.orderField && options.orderDirection) {
      q = query(
        colRef,
        where(field, operator, value),
        orderBy(options.orderField, options.orderDirection)
      );
    } else if (field && operator && value && options.orderField) {
      q = query(
        colRef,
        where(field, operator, value),
        orderBy(options.orderField)
      );
    } else if (field && operator && value) {
      q = query(colRef, where(field, operator, value));
    } else {
      q = colRef;
    }

    const unsubscribe = onSnapshot(q, 
      (querySnapshot: QuerySnapshot<DocumentData>) => {
        const fetchedData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(fetchedData as T);
        setLoading(false);
      },
      (err: Error) => {
        setError(err);
        setLoading(false);
      }
    );

    // Cleanup function
    return () => unsubscribe();
  }, [col, field, operator, value, options.orderField, options.orderDirection]);

  return { data, error, loading };
};