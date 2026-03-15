const POSTMAN_API_BASE = "https://api.getpostman.com";

export function getPostmanApiKey(): string {
  const key = process.env.POSTMAN_API_KEY;
  if (!key) {
    throw new Error("POSTMAN_API_KEY 환경변수가 설정되지 않았습니다.");
  }
  return key;
}

export async function postmanFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const apiKey = getPostmanApiKey();

  const res = await fetch(`${POSTMAN_API_BASE}${path}`, {
    ...options,
    headers: {
      "X-Api-Key": apiKey,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(
      `Postman API 오류 (${res.status}): ${errorBody}`
    );
  }

  return res.json();
}
