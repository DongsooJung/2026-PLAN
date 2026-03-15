import { NextResponse } from "next/server";
import { postmanFetch } from "@/lib/postman/client";
import type { PostmanCollectionDetail } from "@/lib/postman/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await postmanFetch<{ collection: PostmanCollectionDetail }>(
      `/collections/${id}`
    );
    return NextResponse.json({ data: data.collection, error: null });
  } catch (error) {
    return NextResponse.json(
      { data: null, error: (error as Error).message },
      { status: 500 }
    );
  }
}
