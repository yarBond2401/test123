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

					// Register or get the service worker
					let registration = await navigator.serviceWorker.getRegistration('./sw.js');
					if (!registration) {
						registration = await navigator.serviceWorker.register('./sw.js');
						console.log('New service worker registered');
					} else {
						console.log('Using existing service worker registration');
					}

					// Ensure the service worker is active
					if (registration.installing) {
						console.log('Service worker is installing. Waiting for it to activate...');
						await new Promise(resolve => {
							registration.installing.addEventListener('statechange', (e) => {
								if (e.target.state === 'activated') {
									console.log('Service worker activated');
									resolve();
								}
							});
						});
					}

					// Set up update handler
					registration.onupdatefound = () => {
						const installingWorker = registration.installing;
						installingWorker.onstatechange = () => {
							if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
								console.log('New version available, updating...');
								window.location.reload();
							}
						};
					};

					// Wait for the service worker to be ready
					await navigator.serviceWorker.ready;

					// Subscribe to push notifications
					let subscription = await registration.pushManager.getSubscription();
					if (!subscription) {
						subscription = await registration.pushManager.subscribe({
							userVisibleOnly: true,
							applicationServerKey: "BKGHNb8Kh4ZKnqNe4U1o9MH5nCSifY7My1FbpXTMDcFzCvRJQRv8X1S5CzmKzBgUAZdJvNw6u3MAi4-nBDNi32U",
						});
						console.log('New push subscription created:', subscription);
					} else {
						console.log('Using existing push subscription:', subscription);
					}

					// Send the subscription to your server
					await axios.post(`${API_BASE_URL}/subscribe`, {
						userId: user.uid,
						subscription: subscription
					});

					console.log('Push notification subscription sent to server');
				} catch (error) {
					console.error('Error during push notification setup:', error);
				}
			}
		}

		setupPushNotifications();
	}, [user]);
}

export default usePushNotifications;