import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { startOfMonth, format, eachDayOfInterval } from 'date-fns';
import { db } from '@/app/firebase';

const useFetchCurrentMonthData = (isVendor: boolean, userId: string) => {
	const [currentMonthData, setCurrentMonthData] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			const start = startOfMonth(new Date());
			const end = new Date();

			const q = query(
				collection(db, 'offers'),
				where('status', 'in', ['accepted', 'in progress', 'completed']),
				where('acceptedAt', '>=', start),
				where('acceptedAt', '<=', end),
				where(isVendor ? 'vendorId' : 'agentId', '==', userId)
			);

			const querySnapshot = await getDocs(q);
			const transactions = [];
			querySnapshot.forEach((doc) => {
				transactions.push(doc.data());
			});

			const formattedData = transactions.map((transaction) => ({
				date: format(new Date(transaction.acceptedAt.toDate()), 'yyyy-MM-dd'),
				value: isVendor ? transaction.vendorCosts : transaction.withoutTax
			}));

			const allDates = eachDayOfInterval({ start, end }).map(date => ({
				date: format(date, 'yyyy-MM-dd'),
				value: 0
			}));

			formattedData.forEach(data => {
				const index = allDates.findIndex(item => item.date === data.date);
				if (index !== -1) {
					allDates[index].value += data.value;
				}
			});

			for (let i = 1; i < allDates.length; i++) {
				if (allDates[i].value === 0) {
					allDates[i].value = allDates[i - 1].value;
				}
			}

			const sortedData = isVendor
				? allDates.sort((a, b) => new Date(a.date) - new Date(b.date))
				: allDates.sort((a, b) => new Date(b.date) - new Date(a.date));

			setCurrentMonthData(sortedData);
			setLoading(false);
		};

		if (userId)
			fetchData();
	}, [isVendor, userId]);

	return { currentMonthData, loading };
};

export default useFetchCurrentMonthData;
