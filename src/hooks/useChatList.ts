import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, limit } from "firebase/firestore";
import { db } from "@/app/firebase";
import { useIsVendor } from "./useIsVendor";
import { User } from "firebase/auth";

export const useChatList = (user: User | null, maxChats?: number) => {
  const [chats, setChats] = useState<any>([]);
  const isVendor = useIsVendor(user);

  useEffect(() => {
    if (!user) return;

    const colRef = collection(db, "chats");
    let q = query(
      colRef,
      where(isVendor ? "vendor" : "agent", "==", user.uid)
    );

    if (maxChats) {
      q = query(q, limit(maxChats));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChats(chats);
    });

    return () => unsubscribe();
  }, [user, isVendor, maxChats]);

  return chats;
};
