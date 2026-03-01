/**
 * CLI Token utilities for Markhub.
 *
 * Uses JWT signed with AUTH_SECRET to authenticate CLI requests.
 * Tokens are long-lived (30 days) since they're stored locally.
 */

import { SignJWT, jwtVerify } from 'jose';

const TOKEN_EXPIRY = '30d';
const TOKEN_ISSUER = 'markhub';
const TOKEN_AUDIENCE = 'markhub-cli';

/**
 * Get the signing secret as a Uint8Array.
 */
function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('AUTH_SECRET is not configured');
  }
  return new TextEncoder().encode(secret);
}

/**
 * Sign a CLI token for a user.
 *
 * @param userId - The user's ID in our database
 * @returns JWT token string
 */
export async function signCliToken(userId: string): Promise<string> {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(TOKEN_ISSUER)
    .setAudience(TOKEN_AUDIENCE)
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(getSecret());

  return token;
}

/**
 * Verify a CLI token and extract the user ID.
 *
 * @param token - JWT token string
 * @returns User ID if valid, null if invalid
 */
export async function verifyCliToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
    });

    return payload.sub ?? null;
  } catch {
    return null;
  }
}

/**
 * Extract the bearer token from an Authorization header.
 *
 * @param authHeader - The Authorization header value
 * @returns Token string or null
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}
