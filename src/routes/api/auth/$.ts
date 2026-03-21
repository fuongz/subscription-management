import { env } from "cloudflare:workers";
import { createFileRoute } from "@tanstack/react-router";
import { getAuth } from "@/lib/auth";
import { RATE_LIMITS, checkRateLimit, getClientIp } from "@/lib/rate-limiter";
import { verifyTurnstile } from "@/server/turnstile";

async function verifyTurnstileMiddleware(
	request: Request,
): Promise<Response | null> {
	const url = new URL(request.url);
	const pathname = url.pathname;

	// Only verify Turnstile for sign-in and sign-up endpoints
	const requiresTurnstile =
		pathname.includes("/sign-in/email") || pathname.includes("/sign-up/email");

	if (requiresTurnstile && request.method === "POST") {
		const turnstileToken = request.headers.get("x-turnstile-token");

		if (!turnstileToken) {
			return new Response(
				JSON.stringify({
					error: { message: "Security verification required" },
				}),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		const isValid = await verifyTurnstile(turnstileToken);

		if (!isValid) {
			return new Response(
				JSON.stringify({
					error: { message: "Security verification failed. Please try again." },
				}),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}
	}

	return null;
}

async function rateLimitMiddleware(request: Request): Promise<Response | null> {
	const url = new URL(request.url);
	const pathname = url.pathname;

	// Apply rate limiting to auth endpoints
	if (
		pathname.includes("/sign-in") ||
		pathname.includes("/sign-up") ||
		pathname.includes("/magic-link")
	) {
		const clientIp = getClientIp(request);
		const result = checkRateLimit(`auth:${clientIp}`, RATE_LIMITS.AUTH);

		if (!result.allowed) {
			const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
			return new Response(
				JSON.stringify({
					error: {
						message: "Too many requests. Please try again later.",
					},
				}),
				{
					status: 429,
					headers: {
						"Content-Type": "application/json",
						"Retry-After": retryAfter.toString(),
						"X-RateLimit-Limit": RATE_LIMITS.AUTH.limit.toString(),
						"X-RateLimit-Remaining": "0",
						"X-RateLimit-Reset": Math.floor(result.resetAt / 1000).toString(),
					},
				},
			);
		}
	}

	return null;
}

export const Route = createFileRoute("/api/auth/$")({
	server: {
		handlers: {
			GET: async ({ request }: { request: Request }) => {
				const auth = getAuth((env as { DB: D1Database }).DB);
				return auth.handler(request);
			},
			POST: async ({ request }: { request: Request }) => {
				// Apply rate limiting
				const rateLimitError = await rateLimitMiddleware(request);
				if (rateLimitError) return rateLimitError;

				// Verify Turnstile for sign-in/sign-up
				const turnstileError = await verifyTurnstileMiddleware(request);
				if (turnstileError) return turnstileError;

				const auth = getAuth((env as { DB: D1Database }).DB);
				return auth.handler(request);
			},
		},
	},
});
