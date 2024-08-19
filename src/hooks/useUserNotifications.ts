import { db } from '@/app/firebase';
import { format, isToday, isYesterday } from 'date-fns';
import { collection, query, orderBy, onSnapshot, Timestamp, limit } from 'firebase/firestore';
import { useState, useEffect } from 'react';

interface Notification {
	id: string;
	message: string;
	createdAt: Timestamp;
}

interface GroupedNotification {
	id: string;
	text: string;
	time: string;
}

interface DayGroup {
	day: string;
	notificationsList: GroupedNotification[];
}

const groupNotificationsByDay = (notifications: Notification[]): DayGroup[] => {
	const grouped: Record<string, GroupedNotification[]> = {};

	const formatTime = (timestamp: Timestamp) => {
		return format(timestamp.toDate(), 'HH:mm');
	};

	const formatDateKey = (timestamp: Timestamp): string => {
		const date = timestamp.toDate();
		if (isToday(date)) {
			return 'Today';
		} else if (isYesterday(date)) {
			return 'Yesterday';
		} else {
			return format(date, 'MMMM d, yyyy');
		}
	};

	notifications.forEach((notification) => {
		const dayKey = formatDateKey(notification.createdAt);

		if (!grouped[dayKey]) {
			grouped[dayKey] = [];
		}

		grouped[dayKey].push({
			id: notification.id,
			text: notification.message,
			title: notification.title,
			time: formatTime(notification.createdAt),
		});
	});

	return Object.keys(grouped).map((day) => ({
		day,
		notificationsList: grouped[day],
	}));
};

const useUserNotifications = (uid: string, limitCount: number) => {
	const [notifications, setNotifications] = useState<DayGroup[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		if (!uid) {
			console.log('No UID provided');
			setLoading(false);
			return;
		}

		const notificationsRef = collection(db, `userInfo/${uid}/notifications`);
		let q;
		if (limitCount) {
			q = query(notificationsRef, orderBy('createdAt', 'desc'), limit(limitCount));
		} else {
			q = query(notificationsRef, orderBy('createdAt', 'desc'));
		}

		const unsubscribe = onSnapshot(
			q,
			(querySnapshot) => {
				const fetchedNotifications: Notification[] = querySnapshot.docs.map(
					(doc) =>
						({
							id: doc.id,
							...doc.data(),
						}) as Notification
				);

				console.log('Fetched notifications', JSON.stringify(fetchedNotifications));
				const groupedNotifications = groupNotificationsByDay(fetchedNotifications);
				setNotifications(groupedNotifications);
				setLoading(false);
			},
			(err) => {
				console.error('Error fetching notifications:', err);
				setError(err as Error);
				setLoading(false);
			}
		);

		return () => unsubscribe();
	}, [uid, limitCount]);

	return { notifications, loading, error, setNotifications };
};

export default useUserNotifications;
