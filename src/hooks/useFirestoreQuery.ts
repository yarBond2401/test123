import useSWR from "swr";
import {
  collection,
  query,
  where,
  WhereFilterOp,
  getDocs,
  orderBy,
  FieldPath,
  OrderByDirection,
} from "firebase/firestore";
import { db } from "@/app/firebase";

export const useFirestoreQuery = <T>(
  col: string,
  field?: string,
  operator?: WhereFilterOp,
  value?: unknown,
  options: {
    orderField?: string | FieldPath;
    orderDirection?: OrderByDirection;
  } = {}
) => {
  const args = value ? [col, field, operator, value] : null;
  const swrData = useSWR<T, Error>(
    value ? [col, field, operator, value] : null,
    async () => {
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

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return data as T;
    }
  );

  return swrData;
};
