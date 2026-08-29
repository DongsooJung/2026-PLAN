import { NextResponse } from "next/server";

const APP_ORIGIN = "https://2026-plan-git-main-stargate2.vercel.app";
const SITE_ORIGIN = "https://www.stargateedu.co.kr";

export async function GET() {
  const clientId = process.env.NAVER_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(`${SITE_ORIGIN}/auth/?error=naver_not_configured`);
  }

  const redirectUri = `${APP_ORIGIN}/api/stargate-auth/naver/callback`;
  const state = crypto.randomUUID();
  const authorize = new URL("https://nid.naver.com/oauth2.0/authorize");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("redirect_uri", redirectUri);
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("state", state);

  const response = NextResponse.redirect(authorize);
  response.cookies.set("stargate_naver_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
