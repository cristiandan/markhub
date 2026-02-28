/**
 * Authentication utilities for Markhub.
 * Will integrate with GitHub OAuth via NextAuth.js
 */

export async function getSession() {
  // TODO: Implement with NextAuth.js
  return null;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}
