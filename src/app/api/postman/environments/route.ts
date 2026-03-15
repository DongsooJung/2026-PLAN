import { NextResponse } from "next/server";
import { postmanFetch } from "@/lib/postman/client";
import type { PostmanEnvironment } from "@/lib/postman/types";

export async function GET() {
  try {
    const data = await postmanFetch<{ environments: PostmanEnvironment[] }>(
      "/environments"
    );
    return NextResponse.json({ data: data.environments, error: null });
  } catch (error) {
    return NextResponse.json(
      { data: null, error: (error as Error).message },
      { status: 500 }
    );
  }
}
