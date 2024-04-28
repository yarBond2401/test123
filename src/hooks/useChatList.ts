import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { HttpsCallable } from "firebase/functions";
import { db, functions } from "@/app/firebase";
import { useIsVendor } from "./useIsVendor";
import { User } from "firebase/auth";

export const useChatList = (user: User | null) => {
  const [chats, setChats] = useState<any>([]);
  const isVendor = useIsVendor(user);
  
  useEffect(() => {
    const colRef = collection(db, "chats");
    if (!user) return;
    console.log("user", user.uid, isVendor)
    const q = query(
      colRef,
      where(isVendor ? "vendor" : "agent", "==", user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChats(chats);
    });

    return () => {
      unsubscribe();
    };
  }, [user, isVendor]);

  return chats;
};
