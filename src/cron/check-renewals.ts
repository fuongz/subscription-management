import { eq } from "drizzle-orm";
import { pushSubscription, subscription, userPreference } from "@/db/schema";
import { getDb } from "@/server/db";
import { PushSubscriptionExpiredError, sendWebPush } from "./send-web-push";

export async function checkRenewals(env: CloudflareEnv) {
	const db = getDb(env.DB);
	console.log("[Cron] Starting renewal check at", new Date().toISOString());

	try {
		const activeSubscriptions = await db
			.select()
			.from(subscription)
			.where(eq(subscription.status, "active"));

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const notifications: Array<{
			userId: string;
			subscriptionName: string;
			daysUntil: number;
			price: number;
			currency: string;
			subscriptionId: string;
		}> = [];

		for (const sub of activeSubscriptions) {
			if (!sub.nextBillingDate) continue;

			const billingDate = new Date(`${sub.nextBillingDate}T00:00:00`);
			const daysUntil = Math.ceil(
				(billingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
			);

			if (daysUntil < 0) continue;

			const prefs = await db
				.select()
				.from(userPreference)
				.where(eq(userPreference.userId, sub.userId))
				.limit(1);

			if (prefs.length === 0 || !prefs[0].enablePushNotifications) continue;

			const notifyDays: number[] = JSON.parse(
				prefs[0].notifyDaysBefore || "[1,3,7]",
			);

			if (notifyDays.includes(daysUntil)) {
				notifications.push({
					userId: sub.userId,
					subscriptionName: sub.name,
					daysUntil,
					price: sub.price,
					currency: sub.currency,
					subscriptionId: sub.id,
				});
			}
		}

		console.log(`[Cron] Sending ${notifications.length} notifications`);

		for (const notif of notifications) {
			const pushSubs = await db
				.select()
				.from(pushSubscription)
				.where(eq(pushSubscription.userId, notif.userId));

			if (pushSubs.length === 0) continue;

			const title = "Subscription Renewal Reminder";
			const daysText =
				notif.daysUntil === 0
					? "today"
					: notif.daysUntil === 1
						? "tomorrow"
						: `${notif.daysUntil} days`;
			const body = `${notif.subscriptionName} renews in ${daysText} - ${notif.currency} ${notif.price.toFixed(2)}`;

			for (const pushSub of pushSubs) {
				try {
					await sendWebPush(
						{
							endpoint: pushSub.endpoint,
							keys: { p256dh: pushSub.p256dhKey, auth: pushSub.authKey },
						},
						{
							title,
							body,
							icon: "/android-chrome-192x192.png",
							url: "/dashboard",
							tag: `renewal-${notif.subscriptionId}`,
						},
						env.VAPID_PRIVATE_KEY,
						env.VITE_VAPID_PUBLIC_KEY,
					);

					await db
						.update(pushSubscription)
						.set({ lastUsed: new Date() })
						.where(eq(pushSubscription.id, pushSub.id));

					console.log(`[Cron] Sent to ${pushSub.endpoint}`);
				} catch (error: any) {
					if (error instanceof PushSubscriptionExpiredError) {
						// Expected: subscription expired or unsubscribed
						await db
							.delete(pushSubscription)
							.where(eq(pushSubscription.id, pushSub.id));
						console.log(`[Cron] Removed expired subscription`);
					} else {
						// Unexpected error
						console.error(`[Cron] Failed to send push:`, error);
					}
				}
			}
		}

		console.log("[Cron] Renewal check completed");
	} catch (error) {
		console.error("[Cron] Renewal check failed:", error);
		throw error;
	}
}
