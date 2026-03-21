import { getServiceWorkerRegistration } from "./service-worker";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || "";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
	const rawData = atob(base64);
	const outputArray = new Uint8Array(rawData.length);
	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

async function convertJWKToRaw(jwkBase64: string): Promise<Uint8Array> {
	try {
		// Decode the base64url-encoded JWK
		const padding = "=".repeat((4 - (jwkBase64.length % 4)) % 4);
		const base64 = (jwkBase64 + padding).replace(/-/g, "+").replace(/_/g, "/");
		const jwkString = atob(base64);
		const jwk = JSON.parse(jwkString);

		// Import the JWK as a CryptoKey
		const cryptoKey = await crypto.subtle.importKey(
			"jwk",
			jwk,
			{ name: "ECDSA", namedCurve: "P-256" },
			true,
			["verify"],
		);

		// Export as raw format (uncompressed EC point)
		const rawKey = await crypto.subtle.exportKey("raw", cryptoKey);
		return new Uint8Array(rawKey);
	} catch (error) {
		console.error("Failed to convert JWK to raw format:", error);
		// Fallback to treating it as a raw key
		return urlBase64ToUint8Array(jwkBase64);
	}
}

export async function checkNotificationPermission(): Promise<NotificationPermission> {
	if (!("Notification" in window))
		throw new Error("Notifications not supported");
	return Notification.permission;
}

export async function requestNotificationPermission(): Promise<boolean> {
	const permission = await Notification.requestPermission();
	return permission === "granted";
}

export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
	try {
		const registration = await getServiceWorkerRegistration();
		if (!registration) throw new Error("Service Worker not registered");

		let subscription = await registration.pushManager.getSubscription();
		if (subscription) return subscription;

		const applicationServerKey = await convertJWKToRaw(VAPID_PUBLIC_KEY);
		subscription = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: applicationServerKey as BufferSource,
		});

		return subscription;
	} catch (error) {
		console.error("Failed to subscribe to push notifications:", error);
		return null;
	}
}

export async function unsubscribeFromPushNotifications(): Promise<boolean> {
	try {
		const registration = await getServiceWorkerRegistration();
		if (!registration) return false;

		const subscription = await registration.pushManager.getSubscription();
		if (subscription) {
			await subscription.unsubscribe();
			return true;
		}
		return false;
	} catch (error) {
		console.error("Failed to unsubscribe:", error);
		return false;
	}
}

export function serializePushSubscription(subscription: PushSubscription) {
	const key = subscription.getKey("p256dh");
	const auth = subscription.getKey("auth");

	return {
		endpoint: subscription.endpoint,
		p256dhKey: key ? btoa(String.fromCharCode(...new Uint8Array(key))) : "",
		authKey: auth ? btoa(String.fromCharCode(...new Uint8Array(auth))) : "",
	};
}
