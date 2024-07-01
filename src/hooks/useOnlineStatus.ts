import { useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/app/firebase";

const useOnlineStatus = (user: any | null, isVendor: boolean) => {
  useEffect(() => {
    if (!user) return;

    const collection = isVendor ? "vendors" : "userInfo";
    const userDocRef = doc(db, collection, user.uid);

    const setOnlineStatus = async (isOnline: boolean) => {
      try {
        console.log("Setting online status to: ", isOnline);
        await updateDoc(userDocRef, { online: isOnline });
      } catch (error) {
        console.error("Error updating online status: ", error);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setOnlineStatus(true);
      } else {
        setOnlineStatus(false);
      }
    };

    const handleBeforeUnload = () => {
      setOnlineStatus(false);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    setOnlineStatus(true);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      setOnlineStatus(false);
    };
  }, [user, isVendor]);
};

export default useOnlineStatus;
