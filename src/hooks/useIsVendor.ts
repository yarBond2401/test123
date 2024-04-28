import { auth } from "@/app/firebase";
import { useEffect, useMemo, useState } from "react";
import { User } from "firebase/auth";

export const useIsVendor = (user: User | null) => {
  const [isVendor, setIsVendor] = useState(false);

  useEffect(() => {
    (async () => {
      if (user) {
        const idToken = await user.getIdTokenResult()
        const isVendorToken = (idToken.claims.vendor || false) as boolean;
        setIsVendor(isVendorToken);
      }
    })();
  }, [user]);

  return isVendor;
};
