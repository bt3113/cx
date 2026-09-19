/**
 * Session tokens.
 *
 * **Demo-tier authentication, built properly.** Zat is a static site with no
 * identity provider behind it, so this signs and verifies sessions in the
 * browser using Web Crypto: a real HMAC-SHA256 over a real payload, with a
 * real expiry, verified on every read.
 *
 * What that gives you: tampering with the stored session invalidates it, and
 * expired sessions are rejected. What it does not give you: security against
 * the person holding the browser, because the signing key ships with the
 * client. That is inherent to a static demo and is stated plainly in the UI
 * rather than hidden. Swapping to a server-issued cookie means replacing this
 * file and nothing else.
 */

const encoder = new TextEncoder();

/**
 * Not a secret. A static bundle cannot hold one, and pretending otherwise
 * would be worse than being explicit about it.
 */
const DEMO_SIGNING_KEY = 'zat-demo-session-v1';

export type SessionPayload = {
  sub: string;
  handle: string;
  name: string;
  email: string;
  /** Epoch seconds. */
  exp: number;
  iat: number;
};

const b64url = {
  encode(bytes: Uint8Array): string {
    let binary = '';
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  },
  /**
   * Backed by a plain ArrayBuffer rather than `ArrayBufferLike`, which is what
   * Web Crypto's `BufferSource` actually requires.
   */
  decode(text: string): Uint8Array<ArrayBuffer> {
    const padded = text.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4));
    const bytes = new Uint8Array(new ArrayBuffer(binary.length));
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  },
};

async function key(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(DEMO_SIGNING_KEY),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export async function signSession(
  payload: Omit<SessionPayload, 'exp' | 'iat'>,
  ttlSeconds = 60 * 60 * 24 * 14,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const full: SessionPayload = { ...payload, iat: now, exp: now + ttlSeconds };
  const body = b64url.encode(encoder.encode(JSON.stringify(full)));
  const signature = await crypto.subtle.sign('HMAC', await key(), encoder.encode(body));
  return `${body}.${b64url.encode(new Uint8Array(signature))}`;
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;

  try {
    const valid = await crypto.subtle.verify(
      'HMAC',
      await key(),
      b64url.decode(signature),
      encoder.encode(body),
    );
    if (!valid) return null;

    const payload = JSON.parse(new TextDecoder().decode(b64url.decode(body))) as SessionPayload;
    if (typeof payload.exp !== 'number' || payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Password hashing for the demo account store.
 *
 * SHA-256 is not a password hash for production — a real deployment uses
 * Argon2id or bcrypt on a server. It is used here only so credentials are not
 * held in plain text in browser storage.
 */
export async function hashPassword(password: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(`zat:${password}`));
  return b64url.encode(new Uint8Array(digest));
}
