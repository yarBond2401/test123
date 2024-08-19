import React from 'react';
import { Bell, Loader2, X } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import useUserNotifications from '@/hooks/useUserNotifications';


const NotificationItem = ({ notification, deleteNotification }) => (
	<Card className="mb-2">
		<CardContent className="flex items-center p-2 text-sm">
			<Bell className="w-4 h-4 mr-2 flex-shrink-0" />
			<div className="flex-1 min-w-0">
				<div className="flex items-baseline gap-1">
					<span className="font-bold text-xs">{notification.time}</span>
					<span className="font-medium truncate">{notification.title}</span>
				</div>
				<p className="text-xs text-gray-600 truncate">{notification.text}</p>
			</div>
			<Button
				variant="ghost"
				size="sm"
				className="ml-2 h-6 w-6 p-0"
				onClick={() => deleteNotification(notification.id)}
			>
				<X className="w-3 h-3" />
			</Button>
		</CardContent>
	</Card>
);

const NotificationsList = ({ userId }) => {
	const { notifications, loading, setNotifications } = useUserNotifications(userId);

	const deleteNotification = async (id) => {
		// Implement delete logic here
		console.log('Deleting notification', id);
	};

	return (
		<div className="w-full">
			{/* <h2 className="text-lg font-semibold mb-2">Notifications</h2> */}
			{loading ? (
				<div className="flex justify-center items-center h-24">
					<Loader2 className="w-6 h-6 animate-spin" />
				</div>
			) : notifications.length > 0 ? (
				<ScrollArea className="h-32">
					{notifications.flatMap(dailyNotifications =>
						dailyNotifications.notificationsList.map(notification => (
							<NotificationItem
								key={notification.id}
								notification={notification}
								deleteNotification={deleteNotification}
							/>
						))
					)}
				</ScrollArea>
			) : (
				<div className="text-center py-4">
					<p className="text-sm text-gray-600">No notifications</p>
				</div>
			)}
		</div>
	);
};



export default NotificationsList;