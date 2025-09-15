// lib/session.ts
// Tiny placeholder auth using a cookie. We will replace with real auth later.

export const SESSION_COOKIE = "ukcrm_session";

/** Client side helper, called from LoginClient */
export function setSessionCookie(days = 7) {
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${SESSION_COOKIE}=1; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
}

/** Optional: sign out */
export function clearSessionCookie() {
  document.cookie = `${SESSION_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
}

/** Server side helper, safe to call in server components or API routes */
export async function hasSessionServer() {
  // next/headers is only available on the server
  const { cookies } = await import("next/headers");
  return !!cookies().get(SESSION_COOKIE);
}
