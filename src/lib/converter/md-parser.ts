import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import type { Root, Content, List, ListItem, Table, TableRow, TableCell } from "mdast";
import type { GovDocNode, GovDocument, DocumentMetadata } from "./govdoc-types";
import { DEFAULT_METADATA } from "./govdoc-types";
import { detectNumberingLevel } from "./numbering";

function extractText(node: Content | Content[]): string {
  if (Array.isArray(node)) {
    return node.map(extractText).join("");
  }
  if ("value" in node) {
    return node.value;
  }
  if ("children" in node) {
    return (node.children as Content[]).map(extractText).join("");
  }
  return "";
}

function convertList(list: List, depth: number = 1): GovDocNode[] {
  const level = detectNumberingLevel(depth);
  const nodes: GovDocNode[] = [];

  list.children.forEach((item: ListItem, index: number) => {
    const textParts: string[] = [];
    const childLists: List[] = [];

    for (const child of item.children) {
      if (child.type === "list") {
        childLists.push(child);
      } else {
        textParts.push(extractText(child as Content));
      }
    }

    nodes.push({
      type: "numbered",
      content: textParts.join(" ").trim(),
      level,
      index,
    });

    for (const childList of childLists) {
      nodes.push(...convertList(childList, depth + 1));
    }
  });

  return nodes;
}

function convertTable(table: Table): GovDocNode {
  const rows: string[][] = table.children.map((row: TableRow) =>
    row.children.map((cell: TableCell) =>
      extractText(cell as unknown as Content)
    )
  );
  return { type: "table", content: "", rows };
}

function convertNode(node: Content): GovDocNode[] {
  switch (node.type) {
    case "heading": {
      const text = extractText(node as unknown as Content);
      if (node.depth === 1) return [{ type: "title", content: text }];
      if (node.depth === 2) return [{ type: "subtitle1", content: text }];
      return [{ type: "subtitle2", content: text }];
    }
    case "paragraph":
      return [{ type: "body", content: extractText(node as unknown as Content) }];
    case "list":
      return convertList(node as List);
    case "table":
      return [convertTable(node as Table)];
    case "thematicBreak":
      return [{ type: "end-marker", content: "끝." }];
    case "blockquote": {
      const text = (node.children as Content[]).map(extractText).join("\n");
      return [{ type: "metadata-block", content: text }];
    }
    default:
      return [];
  }
}

export function parseMdToGovDoc(
  markdown: string,
  metadata: DocumentMetadata = DEFAULT_METADATA
): GovDocument {
  const tree = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .parse(markdown) as Root;

  const nodes: GovDocNode[] = [];
  for (const child of tree.children) {
    nodes.push(...convertNode(child as Content));
  }

  return { metadata, nodes };
}
