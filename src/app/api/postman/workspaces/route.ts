import { NextResponse } from "next/server";
import { postmanFetch } from "@/lib/postman/client";
import type { PostmanWorkspace } from "@/lib/postman/types";

export async function GET() {
  try {
    const data = await postmanFetch<{ workspaces: PostmanWorkspace[] }>(
      "/workspaces"
    );
    return NextResponse.json({ data: data.workspaces, error: null });
  } catch (error) {
    return NextResponse.json(
      { data: null, error: (error as Error).message },
      { status: 500 }
    );
  }
}
