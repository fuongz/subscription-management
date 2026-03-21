import { env } from "cloudflare:workers";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import {
	PushSubscriptionExpiredError,
	sendWebPush,
} from "@/cron/send-web-push";
import { pushSubscription, userPreference } from "@/db/schema";
import { getAuth } from "@/lib/auth";
import { getDb } from "./db";

function getD1(): D1Database {
	return (env as { DB: D1Database }).DB;
}

async function getAuthenticatedUser(request: Request) {
	const d1 = getD1();
	const auth = getAuth(d1);
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) throw new Error("Unauthorized");
	return session.user;
}

const subscribePushSchema = z.object({
	endpoint: z.string().url(),
	p256dhKey: z.string().min(1),
	authKey: z.string().min(1),
	userAgent: z.string().optional(),
});

const updateNotificationPreferencesSchema = z.object({
	enablePushNotifications: z.boolean(),
	notifyDaysBefore: z.array(z.number().int().min(1).max(30)),
});

export type SubscribePushInput = z.infer<typeof subscribePushSchema>;
export type UpdateNotificationPreferencesInput = z.infer<
	typeof updateNotificationPreferencesSchema
>;

export const subscribePush = createServerFn({ method: "POST" })
	.inputValidator((input: SubscribePushInput) =>
		subscribePushSchema.parse(input),
	)
	.handler(async ({ data }) => {
		const request = getRequest();
		if (!request) throw new Error("No request context");
		const user = await getAuthenticatedUser(request);
		const db = getDb(getD1());

		const existing = await db
			.select()
			.from(pushSubscription)
			.where(eq(pushSubscription.endpoint, data.endpoint))
			.limit(1);

		if (existing.length > 0) {
			await db
				.update(pushSubscription)
				.set({ lastUsed: new Date() })
				.where(eq(pushSubscription.id, existing[0].id));
			return { id: existing[0].id, existing: true };
		}

		const id = crypto.randomUUID();
		await db.insert(pushSubscription).values({
			id,
			userId: user.id,
			endpoint: data.endpoint,
			p256dhKey: data.p256dhKey,
			authKey: data.authKey,
			userAgent: data.userAgent || null,
			createdAt: new Date(),
			lastUsed: new Date(),
		});

		return { id, existing: false };
	});

export const unsubscribePush = createServerFn({ method: "POST" })
	.inputValidator((input: string) => z.string().url().parse(input))
	.handler(async ({ data: endpoint }) => {
		const request = getRequest();
		if (!request) throw new Error("No request context");
		const user = await getAuthenticatedUser(request);
		const db = getDb(getD1());

		await db
			.delete(pushSubscription)
			.where(
				and(
					eq(pushSubscription.endpoint, endpoint),
					eq(pushSubscription.userId, user.id),
				),
			);

		return { success: true };
	});

export const updateNotificationPreferences = createServerFn({ method: "POST" })
	.inputValidator((input: UpdateNotificationPreferencesInput) => {
		return updateNotificationPreferencesSchema.parse(input);
	})
	.handler(async ({ data }) => {
		const request = getRequest();
		if (!request) throw new Error("No request context");
		const user = await getAuthenticatedUser(request);
		const db = getDb(getD1());

		const notifyDaysBeforeJson = JSON.stringify(data.notifyDaysBefore);

		await db
			.insert(userPreference)
			.values({
				userId: user.id,
				currency: "VND",
				timezone: "Asia/Ho_Chi_Minh",
				enablePushNotifications: data.enablePushNotifications,
				notifyDaysBefore: notifyDaysBeforeJson,
			})
			.onConflictDoUpdate({
				target: userPreference.userId,
				set: {
					enablePushNotifications: data.enablePushNotifications,
					notifyDaysBefore: notifyDaysBeforeJson,
				},
			});

		return { success: true };
	});

export const sendTestNotification = createServerFn({ method: "POST" }).handler(
	async () => {
		const request = getRequest();
		if (!request) throw new Error("No request context");
		const user = await getAuthenticatedUser(request);
		const db = getDb(getD1());

		const subscriptions = await db
			.select()
			.from(pushSubscription)
			.where(eq(pushSubscription.userId, user.id));

		if (subscriptions.length === 0) {
			throw new Error("No push subscriptions found");
		}

		// Access VAPID keys from Cloudflare env bindings
		const vapidPrivateKey = (env as { VAPID_PRIVATE_KEY?: string })
			.VAPID_PRIVATE_KEY;
		const vapidPublicKey = (env as { VITE_VAPID_PUBLIC_KEY?: string })
			.VITE_VAPID_PUBLIC_KEY;

		if (!vapidPrivateKey || !vapidPublicKey) {
			throw new Error("VAPID keys not configured in environment");
		}

		const payload = {
			title: "Test Notification",
			body: "This is a test notification from PhakeSub!",
			icon: "/favicon.ico",
		};

		// Send to first subscription only (simpler test)
		try {
			await sendWebPush(
				{
					endpoint: subscriptions[0].endpoint,
					keys: {
						p256dh: subscriptions[0].p256dhKey,
						auth: subscriptions[0].authKey,
					},
				},
				payload,
				vapidPrivateKey,
				vapidPublicKey,
			);

			return { success: true };
		} catch (error: any) {
			// If subscription expired, delete it and throw a user-friendly error
			if (error instanceof PushSubscriptionExpiredError) {
				await db
					.delete(pushSubscription)
					.where(eq(pushSubscription.id, subscriptions[0].id));

				throw new Error(
					"Push subscription has expired. Please disable and re-enable notifications.",
				);
			}
			throw error;
		}
	},
);
