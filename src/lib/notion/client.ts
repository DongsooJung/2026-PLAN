import { Client } from "@notionhq/client";

// In SDK v5, querying uses data_source_id (collection ID), not database_id
const NOTION_DATA_SOURCE_ID = process.env.NOTION_DATA_SOURCE_ID!;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID!;

let notionClient: Client | null = null;

export function getNotionClient(): Client | null {
  if (!process.env.NOTION_API_KEY) {
    return null;
  }
  if (!notionClient) {
    notionClient = new Client({ auth: process.env.NOTION_API_KEY });
  }
  return notionClient;
}

export function getNotionDataSourceId(): string {
  return NOTION_DATA_SOURCE_ID;
}

export function getNotionDatabaseId(): string {
  return NOTION_DATABASE_ID;
}

export function isNotionEnabled(): boolean {
  return !!(process.env.NOTION_API_KEY && process.env.NOTION_DATA_SOURCE_ID && process.env.NOTION_DATABASE_ID);
}
