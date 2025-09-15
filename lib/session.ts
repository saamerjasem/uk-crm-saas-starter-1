export const SESSION_COOKIE = "ukcrm_session";

export function setSessionCookie() {
  const week = 7 * 24 * 60 * 60;
  document.cookie = `${SESSION_COOKIE}=ok; path=/; max-age=${week}; SameSite=Lax`;
}

export function clearSessionCookie() {
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}
