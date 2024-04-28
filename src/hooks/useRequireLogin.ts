"use client";

import { useEffect, useState } from "react";

import { auth } from "@/app/firebase";
import type { User } from "firebase/auth";
import useSWR from "swr";

interface UseRequireLogin {
  onUnauthenticated: () => void;
  onChange?: () => void;
}

export const useRequireLogin = ({
  onChange,
  onUnauthenticated,
}: UseRequireLogin) => {
  const [user, setUser] = useState<null | User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      onChange && onChange();
      setUser(user);
      setLoading(false);
      if (!user) {
        onUnauthenticated();
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return { user, loading };
};
