import { NextRequest, NextResponse } from "next/server";

const APP_ORIGIN = "https://2026-plan-git-main-stargate2.vercel.app";
const SITE_ORIGIN = "https://www.stargateedu.co.kr";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const savedState = request.cookies.get("stargate_naver_state")?.value;
  if (!code || !state || !savedState || state !== savedState) {
    return NextResponse.redirect(`${SITE_ORIGIN}/auth/?error=invalid_state`);
  }

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  if (!clientId || !clientSecret) return NextResponse.redirect(`${SITE_ORIGIN}/auth/?error=naver_not_configured`);

  const tokenUrl = new URL("https://nid.naver.com/oauth2.0/token");
  tokenUrl.searchParams.set("grant_type", "authorization_code");
  tokenUrl.searchParams.set("client_id", clientId);
  tokenUrl.searchParams.set("client_secret", clientSecret);
  tokenUrl.searchParams.set("code", code);
  tokenUrl.searchParams.set("state", state);

  const tokenResponse = await fetch(tokenUrl, { cache: "no-store" });
  if (!tokenResponse.ok) return NextResponse.redirect(`${SITE_ORIGIN}/auth/?error=naver_token_failed`);
  const token = await tokenResponse.json();

  const userResponse = await fetch("https://openapi.naver.com/v1/nid/me", {
    headers: { Authorization: `Bearer ${token.access_token}` },
    cache: "no-store",
  });
  if (!userResponse.ok) return NextResponse.redirect(`${SITE_ORIGIN}/auth/?error=naver_profile_failed`);
  const payload = await userResponse.json();
  const profile = payload?.response || {};
  const nickname = profile.name || profile.nickname || "네이버 회원";
  const providerId = String(profile.id || "");

  const response = NextResponse.redirect(`${SITE_ORIGIN}/auth/?login=success&provider=naver&name=${encodeURIComponent(nickname)}`);
  response.cookies.delete("stargate_naver_state");
  response.cookies.set("stargate_auth", JSON.stringify({ provider: "naver", id: providerId, name: nickname }), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return response;
}
