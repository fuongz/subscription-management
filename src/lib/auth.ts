import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import * as schema from "@/db/schema";
import { getDb } from "@/server/db";

let authInstance: ReturnType<typeof betterAuth> | null = null;

function getTrustedOrigins(): string[] {
	const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3002";
	const origins = [baseURL];

	// Add additional trusted origins from env (comma-separated)
	const extra = process.env.BETTER_AUTH_TRUSTED_ORIGINS;
	if (extra) {
		origins.push(...extra.split(",").map((o) => o.trim()).filter(Boolean));
	}

	return origins;
}

export function getAuth(d1: D1Database) {
	if (authInstance) return authInstance;

	const db = getDb(d1);

	authInstance = betterAuth({
		baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3002",
		trustedOrigins: getTrustedOrigins(),
		database: drizzleAdapter(db, {
			provider: "sqlite",
			schema: {
				...schema,
			},
		}),
		emailAndPassword: {
			enabled: true,
		},
		socialProviders: {
			google: {
				clientId: process.env.BETTER_AUTH_GOOGLE_CLIENT_ID as string,
				clientSecret: process.env.BETTER_AUTH_GOOGLE_CLIENT_SECRET as string,
			},
		},
		plugins: [tanstackStartCookies()],
	});

	return authInstance;
}
