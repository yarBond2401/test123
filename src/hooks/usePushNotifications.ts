"use client";

import { API_BASE_URL } from '@/app/constants';
import { useEffect } from 'react';
import axios from 'axios';

function usePushNotifications(user) {
	useEffect(() => {
		async function setupPushNotifications() {
			if ('serviceWorker' in navigator && 'PushManager' in window && user) {
				try {
					// Request permission first
					const permission = await Notification.requestPermission();

					if (permission !== 'granted') {
						console.log('Notification permission denied');
						return;
					}

					const registration = await navigator.serviceWorker.register('/sw.js');
					console.log('Service Worker registered');

					const subscription = await registration.pushManager.subscribe({
						userVisibleOnly: true,
						applicationServerKey: "BKGHNb8Kh4ZKnqNe4U1o9MH5nCSifY7My1FbpXTMDcFzCvRJQRv8X1S5CzmKzBgUAZdJvNw6u3MAi4-nBDNi32U",
					});

					// Send the subscription to your server
					await axios.post(`${API_BASE_URL}/subscribe`, {
						userId: user.uid,
						subscription: subscription
					});

					console.log('Push notification subscription successful');
				} catch (error) {
					console.error('Error during push notification setup:', error);
				}
			}
		}

		setupPushNotifications();
	}, [user]);
}

export default usePushNotifications;