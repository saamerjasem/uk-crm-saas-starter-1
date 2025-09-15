import { NextRequest, NextResponse } from "next/server";
const SESSION_COOKIE = "ukcrm_session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // allow public paths
  if (pathname === "/" || pathname.startsWith("/api") || pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  // protect the app area
  if (pathname.startsWith("/app")) {
    const has = req.cookies.get(SESSION_COOKIE)?.value === "ok";
    if (!has) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}
