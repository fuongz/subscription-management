interface TurnstileResponse {
	success: boolean;
	"error-codes"?: string[];
	challenge_ts?: string;
	hostname?: string;
}

export async function verifyTurnstile(
	token: string,
	remoteIp?: string,
): Promise<boolean> {
	if (!token) {
		return false;
	}

	const secretKey = process.env.TURNSTILE_SECRET_KEY;
	if (!secretKey || secretKey === "YOUR_TURNSTILE_SECRET_KEY_HERE") {
		console.warn(
			"⚠️ SECURITY WARNING: Turnstile verification bypassed - TURNSTILE_SECRET_KEY not configured. " +
			"This should ONLY happen in development. Configure TURNSTILE_SECRET_KEY for production!"
		);
		return true; // Skip verification in development if not configured
	}

	try {
		const response = await fetch(
			"https://challenges.cloudflare.com/turnstile/v0/siteverify",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					secret: secretKey,
					response: token,
					remoteip: remoteIp,
				}),
			},
		);

		if (!response.ok) {
			return false;
		}

		const data = (await response.json()) as TurnstileResponse;

		if (!data.success) {
			return false;
		}

		return true;
	} catch {
		return false;
	}
}
