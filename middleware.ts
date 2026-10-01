import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function unauthorized() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="2026 Subscription Dashboard", charset="UTF-8"',
      "Cache-Control": "no-store",
    },
  });
}

function safeEqual(actual: string, expected: string): boolean {
  const length = Math.max(actual.length, expected.length);
  let mismatch = actual.length ^ expected.length;
  for (let index = 0; index < length; index += 1) {
    mismatch |= (actual.charCodeAt(index) || 0) ^ (expected.charCodeAt(index) || 0);
  }
  return mismatch === 0;
}

function hasValidBasicAuth(request: NextRequest, scope: "dashboard" | "commander" = "dashboard"): boolean {
  const expectedUser =
    scope === "commander"
      ? process.env.COMMANDER_BASIC_USER || process.env.DASHBOARD_BASIC_USER
      : process.env.DASHBOARD_BASIC_USER;
  const expectedPassword =
    scope === "commander"
      ? process.env.COMMANDER_BASIC_PASSWORD || process.env.DASHBOARD_BASIC_PASSWORD
      : process.env.DASHBOARD_BASIC_PASSWORD;
  if (!expectedUser || !expectedPassword) return false;

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Basic ")) return false;

  try {
    const decoded = new TextDecoder().decode(
      Uint8Array.from(atob(authorization.slice(6)), (character) =>
        character.charCodeAt(0)
      )
    );
    const separator = decoded.indexOf(":");
    if (separator < 0) return false;

    return (
      safeEqual(decoded.slice(0, separator), expectedUser) &&
      safeEqual(decoded.slice(separator + 1), expectedPassword)
    );
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const isCommander = request.nextUrl.pathname.startsWith("/commander");

  // CEO situation room: always protected server-side, independent of app auth mode.
  // Dedicated COMMANDER_* credentials may be used; otherwise the existing dashboard
  // credentials are reused. Missing credentials fail closed with HTTP 401.
  if (isCommander) {
    if (!hasValidBasicAuth(request, "commander")) return unauthorized();
    return NextResponse.next({ request });
  }

  if (process.env.SUBSCRIPTIONS_JSON !== undefined) {
    if (!hasValidBasicAuth(request)) return unauthorized();

    if (request.nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next({ request });
  }

  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    if (request.nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtected =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/converter");

  if (!user && isProtected) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (user && request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/converter", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/converter/:path*", "/commander/:path*"],
};
