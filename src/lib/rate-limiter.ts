/**
 * Simple in-memory rate limiter for Cloudflare Workers
 *
 * For production, consider using:
 * - Cloudflare Rate Limiting API
 * - Cloudflare KV for distributed rate limiting
 * - Durable Objects for more complex rate limiting
 */

interface RateLimitConfig {
	/** Maximum requests allowed in the window */
	limit: number;
	/** Time window in milliseconds */
	windowMs: number;
}

interface RateLimitEntry {
	count: number;
	resetAt: number;
}

// In-memory store (resets on worker restart - acceptable for basic protection)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Lazily clean up expired entries on each check
function cleanExpiredEntries(now: number) {
	for (const [key, entry] of rateLimitStore.entries()) {
		if (entry.resetAt < now) {
			rateLimitStore.delete(key);
		}
	}
}

export interface RateLimitResult {
	allowed: boolean;
	remaining: number;
	resetAt: number;
}

/**
 * Check if a request should be rate limited
 *
 * @param identifier - Unique identifier (IP, userId, etc.)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
	identifier: string,
	config: RateLimitConfig,
): RateLimitResult {
	const now = Date.now();
	cleanExpiredEntries(now);
	const entry = rateLimitStore.get(identifier);

	// No entry or window expired - create new entry
	if (!entry || entry.resetAt < now) {
		const resetAt = now + config.windowMs;
		rateLimitStore.set(identifier, { count: 1, resetAt });
		return {
			allowed: true,
			remaining: config.limit - 1,
			resetAt,
		};
	}

	// Increment count
	entry.count++;

	// Check if limit exceeded
	if (entry.count > config.limit) {
		return {
			allowed: false,
			remaining: 0,
			resetAt: entry.resetAt,
		};
	}

	return {
		allowed: true,
		remaining: config.limit - entry.count,
		resetAt: entry.resetAt,
	};
}

/**
 * Get client IP from request headers (Cloudflare Workers)
 */
export function getClientIp(request: Request): string {
	// Cloudflare adds CF-Connecting-IP header
	const cfIp = request.headers.get("CF-Connecting-IP");
	if (cfIp) return cfIp;

	// Fallback to X-Forwarded-For
	const forwardedFor = request.headers.get("X-Forwarded-For");
	if (forwardedFor) {
		return forwardedFor.split(",")[0].trim();
	}

	// Last resort
	return "unknown";
}

/**
 * Rate limit presets
 */
export const RATE_LIMITS = {
	/** Auth endpoints - 5 requests per 15 minutes */
	AUTH: { limit: 5, windowMs: 15 * 60 * 1000 },
	/** API endpoints - 60 requests per minute */
	API: { limit: 60, windowMs: 60 * 1000 },
	/** Strict endpoints - 3 requests per 5 minutes */
	STRICT: { limit: 3, windowMs: 5 * 60 * 1000 },
} as const;
