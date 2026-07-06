import webpush from "web-push";

let configured = false;

/**
 * VAPID 키로 web-push를 초기화합니다. 최초 1회만 설정합니다.
 * 키가 없으면 false를 반환하여 호출부에서 안전하게 건너뛸 수 있게 합니다.
 */
export function ensureWebPushConfigured(): boolean {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@example.com";

  if (!publicKey || !privateKey) {
    return false;
  }

  if (!configured) {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    configured = true;
  }

  return true;
}

export interface WebPushTarget {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface WebPushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

/**
 * 단일 구독 대상에 푸시를 전송합니다.
 * 만료(404/410)된 구독은 statusCode를 반환하여 호출부에서 정리할 수 있게 합니다.
 */
export async function sendWebPush(
  target: WebPushTarget,
  payload: WebPushPayload
): Promise<{ ok: boolean; statusCode?: number }> {
  try {
    await webpush.sendNotification(
      {
        endpoint: target.endpoint,
        keys: target.keys,
      },
      JSON.stringify(payload)
    );
    return { ok: true };
  } catch (error) {
    const statusCode =
      typeof error === "object" && error !== null && "statusCode" in error
        ? (error as { statusCode?: number }).statusCode
        : undefined;
    return { ok: false, statusCode };
  }
}

export { webpush };
