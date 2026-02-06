import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
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
		origins.push(
			...extra
				.split(",")
				.map((o) => o.trim())
				.filter(Boolean),
		);
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
			enabled: false,
		},
		socialProviders: {
			google: {
				clientId: process.env.BETTER_AUTH_GOOGLE_CLIENT_ID as string,
				clientSecret: process.env.BETTER_AUTH_GOOGLE_CLIENT_SECRET as string,
			},
		},
		plugins: [
			tanstackStartCookies(),
			magicLink({
				sendMagicLink: async ({ email, url }) => {
					const unosendApiKey = process.env.UNOSEND_API_KEY;

					// If no API key, skip email sending
					if (!unosendApiKey || unosendApiKey.trim() === "") {
						return;
					}

					// Send via Unosend (non-blocking)
					try {
						const response = await fetch(
							"https://www.unosend.co/api/v1/emails",
							{
								method: "POST",
								headers: {
									Authorization: `Bearer ${unosendApiKey}`,
									"Content-Type": "application/json",
								},
								body: JSON.stringify({
									to: email,
									from:
										process.env.UNOSEND_FROM_EMAIL || "noreply@yourdomain.com",
									subject: "Sign in to PhakeSub",
									html: `
									<!DOCTYPE html>
									<html>
										<head>
											<meta charset="utf-8">
											<style>
												body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
												.container { max-width: 600px; margin: 0 auto; padding: 20px; }
												.button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; }
											</style>
										</head>
										<body>
											<div class="container">
												<h2>Sign in to PhakeSub</h2>
												<p>Click the button below to sign in to your account:</p>
												<p><a href="${url}" class="button">Sign In</a></p>
												<p>Or copy and paste this link into your browser:</p>
												<p style="color: #666; word-break: break-all;">${url}</p>
												<p style="color: #999; font-size: 12px; margin-top: 40px;">
													This link will expire in 15 minutes. If you didn't request this email, you can safely ignore it.
												</p>
											</div>
										</body>
									</html>
								`,
								}),
							},
						);

						// Silently fail - errors handled internally
						if (!response.ok) {
							// Error logged internally by email service
						}
					} catch {
						// Silently fail - errors handled internally
					}
				},
			}),
		],
	});

	return authInstance;
}
