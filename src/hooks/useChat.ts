import { useEffect, useState } from "react";
import { db } from "@/app/firebase";
import { User } from "firebase/auth";
import {
  collection,
  orderBy,
  onSnapshot,
  query,
  limit,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useFirestoreDocument } from "./useFirestoreDocument";

interface Chat {
  user: User | null;
  chatId: string;
}

export const useChat = ({ chatId, user }: Chat) => {
  const colRef = collection(db, "chats", chatId, "messages");
  const { data: chatDetails } = useFirestoreDocument(`chats/${chatId}`);
  const [messages, setMessages] = useState<any[]>([]);

  const sendMessage = async (text: string) => {
    if (!user) return;
    const message = {
      text,
      sender: user.uid,
      time: serverTimestamp(),
      status: "sent",
    };
    await addDoc(colRef, message);
  };

  useEffect(() => {
    const q = query(colRef, orderBy("time", "desc"), limit(15));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messages);
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  return { chatDetails, messages, sendMessage };
};
