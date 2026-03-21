#!/usr/bin/env bun

/**
 * Converts web-push VAPID keys to base64url-encoded JWK format
 * Usage: bun run scripts/generate-vapid-jwk.ts
 */

// New keys from web-push generate-vapid-keys --json
const publicKey = "BO8tn5XjbYNGAyeFnIqn7D2pHft7wdRjeLRW9rovK7if1jfLxQp2f-2B2De3bcKkDH2P41CD44O2psDCTv79arU";
const privateKey = "p_MlNMwT_nj4fmrL1WVI96eSg8Qwpv7xWzd29e-yEw8";

// Helper to convert base64 to base64url
function base64ToBase64Url(base64: string): string {
	return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Helper to convert buffer to base64url
function bufferToBase64Url(buffer: Uint8Array): string {
	const base64 = btoa(String.fromCharCode(...buffer));
	return base64ToBase64Url(base64);
}

// Decode the public key (uncompressed EC point format)
const publicKeyBuffer = Uint8Array.from(atob(publicKey.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));

// The first byte (0x04) indicates uncompressed format
// Next 32 bytes are X coordinate
// Last 32 bytes are Y coordinate
const x = publicKeyBuffer.slice(1, 33);
const y = publicKeyBuffer.slice(33, 65);

// Decode the private key
const privateKeyBuffer = Uint8Array.from(atob(privateKey.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));

// Create JWK objects
const publicJwk = {
	crv: "P-256",
	ext: true,
	key_ops: ["verify"],
	kty: "EC",
	x: bufferToBase64Url(x),
	y: bufferToBase64Url(y),
};

const privateJwk = {
	crv: "P-256",
	d: bufferToBase64Url(privateKeyBuffer),
	ext: true,
	key_ops: ["sign"],
	kty: "EC",
	x: bufferToBase64Url(x),
	y: bufferToBase64Url(y),
};

// Output as base64url-encoded JSON
const publicJwkString = btoa(JSON.stringify(publicJwk)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
const privateJwkString = btoa(JSON.stringify(privateJwk)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

console.log('\n🔑 NEW VAPID KEYS (Base64url-encoded JWK format)\n');
console.log('Add these to your .env and .dev.vars files:\n');
console.log('# Public key (safe for .env - used in browser)');
console.log(`VITE_VAPID_PUBLIC_KEY=${publicJwkString}\n`);
console.log('# Private key (SECRET - only in .dev.vars and wrangler secrets!)');
console.log(`VAPID_PRIVATE_KEY=${privateJwkString}\n`);
