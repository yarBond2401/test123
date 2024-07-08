
import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/app/firebase";
import { useIsVendor } from "@/hooks/useIsVendor";
import { User } from "firebase/auth";
import { Agent, Vendor } from "@/lib/types";

export interface UserInfo {
    name: string;
    level: string;
    pricingRegion?: string;
    availablePosts?: number;
    postsInstalled: number;
    totalContracts: string;
    totalHires: number;
    totalHours: number;
    rating?: number,
    response?: string,
    totalMoney?: number,
    totalMoneyInt?: number,
    totalWork?: number,
    totalWorkInt?: number,
    totalHoursInt?: number,
    monthlyAmount?: number,
    annualAmount?: number,
    success?: number,
    stripeAccountId?: string;
    online?: boolean;
}

const useUserInfo = (user: User | null) => {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isVendor = useIsVendor(user);

    useEffect(() => {
        const fetchVendorInfo = async () => {
            try {
                const vendorDocRef = doc(db, "vendors", user?.uid || '');
                const vendorDoc: any = await getDoc(vendorDocRef);
                if (vendorDoc.exists()) {
                    setUserInfo(vendorDoc.data());
                    console.log('Vendor info:', vendorDoc.data());
                } else {
                    console.log("No such vendor!");
                }
            } catch (err: any) {
                console.error("Error fetching vendor info:", err);
                setError(err);
            }
        };

        if (isVendor) {
            fetchVendorInfo();
        }
    }, [isVendor, user]);

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
        const fetchUserInfo = async () => {
            try {
                const userDocRef = doc(db, "userInfo", user?.uid || '');
                const userDoc: any = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setUserInfo(userDoc.data());
                    console.log('User info:', userDoc.data());
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

        if (user?.uid) {
            fetchUserInfo();
        }
    }, [user]);

    return { userInfo, loading, error, updateUserInfo };
};

export default useUserInfo;
