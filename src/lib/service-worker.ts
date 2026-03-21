export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
	if (!("serviceWorker" in navigator)) {
		console.warn("Service Workers not supported");
		return null;
	}

	try {
		const registration = await navigator.serviceWorker.register("/sw.js", {
			scope: "/",
		});
		await navigator.serviceWorker.ready;
		return registration;
	} catch (error) {
		console.error("Service Worker registration failed:", error);
		return null;
	}
}

export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
	if (!("serviceWorker" in navigator)) return null;
	return await navigator.serviceWorker.ready;
}
