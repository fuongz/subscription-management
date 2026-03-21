/**
 * Security headers middleware for Cloudflare Workers
 *
 * Adds standard security headers to all responses
 */

export function addSecurityHeaders(response: Response): Response {
	// Clone the response to make it mutable
	const newResponse = new Response(response.body, response);

	// Prevent clickjacking attacks
	newResponse.headers.set("X-Frame-Options", "DENY");

	// Prevent MIME type sniffing
	newResponse.headers.set("X-Content-Type-Options", "nosniff");

	// Control referrer information
	newResponse.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

	// Prevent browsers from performing XSS filtering
	// (modern browsers have removed this, but legacy browsers still use it)
	newResponse.headers.set("X-XSS-Protection", "0");

	// Permissions Policy (formerly Feature Policy)
	// Disable potentially dangerous features
	newResponse.headers.set(
		"Permissions-Policy",
		[
			"geolocation=()",
			"camera=()",
			"microphone=()",
			"payment=()",
			"usb=()",
			"magnetometer=()",
			"gyroscope=()",
			"accelerometer=()",
		].join(", "),
	);

	// Strict Transport Security (HSTS)
	// Only set in production (Cloudflare handles HTTPS)
	// 1 year = 31536000 seconds
	if (response.url.startsWith("https://")) {
		newResponse.headers.set(
			"Strict-Transport-Security",
			"max-age=31536000; includeSubDomains; preload",
		);
	}

	return newResponse;
}
