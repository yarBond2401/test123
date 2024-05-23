
import { useState, useEffect } from "react";
import {doc, getDoc, updateDoc} from "firebase/firestore";
import { db } from "@/app/firebase";
import {Agent, Vendor} from "@/mock/types";
import {useIsVendor} from "@/hooks/useIsVendor";
import {User} from "firebase/auth";
import {agent, vendor} from "@/mock/users";

interface UserInfo {
    availablePosts: string;
    postInstalled: string;
    rating: string;
    totalContracts: string;
    totalHires: string;
    totalHours: string;
}

const useUserInfo = (user: User | null) => {
    const [mockUser, setMockUser] = useState<Vendor | Agent | null>(null);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isVendor = useIsVendor(user);

    useEffect(()=> {
        if(isVendor){
            setMockUser(vendor);
        }
        if(userInfo && !isVendor){
            setMockUser({...agent, postsAvailable: userInfo.availablePosts ?? agent.postsAvailable, postsInstalled: userInfo.postInstalled ?? agent.postsInstalled, rating: userInfo.rating ?? agent.rating  });
        }
    }, [userInfo, isVendor])

    const fetchUserInfo = async () => {
        try {
            const userDocRef = doc(db, "userInfo", user?.uid || '');
            const userDoc :any = await getDoc(userDocRef);
            if (userDoc.exists()) {
                setUserInfo(userDoc.data());
            } else {
                console.log("No such user!");
            }
        } catch (err: any) {
            console.error("Error fetching user info:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const updateUserInfo = async (newUserInfo: Partial<UserInfo>) => {
        try {
            const userDocRef = doc(db, "userInfo", user?.uid ?? '');
            await updateDoc(userDocRef, newUserInfo);
            setUserInfo((prevUserInfo) => ({
                ...prevUserInfo,
                ...newUserInfo,
            } as UserInfo));
        } catch (err: any) {
            console.error("Error updating user info:", err);
            setError(err);
        }
    };

    useEffect(() => {
        if (user?.uid) {
                fetchUserInfo();
        }
    }, [user]);

    return { mockUser, userInfo, loading, error, updateUserInfo };
};

export default useUserInfo;
