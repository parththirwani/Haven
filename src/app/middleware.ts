import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "sessionId";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const isAuthenticated = Boolean(sessionId);

  // Protect all /web routes — redirect to /login if no session cookie
  if (pathname.startsWith("/web")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // If already authenticated, redirect /login and /signup to /web
  if (isAuthenticated && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/web", request.url));
  }

  // Root / always shows the landing page — never redirect away
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static  (static files)
     * - _next/image   (image optimisation)
     * - favicon.ico
     * - api routes (tRPC handles its own auth)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};