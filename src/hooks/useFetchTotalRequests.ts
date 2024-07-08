import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase';

const useFetchTotalRequests = (userId: string) => {
	const [totalRequests, setTotalRequests] = useState(0);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchTotalRequests = async () => {
			if (!userId) {
				setLoading(false);
				return;
			}

			try {
				const requestsRef = collection(db, 'requests');
				const q = query(
					requestsRef,
					where('userId', '==', userId),
					where('status', '==', 'resolved')
				);

				const querySnapshot = await getDocs(q);
				setTotalRequests(querySnapshot.size);
			} catch (error) {
				console.error('Error fetching total resolved requests:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchTotalRequests();
	}, [userId]);

	return { totalRequests, loading };
};

export default useFetchTotalRequests;