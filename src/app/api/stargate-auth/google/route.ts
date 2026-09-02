import { NextResponse } from "next/server";

const APP_ORIGIN = "https://2026-plan-git-main-stargate2.vercel.app";
const SITE_ORIGIN = "https://www.stargateedu.co.kr";

export async function GET() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(`${SITE_ORIGIN}/auth/?error=google_not_configured`);
  }

  const redirectUri = `${APP_ORIGIN}/api/stargate-auth/google/callback`;
  const state = crypto.randomUUID();
  const authorize = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("redirect_uri", redirectUri);
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("scope", "openid email profile");
  authorize.searchParams.set("state", state);
  authorize.searchParams.set("access_type", "online");
  authorize.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(authorize);
  response.cookies.set("stargate_google_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
