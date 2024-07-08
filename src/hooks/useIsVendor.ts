import { auth } from "@/app/firebase";
import { useEffect, useState } from "react";
import { User } from "firebase/auth";

export const useIsVendor = (user: User | null, setLoading?: (loading: boolean) => void) => {
  const [isVendor, setIsVendor] = useState(false);

  useEffect(() => {
    (async () => {
      if (setLoading) setLoading(true);
      if (user) {
        const idToken = await user.getIdTokenResult();
        const isVendorToken = (idToken.claims.vendor || false) as boolean;
        setIsVendor(isVendorToken);
      }
      if (setLoading) setLoading(false);
    })();
  }, [user, setLoading]);

  return isVendor;
};
