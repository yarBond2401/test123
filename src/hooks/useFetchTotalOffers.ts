import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase';

const useFetchTotalOffers = (isVendor: boolean, userId: string) => {
  const [totalOffers, setTotalOffers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTotalOffers = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const offersRef = collection(db, 'offers');
        const q = query(
          offersRef,
          where(isVendor ? 'vendorId' : 'agentId', '==', userId),
					where('status', 'in', ['accepted', 'in progress', 'completed'])
        );

        const querySnapshot = await getDocs(q);
        setTotalOffers(querySnapshot.size);
      } catch (error) {
        console.error('Error fetching total offers:', error);
      } finally {
        setLoading(false);
      }
    };

		if (userId) 	
    	fetchTotalOffers();
  }, [userId, isVendor]);

  return { totalOffers, loading };
};

export default useFetchTotalOffers;