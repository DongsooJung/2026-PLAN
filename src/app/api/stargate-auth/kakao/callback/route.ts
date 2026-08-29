import { NextRequest, NextResponse } from "next/server";

const APP_ORIGIN = "https://2026-plan-git-main-stargate2.vercel.app";
const SITE_ORIGIN = "https://www.stargateedu.co.kr";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const savedState = request.cookies.get("stargate_kakao_state")?.value;
  if (!code || !state || !savedState || state !== savedState) {
    return NextResponse.redirect(`${SITE_ORIGIN}/auth/?error=invalid_state`);
  }

  const clientId = process.env.KAKAO_REST_API_KEY;
  const clientSecret = process.env.KAKAO_CLIENT_SECRET || "";
  if (!clientId) return NextResponse.redirect(`${SITE_ORIGIN}/auth/?error=kakao_not_configured`);

  const redirectUri = `${APP_ORIGIN}/api/stargate-auth/kakao/callback`;
  const tokenBody = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    redirect_uri: redirectUri,
    code,
  });
  if (clientSecret) tokenBody.set("client_secret", clientSecret);

  const tokenResponse = await fetch("https://kauth.kakao.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
    body: tokenBody,
    cache: "no-store",
  });
  if (!tokenResponse.ok) return NextResponse.redirect(`${SITE_ORIGIN}/auth/?error=kakao_token_failed`);
  const token = await tokenResponse.json();

  const userResponse = await fetch("https://kapi.kakao.com/v2/user/me", {
    headers: { Authorization: `Bearer ${token.access_token}` },
    cache: "no-store",
  });
  if (!userResponse.ok) return NextResponse.redirect(`${SITE_ORIGIN}/auth/?error=kakao_profile_failed`);
  const profile = await userResponse.json();
  const nickname = profile?.properties?.nickname || profile?.kakao_account?.profile?.nickname || "카카오 회원";
  const providerId = String(profile?.id || "");

  const response = NextResponse.redirect(`${SITE_ORIGIN}/auth/?login=success&provider=kakao&name=${encodeURIComponent(nickname)}`);
  response.cookies.delete("stargate_kakao_state");
  response.cookies.set("stargate_auth", JSON.stringify({ provider: "kakao", id: providerId, name: nickname }), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return response;
}
