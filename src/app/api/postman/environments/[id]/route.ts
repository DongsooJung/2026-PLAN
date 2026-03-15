import { NextResponse } from "next/server";
import { postmanFetch } from "@/lib/postman/client";
import type { PostmanEnvironmentDetail } from "@/lib/postman/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await postmanFetch<{ environment: PostmanEnvironmentDetail }>(
      `/environments/${id}`
    );
    return NextResponse.json({ data: data.environment, error: null });
  } catch (error) {
    return NextResponse.json(
      { data: null, error: (error as Error).message },
      { status: 500 }
    );
  }
}
