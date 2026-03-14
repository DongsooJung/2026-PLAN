import { Client } from "@notionhq/client";

let notionClient: Client | null = null;

function getEnabledClient(): Client | null {
  if (!isNotionEnabled()) return null;
  if (!notionClient) {
    notionClient = new Client({ auth: process.env.NOTION_API_KEY! });
  }
  return notionClient;
}

export function getNotionClient(): Client | null {
  return getEnabledClient();
}

export function getNotionDataSourceId(): string {
  return process.env.NOTION_DATA_SOURCE_ID!;
}

export function getNotionDatabaseId(): string {
  return process.env.NOTION_DATABASE_ID!;
}

export function isNotionEnabled(): boolean {
  return !!(process.env.NOTION_API_KEY && process.env.NOTION_DATA_SOURCE_ID && process.env.NOTION_DATABASE_ID);
}
