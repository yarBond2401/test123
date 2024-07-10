import { useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/app/firebase";

const useOnlineStatus = (user: any | null, isVendor: boolean, loading?: boolean) => {
  useEffect(() => {
    console.log("loading: ", loading);
    if (!user || loading) return;

    console.log("User: ", user, "isVendor: ", isVendor);

    const collection = isVendor ? "vendors" : "userInfo";
    const userDocRef = doc(db, collection, user.uid);

    console.log("User doc ref: ", userDocRef);

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
      if (!loading)
        setOnlineStatus(false);
    };
  }, [user, isVendor, loading]);
};

export default useOnlineStatus;
