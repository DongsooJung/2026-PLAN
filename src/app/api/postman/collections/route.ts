import { NextResponse } from "next/server";
import { postmanFetch } from "@/lib/postman/client";
import type { PostmanCollection } from "@/lib/postman/types";

export async function GET() {
  try {
    const data = await postmanFetch<{ collections: PostmanCollection[] }>(
      "/collections"
    );
    return NextResponse.json({ data: data.collections, error: null });
  } catch (error) {
    return NextResponse.json(
      { data: null, error: (error as Error).message },
      { status: 500 }
    );
  }
}
