// Web Push implementation for Cloudflare Workers
// Implements RFC 8291 (Message Encryption) and RFC 8292 (VAPID)

export class PushSubscriptionExpiredError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "PushSubscriptionExpiredError";
	}
}

interface PushSubscription {
	endpoint: string;
	keys: { p256dh: string; auth: string };
}

interface PushPayload {
	title: string;
	body: string;
	icon?: string;
	url?: string;
	tag?: string;
}

function base64UrlToUint8Array(
	base64String: string,
): Uint8Array<ArrayBuffer> {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
	const rawData = atob(base64);
	const outputArray = new Uint8Array(rawData.length);
	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

function uint8ArrayToBase64Url(uint8Array: Uint8Array): string {
	const base64 = btoa(String.fromCharCode(...uint8Array));
	return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

async function decodeJWK(jwkBase64: string): Promise<JsonWebKey> {
	const padding = "=".repeat((4 - (jwkBase64.length % 4)) % 4);
	const base64 = (jwkBase64 + padding).replace(/-/g, "+").replace(/_/g, "/");
	const jwkString = atob(base64);
	return JSON.parse(jwkString);
}

async function generateVAPIDHeaders(
	endpoint: string,
	vapidPrivateKeyBase64: string,
	vapidPublicKeyBase64: string,
): Promise<Record<string, string>> {
	const url = new URL(endpoint);
	const audience = `${url.protocol}//${url.host}`;
	const expiration = Math.floor(Date.now() / 1000) + 12 * 60 * 60; // 12 hours

	// Create JWT header and payload
	const header = { typ: "JWT", alg: "ES256" };
	const jwtPayload = {
		aud: audience,
		exp: expiration,
		sub: "mailto:noreply@example.com",
	};

	const encodedHeader = uint8ArrayToBase64Url(
		new TextEncoder().encode(JSON.stringify(header)),
	);
	const encodedPayload = uint8ArrayToBase64Url(
		new TextEncoder().encode(JSON.stringify(jwtPayload)),
	);
	const unsignedToken = `${encodedHeader}.${encodedPayload}`;

	// Import VAPID private key (JWK format)
	const privateKeyJWK = await decodeJWK(vapidPrivateKeyBase64);
	const privateKey = await crypto.subtle.importKey(
		"jwk",
		privateKeyJWK,
		{ name: "ECDSA", namedCurve: "P-256" },
		false,
		["sign"],
	);

	// Sign the token
	const signature = await crypto.subtle.sign(
		{ name: "ECDSA", hash: { name: "SHA-256" } },
		privateKey,
		new TextEncoder().encode(unsignedToken),
	);

	const encodedSignature = uint8ArrayToBase64Url(new Uint8Array(signature));
	const jwt = `${unsignedToken}.${encodedSignature}`;

	// Convert public key from JWK to raw format for the Authorization header
	const publicKeyJWK = await decodeJWK(vapidPublicKeyBase64);
	const publicKey = await crypto.subtle.importKey(
		"jwk",
		publicKeyJWK,
		{ name: "ECDSA", namedCurve: "P-256" },
		true,
		["verify"],
	);
	const rawPublicKey = await crypto.subtle.exportKey("raw", publicKey);
	const publicKeyBase64Url = uint8ArrayToBase64Url(
		new Uint8Array(rawPublicKey),
	);

	return {
		Authorization: `vapid t=${jwt}, k=${publicKeyBase64Url}`,
	};
}

async function encryptPayload(
	payload: string,
	userPublicKey: string,
	userAuth: string,
): Promise<{
	ciphertext: Uint8Array;
	salt: Uint8Array;
	publicKey: Uint8Array;
}> {
	// Decode subscription keys
	const p256dh = base64UrlToUint8Array(userPublicKey);
	const auth = base64UrlToUint8Array(userAuth);

	// Generate local key pair
	const localKeyPair = await crypto.subtle.generateKey(
		{ name: "ECDH", namedCurve: "P-256" },
		true,
		["deriveBits"],
	);

	// Export local public key in raw format
	const rawLocalPublicKey = await crypto.subtle.exportKey(
		"raw",
		localKeyPair.publicKey,
	);
	const localPublicKeyBytes = new Uint8Array(rawLocalPublicKey);

	// Import user's public key
	const userPublicKeyImported = await crypto.subtle.importKey(
		"raw",
		p256dh,
		{ name: "ECDH", namedCurve: "P-256" },
		false,
		[],
	);

	// Derive shared secret using ECDH
	const sharedSecret = await crypto.subtle.deriveBits(
		{ name: "ECDH", public: userPublicKeyImported },
		localKeyPair.privateKey,
		256,
	);

	// Generate random salt
	const salt = crypto.getRandomValues(new Uint8Array(16));

	// Build the info parameter for HKDF
	const info = new Uint8Array([
		...new TextEncoder().encode("WebPush: info\0"),
		...p256dh,
		...localPublicKeyBytes,
	]);

	// Import shared secret for HKDF
	const sharedSecretKey = await crypto.subtle.importKey(
		"raw",
		sharedSecret,
		{ name: "HKDF" },
		false,
		["deriveBits"],
	);

	// Derive IKM using HKDF with auth
	const ikm = await crypto.subtle.deriveBits(
		{
			name: "HKDF",
			hash: "SHA-256",
			salt: auth,
			info: new TextEncoder().encode("Content-Encoding: auth\0"),
		},
		sharedSecretKey,
		256,
	);

	// Import IKM
	const ikmKey = await crypto.subtle.importKey(
		"raw",
		ikm,
		{ name: "HKDF" },
		false,
		["deriveBits"],
	);

	// Derive CEK (Content Encryption Key)
	const cek = await crypto.subtle.deriveBits(
		{
			name: "HKDF",
			hash: "SHA-256",
			salt: salt,
			info: info,
		},
		ikmKey,
		128,
	);

	// Derive nonce
	const nonceInfo = new Uint8Array([
		...new TextEncoder().encode("Content-Encoding: nonce\0"),
		...p256dh,
		...localPublicKeyBytes,
	]);

	const nonceBuffer = await crypto.subtle.deriveBits(
		{
			name: "HKDF",
			hash: "SHA-256",
			salt: salt,
			info: nonceInfo,
		},
		ikmKey,
		96,
	);
	const nonce = new Uint8Array(nonceBuffer);

	// Import CEK for AES-GCM
	const contentEncryptionKey = await crypto.subtle.importKey(
		"raw",
		cek,
		{ name: "AES-GCM" },
		false,
		["encrypt"],
	);

	// Add padding to payload (padding length + padding + payload + delimiter)
	const payloadBytes = new TextEncoder().encode(payload);
	const paddingLength = 0;
	// Record format: 2 bytes padding length + padding + payload + 1 byte delimiter (0x02)
	const record = new Uint8Array(2 + paddingLength + payloadBytes.length + 1);
	record[0] = (paddingLength >> 8) & 0xff;
	record[1] = paddingLength & 0xff;
	record.set(payloadBytes, 2 + paddingLength);
	record[2 + paddingLength + payloadBytes.length] = 0x02; // Delimiter for last record

	// Encrypt using AES-GCM
	const ciphertext = await crypto.subtle.encrypt(
		{
			name: "AES-GCM",
			iv: nonce,
		},
		contentEncryptionKey,
		record,
	);

	return {
		ciphertext: new Uint8Array(ciphertext),
		salt: salt,
		publicKey: localPublicKeyBytes,
	};
}

export async function sendWebPush(
	subscription: PushSubscription,
	payload: PushPayload,
	vapidPrivateKey: string,
	vapidPublicKey: string,
): Promise<void> {
	const payloadString = JSON.stringify(payload);

	// Encrypt the payload
	const { ciphertext, salt, publicKey } = await encryptPayload(
		payloadString,
		subscription.keys.p256dh,
		subscription.keys.auth,
	);

	// Generate VAPID headers
	const vapidHeaders = await generateVAPIDHeaders(
		subscription.endpoint,
		vapidPrivateKey,
		vapidPublicKey,
	);

	// Build aes128gcm payload: salt (16 bytes) + record_size (4 bytes BE) + ciphertext
	const recordSize = 4096; // Standard record size
	const header = new Uint8Array(20);
	header.set(salt, 0); // 16 bytes salt
	// Record size as 4-byte big-endian
	header[16] = (recordSize >> 24) & 0xff;
	header[17] = (recordSize >> 16) & 0xff;
	header[18] = (recordSize >> 8) & 0xff;
	header[19] = recordSize & 0xff;

	// Combine: header + public key length (1 byte) + public key + ciphertext
	const body = new Uint8Array(20 + 1 + publicKey.length + ciphertext.length);
	body.set(header, 0);
	body[20] = publicKey.length; // Key length
	body.set(publicKey, 21);
	body.set(ciphertext, 21 + publicKey.length);

	// Send the push notification
	const response = await fetch(subscription.endpoint, {
		method: "POST",
		headers: {
			"Content-Type": "application/octet-stream",
			"Content-Encoding": "aes128gcm",
			TTL: "86400", // 24 hours
			...vapidHeaders,
		},
		body: body,
	});

	if (!response.ok) {
		// 410 Gone = subscription expired or unsubscribed (expected)
		if (response.status === 410) {
			throw new PushSubscriptionExpiredError(
				"Push subscription has expired or been unsubscribed",
			);
		}
		// Other errors are unexpected
		const error = await response.text();
		throw Object.assign(new Error(`Push failed: ${response.status} ${error}`), {
			status: response.status,
		});
	}
}
