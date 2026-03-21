async function generateVAPIDKeys() {
  const keyPair = await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify']
  );

  const publicKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
  const privateKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey);

  const publicKeyBase64 = btoa(JSON.stringify(publicKeyJwk))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  const privateKeyBase64 = btoa(JSON.stringify(privateKeyJwk))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  console.log('VAPID Public Key (add to .env):');
  console.log(`VITE_VAPID_PUBLIC_KEY=${publicKeyBase64}`);
  console.log('\nVAPID Private Key (run: wrangler secret put VAPID_PRIVATE_KEY):');
  console.log(privateKeyBase64);
}

generateVAPIDKeys();
