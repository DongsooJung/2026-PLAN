import { NextRequest, NextResponse } from "next/server";

const APP_ORIGIN = process.env.STARGATE_AUTH_ORIGIN || "https://2026-plan.vercel.app";
const SITE_ORIGIN = "https://www.stargateedu.co.kr";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const savedState = request.cookies.get("stargate_google_state")?.value;
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

  if (!code || !state || !savedState || state !== savedState) {
    return NextResponse.redirect(`${SITE_ORIGIN}/auth/?error=invalid_state`);
  }
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${SITE_ORIGIN}/auth/?error=google_not_configured`);
  }

  const redirectUri = `${APP_ORIGIN}/api/stargate-auth/google/callback`;
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });
  if (!tokenResponse.ok) {
    return NextResponse.redirect(`${SITE_ORIGIN}/auth/?error=google_token_failed`);
  }

  const token = await tokenResponse.json();
  const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${token.access_token}` },
    cache: "no-store",
  });
  if (!profileResponse.ok) {
    return NextResponse.redirect(`${SITE_ORIGIN}/auth/?error=google_profile_failed`);
  }

  const profile = await profileResponse.json();
  const result = new URL(`${SITE_ORIGIN}/auth/`);
  result.searchParams.set("login", "success");
  result.searchParams.set("provider", "google");
  if (profile.name) result.searchParams.set("name", profile.name);

  const response = NextResponse.redirect(result);
  response.cookies.delete("stargate_google_state");
  return response;
}
