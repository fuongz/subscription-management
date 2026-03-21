import { env } from "cloudflare:workers";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { checkRenewals } from "@/cron/check-renewals";
import { getAuth } from "@/lib/auth";

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

/**
 * Manually trigger the renewal check cron job
 *
 * SECURITY: Only admin users can trigger this endpoint
 * Admin emails are defined in ADMIN_EMAILS environment variable (comma-separated)
 *
 * For production: Remove this endpoint or use Cloudflare's cron trigger UI
 */
export const triggerRenewalCheck = createServerFn({ method: "POST" }).handler(
	async () => {
		const request = getRequest();
		if (!request) throw new Error("No request context");

		// Authenticate user
		const user = await getAuthenticatedUser(request);

		// Check if user is admin
		const adminEmails = (process.env.ADMIN_EMAILS || "")
			.split(",")
			.map((e) => e.trim())
			.filter(Boolean);

		if (adminEmails.length === 0) {
			throw new Error(
				"Manual cron trigger is disabled (ADMIN_EMAILS not configured)",
			);
		}

		if (!user.email || !adminEmails.includes(user.email)) {
			throw new Error("Unauthorized: Admin access required");
		}

		// Trigger the cron job manually
		await checkRenewals(env as CloudflareEnv);

		return { success: true, message: "Renewal check triggered" };
	},
);
